import { NextResponse } from "next/server";
import { Event } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const ev = await Event.findByPk(id);
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await ev.update(body);
    return NextResponse.json(ev);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const ev = await Event.findByPk(id);
  if (ev) await ev.destroy();
  return NextResponse.json({ ok: true });
}
