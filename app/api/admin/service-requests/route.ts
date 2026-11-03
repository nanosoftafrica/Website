import { NextResponse } from "next/server";
import { ServiceRequest } from "@/lib/serverModels";
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

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.contactId) {
    return NextResponse.json({ error: "Service request title and contact are required" }, { status: 400 });
  }
  try {
    const request = await ServiceRequest.create(pick(body));
    await audit(session, "create", "service_request", request.id, "Created service request: " + request.title);
    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
