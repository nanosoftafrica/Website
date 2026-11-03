import { NextResponse } from "next/server";
import { ProductCategory } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  if (!body.slug) {
    body.slug = String(body.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  try {
    const cat = await ProductCategory.create(body);
    await audit(session, "create", "ProductCategory", cat.id, "Created category: " + cat.name);
    return NextResponse.json(cat, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
