import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireSession, unauthorized } from "@/lib/adminApi";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function DELETE(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { filename } = await params;
  const safe = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safe);
  try {
    if (existsSync(filePath)) await unlink(filePath);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
