import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { getWahaStatus } from "@/lib/wahaService";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const status = await getWahaStatus();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      { connected: false, status: "OFFLINE", message: (err as Error).message },
      { status: 500 }
    );
  }
}
