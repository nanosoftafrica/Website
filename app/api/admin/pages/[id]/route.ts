import { NextResponse } from "next/server";
import { Page, slugify } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { reservedSlugError } from "@/lib/reservedSlugs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const page = await Page.findByPk(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!body.slug) body.slug = slugify(body.title);
  const slugError = reservedSlugError(body.slug);
  if (slugError) return NextResponse.json({ error: slugError }, { status: 400 });
  try {
    const beforeCount = page.blocks.length;
    await page.update(body);
    const afterCount = page.blocks.length;
    const blockNote = beforeCount === afterCount ? `${afterCount} block${afterCount === 1 ? "" : "s"}` : `${beforeCount} → ${afterCount} blocks`;
    await audit(session, "update", "page", page.id, `Updated page: ${page.title} (${blockNote}, ${page.status})`);
    return NextResponse.json(page);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const page = await Page.findByPk(id);
  if (page) {
    await audit(session, "delete", "page", page.id, "Deleted page: " + page.title);
    await page.destroy();
  }
  return NextResponse.json({ ok: true });
}
