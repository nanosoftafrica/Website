import { NextResponse } from "next/server";
import { Company } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }
  const company = await Company.findByPk(id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await company.update(body);
    await audit(session, "update", "company", company.id, "Updated company: " + company.name);
    return NextResponse.json(company);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const company = await Company.findByPk(id);
  if (company) {
    await audit(session, "delete", "company", company.id, "Deleted company: " + company.name);
    await company.destroy();
  }
  return NextResponse.json({ ok: true });
}
