import { NextResponse } from "next/server";
import { Product } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { saveRevision } from "@/lib/revisions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  const product = await Product.findByPk(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await saveRevision("product", product, session);
    await product.update(body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const product = await Product.findByPk(id);
  if (product) await product.destroy();
  return NextResponse.json({ ok: true });
}
