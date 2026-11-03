import { NextResponse } from "next/server";
import { Deal } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.contactId) {
    return NextResponse.json({ error: "Deal title and contact are required" }, { status: 400 });
  }
  const deal = await Deal.findByPk(id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await deal.update(body);
    await audit(session, "update", "deal", deal.id, "Updated deal: " + deal.title);
    return NextResponse.json(deal);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const deal = await Deal.findByPk(id);
  if (deal) {
    await audit(session, "delete", "deal", deal.id, "Deleted deal: " + deal.title);
    await deal.destroy();
  }
  return NextResponse.json({ ok: true });
}
