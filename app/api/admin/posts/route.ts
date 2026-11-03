import { NextResponse } from "next/server";
import { Post, resolveTagNames, setPostTags, getTagsForPost } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

function parseTagNames(v: unknown): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.title || !String(body.title).trim() || !body.slug || !String(body.slug).trim()) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }
  try {
    const tagNames = parseTagNames(body.tagNames);
    delete body.tagNames;
    if (body.status === "published" && !body.publishedAt) body.publishedAt = new Date();
    const post = await Post.create(body);
    const tagIds = await resolveTagNames(tagNames);
    await setPostTags(post.id, tagIds);
    await audit(session, "create", "post", post.id, "Created post: " + post.title);
    return NextResponse.json({ ...post.toJSON(), tags: await getTagsForPost(post.id) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
