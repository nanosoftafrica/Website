import { NextResponse } from "next/server";
import { Team } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  try {
    const member = await Team.create(body);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
