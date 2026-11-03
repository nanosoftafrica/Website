import { NextResponse } from "next/server";
import { ServiceRequest, Assignment } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

const ALLOWED_FIELDS = [
  "title",
  "description",
  "contactId",
  "companyId",
  "dealId",
  "stage",
  "value",
  "expectedDate",
  "ownerUsername",
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
    return NextResponse.json({ error: "Service request title and contact are required" }, { status: 400 });
  }
  const request = await ServiceRequest.findByPk(id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await request.update(pick(body));
    await audit(session, "update", "service_request", request.id, "Updated service request: " + request.title);
    return NextResponse.json(request);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const request = await ServiceRequest.findByPk(id);
  if (request) {
    await Assignment.destroy({ where: { ticketType: "service_request", ticketId: request.id } });
    await audit(session, "delete", "service_request", request.id, "Deleted service request: " + request.title);
    await request.destroy();
  }
  return NextResponse.json({ ok: true });
}
