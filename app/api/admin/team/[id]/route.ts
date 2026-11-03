import { NextResponse } from "next/server";
import { Team } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const member = await Team.findByPk(id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await member.update(body);
    return NextResponse.json(member);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const member = await Team.findByPk(id);
  if (member) await member.destroy();
  return NextResponse.json({ ok: true });
}
