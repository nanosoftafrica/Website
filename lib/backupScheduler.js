/* eslint-disable @typescript-eslint/no-require-imports */
// Nightly backup inside the running production server. Checks every 10
// minutes; once the clock passes BACKUP_HOUR (default 2, server time) and
// today has no nightly backup yet, it makes one. A server that was off at
// that hour catches up when it starts. Turn off with BACKUP_NIGHTLY=off.
const { runBackup, listBackups } = require('./backup');

const HOUR = Math.min(23, Math.max(0, parseInt(process.env.BACKUP_HOUR || '2', 10) || 2));
let started = false;

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

async function tick() {
  const now = new Date();
  if (now.getHours() < HOUR) return;
  const doneToday = listBackups().some((b) => b.reason === 'nightly' && sameDay(new Date(b.createdAt), now));
  if (doneToday) return;
  try {
    const b = await runBackup({ reason: 'nightly' });
    console.log(`[backup] nightly backup saved: ${b.folder}`);
  } catch (err) {
    console.error('[backup] nightly backup failed:', err.message);
  }
}

function startNightlyBackups() {
  if (started) return;
  started = true;
  setTimeout(tick, 60 * 1000).unref?.();
  setInterval(tick, 10 * 60 * 1000).unref?.();
}

module.exports = { startNightlyBackups, BACKUP_HOUR: HOUR };
