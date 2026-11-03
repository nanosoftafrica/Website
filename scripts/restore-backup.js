#!/usr/bin/env node
// Restore a website backup.
//   node scripts/restore-backup.js <backup folder> [--files]
// Restores the database from <folder>/database.dump into DATABASE_URL, or
// into RESTORE_DATABASE_URL when that is set (use a scratch database to
// check a backup without touching the real one). With --files it also
// copies uploads/ and data/ back into the site, replacing what is there.
const fs = require('fs');
const path = require('path');

for (const filename of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const value = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined && value) process.env[key] = value;
  }
}

const { backupDir, findPgTool, pgEnv, run } = require('../lib/backup');

async function main() {
  const arg = process.argv[2];
  if (!arg) throw new Error('Give the backup folder name, for example nanosoft_20261103_020000_nightly');
  const folder = fs.existsSync(arg) ? path.resolve(arg) : path.join(backupDir(), arg);
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
  if (!manifest.ok) throw new Error('That backup did not finish, so it cannot be restored');
  const target = process.env.RESTORE_DATABASE_URL || process.env.DATABASE_URL;
  if (!target) throw new Error('DATABASE_URL is not set');
  await run(findPgTool('pg_restore'), ['--clean', '--if-exists', '--no-owner', '--no-privileges', '--single-transaction', '--dbname', pgEnv(target).PGDATABASE, path.join(folder, 'database.dump')], pgEnv(target));
  console.log(`Database restored from ${path.basename(folder)} into ${pgEnv(target).PGDATABASE}`);
  if (process.argv.includes('--files')) {
    const root = path.join(__dirname, '..');
    for (const [from, to] of [['uploads', path.join(root, 'public', 'uploads')], ['data', path.join(root, 'data')]]) {
      const src = path.join(folder, from);
      if (!fs.existsSync(src)) continue;
      fs.rmSync(to, { recursive: true, force: true });
      fs.cpSync(src, to, { recursive: true });
      console.log(`Restored ${from}/`);
    }
  }
}

main().catch((err) => { console.error('Restore failed:', err.message); process.exitCode = 1; });
