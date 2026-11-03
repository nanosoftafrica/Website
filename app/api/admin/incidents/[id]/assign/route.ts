import { NextResponse } from "next/server";
import { Incident, Assignment } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!["supplier", "technician"].includes(body.assigneeType) || !body.assigneeId) {
    return NextResponse.json({ error: "assigneeType (supplier|technician) and assigneeId are required" }, { status: 400 });
  }
  const incident = await Incident.findByPk(id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const assignment = await Assignment.create({
      ticketType: "incident",
      ticketId: incident.id,
      assigneeType: body.assigneeType,
      assigneeId: body.assigneeId,
    });
    await audit(session, "create", "assignment", assignment.id, `Assigned incident "${incident.title}" to a ${body.assigneeType}`);
    return NextResponse.json(assignment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
