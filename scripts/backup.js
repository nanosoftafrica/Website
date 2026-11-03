#!/usr/bin/env node
// Make a website backup now: node scripts/backup.js
// Same backup as the admin "Back up now" button (database, uploads, data/).
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

const { runBackup } = require('../lib/backup');
runBackup({ reason: process.argv.includes('--nightly') ? 'nightly' : 'manual', by: 'command line' })
  .then((b) => { console.log(`Backup saved: ${b.folder} (database ${b.database.bytes} bytes, ${b.uploads.files} uploaded files)`); })
  .catch((err) => { console.error('Backup failed:', err.message); process.exitCode = 1; });
