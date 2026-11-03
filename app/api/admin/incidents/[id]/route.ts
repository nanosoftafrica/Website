import { NextResponse } from "next/server";
import { Incident, Assignment } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { derivePriority } from "@/lib/ticketStages";

const ALLOWED_FIELDS = [
  "title",
  "description",
  "contactId",
  "companyId",
  "severity",
  "impact",
  "urgency",
  "status",
  "ownerUsername",
  "slaTargetAt",
  "notes",
] as const;

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) out[key] = body[key];
  }
  return out;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.contactId) {
    return NextResponse.json({ error: "Incident title and contact are required" }, { status: 400 });
  }
  const incident = await Incident.findByPk(id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const payload = pick(body);
  // Re-derive priority whenever impact/urgency are present in the update —
  // priority is never set directly by the client.
  if ("impact" in payload || "urgency" in payload) {
    payload.priority = derivePriority(
      String(payload.impact ?? incident.impact),
      String(payload.urgency ?? incident.urgency)
    );
  }
  try {
    await incident.update(payload);
    await audit(session, "update", "incident", incident.id, "Updated incident: " + incident.title);
    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const incident = await Incident.findByPk(id);
  if (incident) {
    await Assignment.destroy({ where: { ticketType: "incident", ticketId: incident.id } });
    await audit(session, "delete", "incident", incident.id, "Deleted incident: " + incident.title);
    await incident.destroy();
  }
  return NextResponse.json({ ok: true });
}
