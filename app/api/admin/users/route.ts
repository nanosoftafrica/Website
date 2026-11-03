import { NextResponse } from "next/server";
import { Admin } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await Admin.findAll({ attributes: ["id", "username", "role", "createdAt"] });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  if (!body.username || !body.password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  try {
    const user = await Admin.create({ username: String(body.username).toLowerCase(), password: body.password, role: body.role || "editor" });
    await audit(session, "create", "admin_user", user.id, "Created user: " + user.username);
    return NextResponse.json({ id: user.id, username: user.username, role: user.role }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
