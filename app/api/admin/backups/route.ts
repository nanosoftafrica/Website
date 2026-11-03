import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { hasFullAccess } from "@/lib/adminRoles";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runBackup, listBackups, KEEP } = require("../../../../lib/backup");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BACKUP_HOUR } = require("../../../../lib/backupScheduler");

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function summary() {
  const all = listBackups();
  return {
    last: all[0] || null,
    recent: all.slice(0, 5),
    count: all.length,
    keep: KEEP,
    nightlyHour: BACKUP_HOUR,
    nightlyOn: process.env.NODE_ENV === "production" && process.env.BACKUP_NIGHTLY !== "off",
  };
}

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasFullAccess(session.role)) return NextResponse.json({ error: "Only a super admin can see backups." }, { status: 403 });
  return NextResponse.json(summary());
}

export async function POST() {
  const session = await requireSession();
  if (!session) return unauthorized();
  if (!hasFullAccess(session.role)) return NextResponse.json({ error: "Only a super admin can make backups." }, { status: 403 });
  try {
    const b = await runBackup({ reason: "manual", by: session.username });
    await audit(session, "create", "backup", 0, `Backed up the website: ${b.folder}`);
    return NextResponse.json({ ok: true, backup: b, ...summary() });
  } catch (err) {
    return NextResponse.json({ error: "The backup didn't finish: " + (err as Error).message }, { status: 500 });
  }
}
