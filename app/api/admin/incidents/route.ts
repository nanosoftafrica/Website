import { NextResponse } from "next/server";
import { Incident } from "@/lib/serverModels";
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

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.contactId) {
    return NextResponse.json({ error: "Incident title and contact are required" }, { status: 400 });
  }
  const payload = pick(body);
  payload.priority = derivePriority(String(payload.impact || "medium"), String(payload.urgency || "medium"));
  try {
    const incident = await Incident.create(payload);
    await audit(session, "create", "incident", incident.id, "Created incident: " + incident.title);
    return NextResponse.json(incident, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
