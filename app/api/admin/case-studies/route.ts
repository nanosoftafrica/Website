import { NextResponse } from "next/server";
import { CaseStudy } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.slug || !String(body.slug).trim() || !body.client || !String(body.client).trim()) {
    return NextResponse.json({ error: "Title, slug and client are required" }, { status: 400 });
  }
  try {
    const cs = await CaseStudy.create(body);
    await audit(session, "create", "case_study", cs.id, "Added case study: " + cs.title);
    return NextResponse.json(cs, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
