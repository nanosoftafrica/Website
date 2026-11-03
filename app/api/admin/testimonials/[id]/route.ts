import { NextResponse } from "next/server";
import { Testimonial } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim() || !body.quote || !String(body.quote).trim()) {
    return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
  }
  const t = await Testimonial.findByPk(id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await t.update(body);
    return NextResponse.json(t);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const t = await Testimonial.findByPk(id);
  if (t) await t.destroy();
  return NextResponse.json({ ok: true });
}
