import { NextResponse } from "next/server";
import { Deal } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.contactId) {
    return NextResponse.json({ error: "Deal title and contact are required" }, { status: 400 });
  }
  try {
    const deal = await Deal.create(body);
    await audit(session, "create", "deal", deal.id, `Created deal: ${deal.title} (${deal.currency} ${deal.value})`);
    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
