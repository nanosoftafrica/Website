import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireSession, unauthorized } from "@/lib/adminApi";
import { cleanAlt, MIN_ALT_LENGTH, setAlt } from "@/lib/mediaAlt";

// Saved to public/uploads; files added after the build are served by
// app/api/uploads/[file], so no custom serving route is needed.
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
// Photos are shrunk before saving, so a big phone photo is fine to accept.
// GIFs are saved as they are (to keep animations), so they keep the lower cap.
// next.config.ts raises the proxy body limit above MAX_SIZE to match.
const MAX_SIZE = 20 * 1024 * 1024;
const MAX_GIF_SIZE = 5 * 1024 * 1024;
const MAX_WIDTH = 1920;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

// Shrinks a photo before it is saved: turns it the right way up, caps the
// width at 1920px and re-compresses it. GIFs are kept as they are so
// animations survive. If shrinking would not make the file smaller, the
// original is kept.
async function shrink(buffer: Buffer, ext: string): Promise<{ data: Buffer; ext: string }> {
  if (ext === ".gif") return { data: buffer, ext };
  try {
    const sharp = (await import("sharp")).default;
    let img = sharp(buffer, { failOn: "error" }).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
    let outExt = ext === ".jpeg" ? ".jpg" : ext;
    if (outExt === ".jpg") img = img.jpeg({ quality: 80, mozjpeg: true });
    else if (outExt === ".png") img = img.png({ compressionLevel: 9, palette: true, quality: 85 });
    else if (outExt === ".webp") img = img.webp({ quality: 80 });
    else outExt = ext;
    const out = await img.toBuffer();
    return out.length < buffer.length ? { data: out, ext: outExt } : { data: buffer, ext };
  } catch {
    throw new Error("This file could not be read as an image.");
  }
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const alt = cleanAlt(formData.get("alt"));
  if (alt.length < MIN_ALT_LENGTH) {
    return NextResponse.json(
      { error: "Please describe the image in a few words first. This helps visitors who can't see it, and search engines." },
      { status: 400 }
    );
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext) || !/^image\//i.test(file.type)) {
    return NextResponse.json({ error: "Images only (jpg, png, gif, webp)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
  }
  if (ext === ".gif" && file.size > MAX_GIF_SIZE) {
    return NextResponse.json({ error: "GIF too large (max 5 MB). GIFs aren't shrunk, so they keep the lower limit." }, { status: 400 });
  }

  let shrunk: { data: Buffer; ext: string };
  try {
    shrunk = await shrink(Buffer.from(await file.arrayBuffer()), ext);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = Date.now() + "-" + Math.random().toString(36).slice(2) + shrunk.ext;
  await writeFile(path.join(UPLOADS_DIR, filename), shrunk.data);
  await setAlt(filename, alt);

  return NextResponse.json({ url: "/uploads/" + filename, filename, alt, size: shrunk.data.length, originalSize: file.size });
}
