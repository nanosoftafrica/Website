import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireSession, unauthorized } from "@/lib/adminApi";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGE_RE = /\.(jpe?g|png|gif|webp|svg)$/i;

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  if (!existsSync(UPLOADS_DIR)) return NextResponse.json([]);

  const entries = (await readdir(UPLOADS_DIR)).filter((f) => IMAGE_RE.test(f));
  const files = await Promise.all(
    entries.map(async (f) => {
      const s = await stat(path.join(UPLOADS_DIR, f));
      return { filename: f, url: "/uploads/" + f, size: s.size, created: s.mtime };
    })
  );
  files.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  return NextResponse.json(files);
}
