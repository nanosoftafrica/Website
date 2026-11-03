import { NextResponse } from "next/server";
import { Admin, AuditLog } from "@/lib/serverModels";
import { signAdminToken, setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const admin = await Admin.findOne({ where: { username: String(username).toLowerCase() } });
  if (!admin || !(await admin.comparePassword(password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const role = admin.role || "super_admin";
  const token = signAdminToken({ id: admin.id, username: admin.username, role });
  await setAdminCookie(token);

  try {
    await AuditLog.create({
      adminUsername: admin.username,
      action: "login",
      entity: "admin",
      entityId: String(admin.id),
      summary: admin.username + " logged in",
    });
  } catch {
    // audit log failures shouldn't block login
  }

  return NextResponse.json({ username: admin.username, role });
}
