import { NextResponse } from "next/server";
import { Page, slugify } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!body.slug) body.slug = slugify(body.title);
  try {
    const page = await Page.create(body);
    const n = (page.blocks || []).length;
    await audit(session, "create", "page", page.id, `Created page: ${page.title} (${n} block${n === 1 ? "" : "s"})`);
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
