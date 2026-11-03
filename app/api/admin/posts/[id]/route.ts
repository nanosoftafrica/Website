import { NextResponse } from "next/server";
import { Post, resolveTagNames, setPostTags, getTagsForPost } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { saveRevision } from "@/lib/revisions";

function parseTagNames(v: unknown): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.slug || !String(body.slug).trim()) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }
  const post = await Post.findByPk(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // "Save draft": keep the edits beside the post without changing what
  // visitors see. A normal save publishes them and clears the draft.
  if (body.saveAs === "draft") {
    delete body.saveAs;
    delete body.status;
    await post.update({ draftData: { ...body, savedAt: new Date().toISOString(), savedBy: session.username } });
    await audit(session, "update", "post", post.id, "Saved a draft of post: " + post.title);
    return NextResponse.json({ ...post.toJSON(), tags: await getTagsForPost(post.id) });
  }
  if (body.saveAs === "discard") {
    await post.update({ draftData: null });
    await audit(session, "update", "post", post.id, "Discarded the draft of post: " + post.title);
    return NextResponse.json({ ...post.toJSON(), tags: await getTagsForPost(post.id) });
  }
  delete body.saveAs;
  try {
    await saveRevision("post", post, session);
    body.draftData = null;
    const hasTagNames = body.tagNames !== undefined;
    const tagNames = parseTagNames(body.tagNames);
    delete body.tagNames;
    if (body.status === "published" && !post.publishedAt && !body.publishedAt) body.publishedAt = new Date();
    await post.update(body);
    if (hasTagNames) {
      const tagIds = await resolveTagNames(tagNames);
      await setPostTags(post.id, tagIds);
    }
    await audit(session, "update", "post", post.id, "Updated post: " + post.title);
    return NextResponse.json({ ...post.toJSON(), tags: await getTagsForPost(post.id) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const post = await Post.findByPk(id);
  if (post) {
    await audit(session, "delete", "post", post.id, "Deleted post: " + post.title);
    await post.destroy();
  }
  return NextResponse.json({ ok: true });
}
