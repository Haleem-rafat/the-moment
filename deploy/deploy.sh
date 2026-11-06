#!/usr/bin/env bash
# Builds the site here and ships it to the server: ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SERVER="${DEPLOY_SERVER:-root@51.38.80.36}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/framecast_vps}"
APP=the-moment
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

npm run build
OUT=.next/standalone
cp -R public "$OUT/public"
mkdir -p "$OUT/.next"
cp -R .next/static "$OUT/.next/static"
cp deploy/Dockerfile "$OUT/Dockerfile"
# Only the macOS builds of native image tools land here; the site doesn't use them.
rm -rf "$OUT/node_modules/@img" "$OUT/node_modules/sharp"

rsync -az --delete -e "$SSH" "$OUT/" "$SERVER:/srv/apps/$APP/build/"
$SSH "$SERVER" "/srv/apps/bin/app-deploy $APP"
