/**
 * Absolute public URL of the site, used for canonical links, metadataBase,
 * the sitemap, robots.txt and outbound emails.
 *
 * `SITE_URL` is read at runtime, so it can be set as a plain host environment
 * variable without rebuilding. `NEXT_PUBLIC_SITE_URL` is kept as a fallback
 * (NEXT_PUBLIC_* values are inlined into the bundle at build time).
 */
const FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  // Use `||` (not `??`) so empty/blank values fall through to the next source.
  const raw = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || FALLBACK).trim();
  return (raw || FALLBACK).replace(/\/+$/, "");
}
