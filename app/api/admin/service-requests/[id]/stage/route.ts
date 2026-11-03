import { NextResponse } from "next/server";
import { ServiceRequest } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { SERVICE_REQUEST_STAGES } from "@/lib/ticketStages";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!SERVICE_REQUEST_STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }
  const request = await ServiceRequest.findByPk(id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await request.update({ stage: body.stage, order: body.order ?? 0 });
    await audit(session, "update", "service_request", request.id, `Moved service request "${request.title}" to ${request.stage}`);
    return NextResponse.json(request);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
