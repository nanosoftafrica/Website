import { NextResponse } from "next/server";
import { Admin } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PUT(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
  }
  if (String(newPassword).length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  const admin = await Admin.findByPk(session.id);
  if (!admin || !(await admin.comparePassword(currentPassword))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }
  admin.password = newPassword;
  await admin.save();
  return NextResponse.json({ ok: true });
}
