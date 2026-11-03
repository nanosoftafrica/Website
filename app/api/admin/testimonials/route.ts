import { NextResponse } from "next/server";
import { Testimonial } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim() || !body.quote || !String(body.quote).trim()) {
    return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
  }
  try {
    const t = await Testimonial.create(body);
    await audit(session, "create", "testimonial", t.id, "Added testimonial: " + t.name);
    return NextResponse.json(t, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
