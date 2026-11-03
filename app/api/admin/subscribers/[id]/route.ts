import { NextResponse } from "next/server";
import { Subscriber } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const s = await Subscriber.findByPk(id);
  if (s) await s.destroy();
  return NextResponse.json({ ok: true });
}
