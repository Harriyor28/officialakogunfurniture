import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is disabled: this platform is heavily authenticated and
  // database-driven (admin, portal, quotations). Pages that read the database
  // opt into per-request rendering with `export const dynamic = "force-dynamic"`.
  // The marketing pages can be moved to `use cache` later without API changes.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@prisma/client", "better-sqlite3"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/portal/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  images: {
    // Some shipped placeholder artwork and uploaded logos are SVG. The
    // optimizer refuses SVG unless this is enabled, which previously left
    // those images showing as a broken/corrupt icon.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Uploaded images live under /uploads; demo art under /demo.
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/demo/**" },
      { pathname: "/images/**" },
    ],
    qualities: [60, 75, 100],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
