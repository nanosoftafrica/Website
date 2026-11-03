import { NextResponse } from "next/server";
import { Tag, PostTag } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

function slugify(name: string): string {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const tag = await Tag.findByPk(id);
  if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await tag.update({ name: body.name, slug: slugify(body.name) });
    await audit(session, "update", "tag", tag.id, "Renamed tag to: " + tag.name);
    return NextResponse.json(tag);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const tag = await Tag.findByPk(id);
  if (tag) {
    await PostTag.destroy({ where: { tagId: tag.id } });
    await audit(session, "delete", "tag", tag.id, "Deleted tag: " + tag.name);
    await tag.destroy();
  }
  return NextResponse.json({ ok: true });
}
