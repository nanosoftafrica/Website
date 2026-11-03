import { NextResponse } from "next/server";
import { MenuItem } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.label || !String(body.label).trim() || !body.href || !String(body.href).trim()) {
    return NextResponse.json({ error: "Label and link are required" }, { status: 400 });
  }
  const item = await MenuItem.findByPk(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await item.update(body);
    await audit(session, "update", "menu_item", item.id, "Updated menu item: " + item.label);
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const item = await MenuItem.findByPk(id);
  if (item) {
    await audit(session, "delete", "menu_item", item.id, "Deleted menu item: " + item.label);
    await item.destroy();
  }
  return NextResponse.json({ ok: true });
}
