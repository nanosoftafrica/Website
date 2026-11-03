import { NextResponse } from "next/server";
import { Deal } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

const DEAL_STAGES = ["new", "contacted", "qualified", "won", "lost"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!DEAL_STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }
  const deal = await Deal.findByPk(id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await deal.update({ stage: body.stage, order: body.order ?? 0 });
    await audit(session, "update", "deal", deal.id, `Moved deal "${deal.title}" to ${deal.stage}`);
    return NextResponse.json(deal);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
