import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build for the Docker image; see deploy/deploy.sh.
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"] },
  // A private, unlisted link: ask every crawler to stay away.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
