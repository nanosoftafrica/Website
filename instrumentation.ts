// Runs once when the server starts. Starts the nightly backup in the
// production server only (the dev server shares the same database).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production" || process.env.BACKUP_NIGHTLY === "off") return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { startNightlyBackups } = require("./lib/backupScheduler");
  startNightlyBackups();
}
