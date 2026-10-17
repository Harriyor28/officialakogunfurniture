/**
 * Absolute public URL of the site, used for canonical links, metadataBase,
 * the sitemap, robots.txt and outbound emails.
 *
 * `SITE_URL` is read at runtime, so it can be set as a plain host environment
 * variable without rebuilding. `NEXT_PUBLIC_SITE_URL` is kept as a fallback
 * (NEXT_PUBLIC_* values are inlined into the bundle at build time).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
