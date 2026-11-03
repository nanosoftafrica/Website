import { NextResponse } from "next/server";
import { Message } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const msg = await Message.findByPk(id);
  if (msg) await msg.destroy();
  return NextResponse.json({ ok: true });
}
