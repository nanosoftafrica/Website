import { NextResponse } from "next/server";
import { Activity } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const activity = await Activity.findByPk(id);
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await activity.update({ completed: true });
  return NextResponse.json(activity);
}
