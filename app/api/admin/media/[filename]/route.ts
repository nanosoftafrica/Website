import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { cleanAlt, MIN_ALT_LENGTH, removeAlt, setAlt } from "@/lib/mediaAlt";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Change an image's description.
export async function PUT(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { filename } = await params;
  const safe = path.basename(filename);
  if (!existsSync(path.join(UPLOADS_DIR, safe))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const alt = cleanAlt(body.alt);
  if (alt.length < MIN_ALT_LENGTH) {
    return NextResponse.json({ error: "Please describe the image in a few words." }, { status: 400 });
  }
  await setAlt(safe, alt);
  return NextResponse.json({ ok: true, alt });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { filename } = await params;
  const safe = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safe);
  try {
    if (existsSync(filePath)) await unlink(filePath);
    await removeAlt(safe);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
