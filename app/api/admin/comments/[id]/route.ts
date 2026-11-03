import { NextResponse } from "next/server";
import { Comment } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const comment = await Comment.findByPk(id);
  if (comment) {
    await audit(session, "delete", "comment", comment.id, "Deleted comment by " + comment.name);
    await comment.destroy();
  }
  return NextResponse.json({ ok: true });
}
