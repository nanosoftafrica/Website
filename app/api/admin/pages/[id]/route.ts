import { NextResponse } from "next/server";
import { Page, slugify } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { reservedSlugError } from "@/lib/reservedSlugs";
import { saveRevision } from "@/lib/revisions";

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
  // "Save draft": keep the edits beside the page without changing what
  // visitors see. A normal save publishes them and clears the draft.
  if (body.saveAs === "draft") {
    delete body.saveAs;
    delete body.status;
    await page.update({ draftData: { ...body, savedAt: new Date().toISOString(), savedBy: session.username } });
    await audit(session, "update", "page", page.id, `Saved a draft of page: ${page.title}`);
    return NextResponse.json(page);
  }
  if (body.saveAs === "discard") {
    await page.update({ draftData: null });
    await audit(session, "update", "page", page.id, `Discarded the draft of page: ${page.title}`);
    return NextResponse.json(page);
  }
  delete body.saveAs;
  try {
    await saveRevision("page", page, session);
    body.draftData = null;
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
