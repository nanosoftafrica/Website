import { NextResponse } from "next/server";
import { Incident } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { INCIDENT_STATUSES } from "@/lib/ticketStages";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!INCIDENT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const incident = await Incident.findByPk(id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasResolvedOrClosed = incident.status === "resolved" || incident.status === "closed";
  const isResolvedOrClosed = body.status === "resolved" || body.status === "closed";

  const update: Record<string, unknown> = { status: body.status, order: body.order ?? 0 };
  if (!wasResolvedOrClosed && isResolvedOrClosed) {
    // Entering resolved/closed: stamp whichever timestamps aren't set yet.
    const now = new Date();
    if (!incident.resolvedAt) update.resolvedAt = now;
    if (body.status === "closed" && !incident.closedAt) update.closedAt = now;
  } else if (wasResolvedOrClosed && !isResolvedOrClosed) {
    // Leaving resolved/closed back to an earlier status: clear both.
    update.resolvedAt = null;
    update.closedAt = null;
  } else if (body.status === "closed" && !incident.closedAt) {
    update.closedAt = new Date();
  }

  try {
    await incident.update(update);
    await audit(session, "update", "incident", incident.id, `Moved incident "${incident.title}" to ${incident.status}`);
    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
