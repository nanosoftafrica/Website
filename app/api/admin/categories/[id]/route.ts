import { NextResponse } from "next/server";
import { ProductCategory } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  const cat = await ProductCategory.findByPk(id);
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await cat.update(body);
    await audit(session, "update", "ProductCategory", cat.id, "Updated category: " + cat.name);
    return NextResponse.json(cat);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const cat = await ProductCategory.findByPk(id);
  if (cat) {
    await audit(session, "delete", "ProductCategory", cat.id, "Deleted category: " + cat.name);
    await cat.destroy();
  }
  return NextResponse.json({ ok: true });
}
