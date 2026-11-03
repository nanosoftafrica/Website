import { NextResponse } from "next/server";
import { Message } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const msg = await Message.findByPk(id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await msg.update({ read: true });
  return NextResponse.json(msg);
}
