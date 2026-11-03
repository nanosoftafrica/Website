import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { getServiceRequestsBoard } from "@/lib/adminDb";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  return NextResponse.json(await getServiceRequestsBoard());
}
