// "Undo last save" for website items. Before an admin save overwrites an
// item, its current state is stored in content_revisions; undo writes the
// newest stored state back and removes it, so pressing undo again steps
// further back. Up to KEEP states are kept per item.
import type { AdminSession } from "./adminAuth";
import { Page, Post, Product, CaseStudy, Content, setPostTags, getTagsForPost } from "./serverModels";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ContentRevision = require("../server/models/platform/ContentRevision");

/* eslint-disable @typescript-eslint/no-explicit-any */

const KEEP = 20;
const MODELS: Record<string, any> = { page: Page, post: Post, product: Product, case_study: CaseStudy, content: Content };
const SKIP = new Set(["id", "createdAt", "updatedAt", "draftData"]);

export const UNDO_ENTITIES = Object.keys(MODELS);

function snapshotOf(row: any): Record<string, any> {
  const json = row.toJSON();
  const snap: Record<string, any> = {};
  for (const [k, v] of Object.entries(json)) if (!SKIP.has(k)) snap[k] = v;
  return snap;
}

export async function saveRevision(entity: string, row: any, session: AdminSession | null): Promise<void> {
  if (!MODELS[entity] || !row) return;
  try {
    const snapshot = snapshotOf(row);
    if (entity === "post") snapshot.__tagIds = (await getTagsForPost(row.id)).map((t: any) => t.id);
    await ContentRevision.create({ entity, entityId: row.id, snapshot, adminUsername: session?.username || null });
    const older = await ContentRevision.findAll({
      where: { entity, entityId: row.id },
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      offset: KEEP,
      attributes: ["id"],
    });
    if (older.length) await ContentRevision.destroy({ where: { id: older.map((r: any) => r.id) } });
  } catch (err) {
    // Never block a save because the undo copy failed.
    console.error("[undo] could not keep the previous version:", (err as Error).message);
  }
}

async function latest(entity: string, id: number) {
  return ContentRevision.findOne({ where: { entity, entityId: id }, order: [["createdAt", "DESC"], ["id", "DESC"]] });
}

export async function lastRevisionInfo(entity: string, id: number) {
  if (!MODELS[entity]) return null;
  const rev = await latest(entity, id);
  return rev ? { savedAt: rev.createdAt, by: rev.adminUsername } : null;
}

export async function undoLastSave(entity: string, id: number): Promise<any | null> {
  const Model = MODELS[entity];
  if (!Model) return null;
  const rev = await latest(entity, id);
  if (!rev) return null;
  const row = await Model.findByPk(id);
  if (!row) return null;
  const { __tagIds, ...values } = rev.snapshot || {};
  row.set(values);
  for (const k of Object.keys(values)) row.changed(k, true);
  await row.save();
  if (entity === "post" && Array.isArray(__tagIds)) await setPostTags(row.id, __tagIds);
  await rev.destroy();
  return row;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
