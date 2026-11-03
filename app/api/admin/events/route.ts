import { NextResponse } from "next/server";
import { Event } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  try {
    const ev = await Event.create(body);
    return NextResponse.json(ev, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
