import { readFile } from "fs/promises";
import path from "path";

// next start only serves public/ files that existed at build time, so images
// uploaded later are served from disk here (next.config.ts rewrites /uploads/*
// to this route only when no built-in public file matches).
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = path.basename(file);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name !== file) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(UPLOADS_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
