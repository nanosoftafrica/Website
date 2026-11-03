import { NextResponse } from "next/server";
import { Comment } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const comment = await Comment.findByPk(id);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await comment.update({ status: "approved" });
  await audit(session, "update", "comment", comment.id, "Approved comment by " + comment.name);
  return NextResponse.json(comment);
}
