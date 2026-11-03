import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { listWhatsAppMessages } from "@/lib/wahaService";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const messages = await listWhatsAppMessages(50);
    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
