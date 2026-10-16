export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** Ensure a slug is unique by appending -2, -3, ... when needed. */
export function uniqueSlug(base: string, existing: string[]): string {
  let slug = base;
  let n = 2;
  const set = new Set(existing);
  while (set.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}
