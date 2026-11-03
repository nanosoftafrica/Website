import { NextResponse } from "next/server";
import { Supplier } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const suppliers = await Supplier.findAll({ order: [["name", "ASC"]] });
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
  }
  try {
    const supplier = await Supplier.create(body);
    await audit(session, "create", "supplier", supplier.id, "Created supplier: " + supplier.name);
    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
