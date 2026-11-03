import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

// Optimistic auth check only (per Next.js guidance: proxy should read the
// cookie, not hit the DB) — every mutating Route Handler re-verifies the
// session independently, this just keeps unauthenticated users off the
// admin pages themselves.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  let valid = false;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET as string);
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
