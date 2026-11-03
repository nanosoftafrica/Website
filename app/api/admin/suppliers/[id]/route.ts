import { NextResponse } from "next/server";
import { Supplier } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
  }
  const supplier = await Supplier.findByPk(id);
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await supplier.update(body);
    await audit(session, "update", "supplier", supplier.id, "Updated supplier: " + supplier.name);
    return NextResponse.json(supplier);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const supplier = await Supplier.findByPk(id);
  if (supplier) {
    await audit(session, "delete", "supplier", supplier.id, "Deleted supplier: " + supplier.name);
    await supplier.destroy();
  }
  return NextResponse.json({ ok: true });
}
