import { NextResponse } from "next/server";
import { Technician } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const technicians = await Technician.findAll({ order: [["name", "ASC"]] });
  return NextResponse.json(technicians);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Technician name is required" }, { status: 400 });
  }
  try {
    const technician = await Technician.create(body);
    await audit(session, "create", "technician", technician.id, "Created technician: " + technician.name);
    return NextResponse.json(technician, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
