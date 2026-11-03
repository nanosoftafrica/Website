import { NextResponse } from "next/server";
import { Activity } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.type) {
    return NextResponse.json({ error: "Activity type is required" }, { status: 400 });
  }
  try {
    const activity = await Activity.create(body);
    await audit(session, "create", "activity", activity.id, "Logged " + activity.type + (activity.subject ? ": " + activity.subject : ""));
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
