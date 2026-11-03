import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const ADMIN_COOKIE = "admin_session";

export interface AdminSession {
  id: number;
  username: string;
  role: string;
}

export function signAdminToken(payload: AdminSession): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
