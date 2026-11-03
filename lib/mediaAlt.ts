import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Image descriptions (alt text) for files in public/uploads, keyed by file name.
// Kept outside public/ so the list itself is never served.
const DATA_DIR = path.join(process.cwd(), "data");
const ALT_FILE = path.join(DATA_DIR, "media-alt.json");

export const MIN_ALT_LENGTH = 3;

export async function readAltMap(): Promise<Record<string, string>> {
  try {
    if (!existsSync(ALT_FILE)) return {};
    const data = JSON.parse(await readFile(ALT_FILE, "utf8"));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

async function writeAltMap(map: Record<string, string>) {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ALT_FILE, JSON.stringify(map, null, 2));
}

export function cleanAlt(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 250);
}

export async function setAlt(filename: string, alt: string) {
  const map = await readAltMap();
  map[path.basename(filename)] = alt;
  await writeAltMap(map);
}

export async function removeAlt(filename: string) {
  const map = await readAltMap();
  const key = path.basename(filename);
  if (key in map) {
    delete map[key];
    await writeAltMap(map);
  }
}
