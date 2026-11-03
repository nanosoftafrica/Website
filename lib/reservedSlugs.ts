// Addresses the site already uses for built-in pages. An Extra page saved
// with one of these would never show, because the built-in page wins.
export const RESERVED_PAGE_SLUGS = [
  "about", "admin", "api", "blog", "case-studies", "field-docs", "products", "team", "uploads", "login",
];

export function reservedSlugError(slug: unknown): string | null {
  const s = String(slug || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  if (RESERVED_PAGE_SLUGS.includes(s)) {
    return `The address "/${s}" is already used by a built-in page. Please choose a different address.`;
  }
  return null;
}
