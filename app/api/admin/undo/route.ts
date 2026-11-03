import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { lastRevisionInfo, undoLastSave, UNDO_ENTITIES } from "@/lib/revisions";
import { getTagsForPost } from "@/lib/serverModels";

export const dynamic = "force-dynamic";

function parse(entity: unknown, id: unknown) {
  const e = String(entity || "");
  const n = parseInt(String(id || ""), 10);
  return UNDO_ENTITIES.includes(e) && n > 0 ? { entity: e, id: n } : null;
}

// GET ?entity=page&id=3 → whether there is a save to undo.
export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const url = new URL(req.url);
  const target = parse(url.searchParams.get("entity"), url.searchParams.get("id"));
  if (!target) return NextResponse.json({ error: "Unknown item" }, { status: 400 });
  const info = await lastRevisionInfo(target.entity, target.id);
  return NextResponse.json({ available: !!info, ...(info || {}) });
}

// POST { entity, id } → put back the version from before the last save.
export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const target = parse(body.entity, body.id);
  if (!target) return NextResponse.json({ error: "Unknown item" }, { status: 400 });
  const row = await undoLastSave(target.entity, target.id);
  if (!row) return NextResponse.json({ error: "There's no earlier save to go back to." }, { status: 404 });
  await audit(session, "update", target.entity, target.id, `Undid the last save of ${target.entity.replace("_", " ")} #${target.id}`);
  const json = row.toJSON();
  const item = target.entity === "post" ? { ...json, tags: await getTagsForPost(row.id) } : json;
  const info = await lastRevisionInfo(target.entity, target.id);
  return NextResponse.json({ ok: true, item, available: !!info, ...(info || {}) });
}
