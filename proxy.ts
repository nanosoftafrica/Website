import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { roleCanOpen } from "@/lib/adminRoles";
import { MAX_UPLOAD_BYTES, TOO_LARGE_MESSAGE } from "@/lib/uploadLimits";

// Admin pages: send signed-out visitors to the login page. Pages and API
// calls: block any area the signed-in role can't use (Marketing gets the
// Website area only). Every mutating Route Handler still re-checks the
// session itself.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  let role: string | undefined;
  let valid = false;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { role?: string };
      role = payload.role;
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    return isApi ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (!roleCanOpen(role, pathname)) {
    return isApi
      ? NextResponse.json({ error: "Your account can't use this part of admin." }, { status: 403 })
      : NextResponse.redirect(new URL("/admin/start", request.url));
  }
  // Refuse an oversized upload here, from its declared size, so it gets the
  // friendly message instead of being cut off at the proxy body limit.
  // The extra 1 MB allows for the form wrapping around the file.
  if (pathname === "/api/admin/upload") {
    const declared = Number(request.headers.get("content-length") || 0);
    if (declared > MAX_UPLOAD_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: TOO_LARGE_MESSAGE }, { status: 413 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
