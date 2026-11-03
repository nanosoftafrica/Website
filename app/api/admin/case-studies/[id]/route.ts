import { NextResponse } from "next/server";
import { CaseStudy } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { saveRevision } from "@/lib/revisions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.slug || !String(body.slug).trim() || !body.client || !String(body.client).trim()) {
    return NextResponse.json({ error: "Title, slug and client are required" }, { status: 400 });
  }
  const cs = await CaseStudy.findByPk(id);
  if (!cs) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await saveRevision("case_study", cs, session);
    await cs.update(body);
    await audit(session, "update", "case_study", cs.id, "Updated case study: " + cs.title);
    return NextResponse.json(cs);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const cs = await CaseStudy.findByPk(id);
  if (cs) {
    await audit(session, "delete", "case_study", cs.id, "Deleted case study: " + cs.title);
    await cs.destroy();
  }
  return NextResponse.json({ ok: true });
}
