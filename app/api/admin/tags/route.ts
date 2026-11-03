import { NextResponse } from "next/server";
import { Tag } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

function slugify(name: string): string {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const tags = await Tag.findAll({ order: [["name", "ASC"]] });
  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const slug = slugify(body.name);
  try {
    const [tag, created] = await Tag.findOrCreate({ where: { slug }, defaults: { name: body.name, slug } });
    if (!created) {
      return NextResponse.json({ error: "A tag with that name already exists" }, { status: 400 });
    }
    await audit(session, "create", "tag", tag.id, "Created tag: " + tag.name);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
