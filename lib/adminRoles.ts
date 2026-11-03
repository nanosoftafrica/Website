// Admin roles. "super_admin" can use everything. Any other role (the
// "editor" role, shown as Marketing) can use only the Website area. This is
// checked in proxy.ts for every /admin page and /api/admin call, so hiding
// menu links is not the only protection.
export const FULL_ACCESS_ROLE = "super_admin";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  editor: "Marketing",
};

export function roleLabel(role: string | undefined): string {
  return ROLE_LABELS[role || ""] || role || "";
}

const WEBSITE_PAGES = [
  "/admin/start", "/admin/content", "/admin/products", "/admin/categories", "/admin/posts",
  "/admin/comments", "/admin/pages", "/admin/media", "/admin/case-studies", "/admin/events",
  "/admin/team", "/admin/testimonials", "/admin/menu",
];

const WEBSITE_APIS = [
  "/api/admin/content", "/api/admin/products", "/api/admin/categories", "/api/admin/posts",
  "/api/admin/comments", "/api/admin/pages", "/api/admin/media", "/api/admin/upload",
  "/api/admin/case-studies", "/api/admin/events", "/api/admin/team", "/api/admin/testimonials",
  "/api/admin/menu", "/api/admin/undo", "/api/admin/password", "/api/admin/logout", "/api/admin/login",
];

const under = (p: string, list: string[]) => list.some((b) => p === b || p.startsWith(b + "/"));

export function hasFullAccess(role: string | undefined): boolean {
  return role === FULL_ACCESS_ROLE;
}

export function roleCanOpen(role: string | undefined, pathname: string): boolean {
  if (hasFullAccess(role)) return true;
  if (pathname.startsWith("/api/")) return under(pathname, WEBSITE_APIS);
  return pathname === "/admin" || pathname === "/admin/login" || under(pathname, WEBSITE_PAGES);
}
