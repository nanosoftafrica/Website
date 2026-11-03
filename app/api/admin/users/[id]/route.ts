import { NextResponse } from "next/server";
import { Admin } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const user = await Admin.findByPk(id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { username, password, role } = body;
  const updates: Record<string, string> = {};
  if (username) updates.username = String(username).toLowerCase().trim();
  if (role) updates.role = role;
  if (Object.keys(updates).length) await user.update(updates);
  if (password) {
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    user.password = password;
    await user.save();
  }
  await audit(session, "update", "admin_user", user.id, "Updated user: " + user.username);
  return NextResponse.json({ id: user.id, username: user.username, role: user.role });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (String(id) === String(session.id)) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }
  const user = await Admin.findByPk(id);
  if (user) {
    await audit(session, "delete", "admin_user", user.id, "Deleted user: " + user.username);
    await user.destroy();
  }
  return NextResponse.json({ ok: true });
}
