import { NextResponse } from "next/server";
import { Technician } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Technician name is required" }, { status: 400 });
  }
  const technician = await Technician.findByPk(id);
  if (!technician) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await technician.update(body);
    await audit(session, "update", "technician", technician.id, "Updated technician: " + technician.name);
    return NextResponse.json(technician);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const technician = await Technician.findByPk(id);
  if (technician) {
    await audit(session, "delete", "technician", technician.id, "Deleted technician: " + technician.name);
    await technician.destroy();
  }
  return NextResponse.json({ ok: true });
}
