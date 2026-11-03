import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireSession, unauthorized } from "@/lib/adminApi";

// Saved to public/uploads; files added after the build are served by
// app/api/uploads/[file] — no custom serving route needed.
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext) || !/^image\//i.test(file.type)) {
    return NextResponse.json({ error: "Images only (jpg, png, gif, webp)" }, { status: 400 });
  }

  if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });

  const filename = Date.now() + "-" + Math.random().toString(36).slice(2) + ext;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ url: "/uploads/" + filename, filename });
}
