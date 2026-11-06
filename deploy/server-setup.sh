#!/usr/bin/env bash
# One-time setup of the multi-project system on the Framecast server. Run from this
# computer:  ssh -i ~/.ssh/framecast_vps root@51.38.80.36 'bash -s' < deploy/server-setup.sh
#
# It backs up Framecast's Caddyfile and docker-compose.yml, tests the new versions,
# then recreates only the Caddy container (a few seconds). If framecasts.com or
# staging stop answering afterwards, it puts the old files back by itself.
set -euo pipefail

TS=$(date +%Y%m%d-%H%M%S)
mkdir -p /srv/apps/bin /srv/apps/sites /srv/apps/backups /srv/apps/_template /srv/apps/the-moment/build
cd /srv/framecast
if grep -q 'import /etc/caddy/sites' Caddyfile; then echo "Already set up; nothing to do."; exit 0; fi
cp -p Caddyfile "/srv/apps/backups/Caddyfile.$TS"
cp -p docker-compose.yml "/srv/apps/backups/docker-compose.yml.$TS"
docker ps --format '{{.Names}} {{.ID}}' | sort > /tmp/before.txt
docker network inspect apps >/dev/null 2>&1 || docker network create apps >/dev/null

cat > /srv/apps/bin/app-deploy <<'EOF'
#!/usr/bin/env bash
# Builds and starts /srv/apps/<app> from its build/ folder; goes back to the previous image if it won't start.
set -euo pipefail
APP="${1:?usage: app-deploy <app>}"
cd "/srv/apps/$APP"
if docker image inspect "$APP:latest" >/dev/null 2>&1; then docker tag "$APP:latest" "$APP:previous"; fi
if docker compose up -d --build --wait --wait-timeout 90; then
  echo "$APP is running"
else
  echo "$APP failed to start" >&2
  if docker image inspect "$APP:previous" >/dev/null 2>&1; then
    docker tag "$APP:previous" "$APP:latest"
    docker compose up -d --no-build || true
    echo "rolled back to the previous version" >&2
  fi
  exit 1
fi
docker image prune -f >/dev/null
EOF

cat > /srv/apps/bin/app-site <<'EOF'
#!/usr/bin/env bash
# Publishes an app on a subdomain with HTTPS, with no downtime: app-site <app> <subdomain.domain> [port]
set -euo pipefail
APP="${1:?usage: app-site <app> <host> [port]}"; HOST="${2:?host}"; PORT="${3:-3000}"
FILE="/srv/apps/sites/$APP.caddy"; OLD=""
if [ -f "$FILE" ]; then OLD=$(cat "$FILE"); fi
cat > "$FILE" <<SITE
$HOST {
	header X-Robots-Tag "noindex, nofollow"
	encode zstd gzip
	reverse_proxy $APP:$PORT
}
SITE
if ! docker exec framecast-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile; then
  if [ -n "$OLD" ]; then printf '%s\n' "$OLD" > "$FILE"; else rm -f "$FILE"; fi
  echo "Caddy refused the change; nothing was published" >&2
  exit 1
fi
echo "https://$HOST -> $APP:$PORT"
EOF
chmod +x /srv/apps/bin/app-deploy /srv/apps/bin/app-site

cat > /srv/apps/_template/compose.yml <<'EOF'
# Copy to /srv/apps/<app>/compose.yml and replace APP_NAME. build/ must hold a Dockerfile.
name: APP_NAME
services:
  web:
    build: ./build
    image: APP_NAME:latest
    container_name: APP_NAME
    restart: unless-stopped
    mem_limit: 256m
    cpus: 0.5
    pids_limit: 200
    read_only: true
    tmpfs:
      - /tmp
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    logging:
      driver: json-file
      options: { max-size: "10m", max-file: "3" }
    networks: [apps]
networks:
  apps:
    external: true
EOF
sed 's/APP_NAME/the-moment/g' /srv/apps/_template/compose.yml > /srv/apps/the-moment/compose.yml
sed -i 's#^      - /tmp$#      - /tmp\n      - /app/.next/cache:uid=1000,gid=1000#' /srv/apps/the-moment/compose.yml

cat > /srv/apps/README.md <<'EOF'
# Apps on this server

Framecast (/srv/framecast) owns Caddy. Other projects live here, each in its own
container on the `apps` network, which can't reach Framecast's database.

Add a project:
1. mkdir -p /srv/apps/<app>/build and copy _template/compose.yml to /srv/apps/<app>/compose.yml
2. Put the project with its Dockerfile in build/ (build heavy projects elsewhere first)
3. /srv/apps/bin/app-deploy <app>
4. /srv/apps/bin/app-site <app> <subdomain>.framecasts.com [port]

Remove a subdomain: delete sites/<app>.caddy, then
docker exec framecast-caddy-1 caddy reload --config /etc/caddy/Caddyfile
EOF

# New configs, tested before they replace anything.
cp Caddyfile /tmp/Caddyfile.new
printf '\n# Other projects: one file per subdomain, see /srv/apps/README.md\nimport /etc/caddy/sites/*.caddy\n' >> /tmp/Caddyfile.new
python3 - <<'PY'
s = open('/srv/framecast/docker-compose.yml').read()
a = "      - caddy-config:/config\n    depends_on: [app-prod, app-staging]\n"
assert s.count(a) == 1
s = s.replace(a, "      - caddy-config:/config\n      - /srv/apps/sites:/etc/caddy/sites:ro\n    networks: [default, apps]\n    depends_on: [app-prod, app-staging]\n")
assert "\nnetworks:" not in s
a = "\nvolumes:\n  caddy-data:"
assert s.count(a) == 1
s = s.replace(a, "\nnetworks:\n  apps:\n    external: true\n" + a)
open('/tmp/docker-compose.new', 'w').write(s)
PY
docker run --rm -v /tmp/Caddyfile.new:/etc/caddy/Caddyfile:ro -v /srv/apps/sites:/etc/caddy/sites:ro \
  caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile 2>&1 | tail -1
docker compose --project-directory /srv/framecast -p framecast -f /tmp/docker-compose.new config -q
echo "New configs are valid."

health() {
  for h in framecasts.com staging.framecasts.com; do
    curl -s -o /dev/null -m 15 -w "$h %{http_code}\n" --resolve "$h:443:127.0.0.1" "https://$h/" || echo "$h 000"
  done
}
echo "--- before"; health

cp /tmp/Caddyfile.new Caddyfile
cp /tmp/docker-compose.new docker-compose.yml
docker compose up -d --no-deps caddy 2>&1 | tail -2
sleep 3

echo "--- after"
OUT=$(health); echo "$OUT"
if echo "$OUT" | grep -vE ' (200|30[0-9]|401)$' | grep -q .; then
  echo "NOT HEALTHY: putting the old files back"
  cp "/srv/apps/backups/Caddyfile.$TS" Caddyfile
  cp "/srv/apps/backups/docker-compose.yml.$TS" docker-compose.yml
  docker compose up -d --no-deps caddy
  sleep 3
  health
  exit 1
fi

docker ps --format '{{.Names}} {{.ID}}' | sort > /tmp/after.txt
echo "--- containers that changed (should be Caddy only):"
diff /tmp/before.txt /tmp/after.txt | grep '^>' || true
echo "Setup done."
