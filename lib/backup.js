/* eslint-disable @typescript-eslint/no-require-imports */
// Website backups: the database (pg_dump custom format), uploaded images
// (public/uploads) and local data such as image descriptions (data/).
// Each backup is one folder under BACKUP_DIR (default ./backups) with a
// manifest.json. Used by the admin "Back up now" button, the nightly run
// started in instrumentation.ts, and scripts/backup.js.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// The site folder: the server and the scripts all start from it.
const ROOT = process.env.SITE_ROOT || process.cwd();
const KEEP = Math.max(1, parseInt(process.env.BACKUP_KEEP || '14', 10) || 14);

function backupDir() {
  return path.resolve(ROOT, process.env.BACKUP_DIR || 'backups');
}

function findPgTool(name) {
  const envName = name === 'pg_dump' ? 'PG_DUMP_PATH' : 'PG_RESTORE_PATH';
  if (process.env[envName]) return process.env[envName];
  if (process.platform === 'win32') {
    const base = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL');
    try {
      const versions = fs.readdirSync(base).filter((v) => /^\d+/.test(v)).sort((a, b) => parseFloat(b) - parseFloat(a));
      for (const v of versions) {
        const exe = path.join(base, v, 'bin', name + '.exe');
        if (fs.existsSync(exe)) return exe;
      }
    } catch { /* fall through to PATH */ }
  }
  return name;
}

// Connection details go to pg_dump through PG* variables, so the password
// never appears on a command line.
function pgEnv(databaseUrl) {
  const u = new URL(databaseUrl);
  const env = { ...process.env };
  env.PGHOST = u.hostname || 'localhost';
  env.PGPORT = u.port || '5432';
  env.PGUSER = decodeURIComponent(u.username || '');
  env.PGPASSWORD = decodeURIComponent(u.password || '');
  env.PGDATABASE = decodeURIComponent(u.pathname.replace(/^\//, ''));
  if (process.env.DB_SSL === 'true') env.PGSSLMODE = 'require';
  return env;
}

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { env, windowsHide: true });
    let err = '';
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => reject(new Error(`Could not start ${path.basename(cmd)}: ${e.message}`)));
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.trim() || `${path.basename(cmd)} exited with code ${code}`))));
  });
}

function countFiles(dir) {
  let n = 0, bytes = 0;
  if (!fs.existsSync(dir)) return { files: 0, bytes: 0 };
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const c = countFiles(p); n += c.files; bytes += c.bytes; }
    else if (e.isFile()) { n++; bytes += fs.statSync(p).size; }
  }
  return { files: n, bytes };
}

function stamp(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function listBackups() {
  const dir = backupDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('nanosoft_'))
    .map((e) => {
      try { return { folder: e.name, ...JSON.parse(fs.readFileSync(path.join(dir, e.name, 'manifest.json'), 'utf8')) }; }
      catch { return null; }
    })
    .filter((m) => m && m.ok)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function prune() {
  const dir = backupDir();
  for (const old of listBackups().slice(KEEP)) {
    fs.rmSync(path.join(dir, old.folder), { recursive: true, force: true });
  }
  // Leftovers from a run that failed part-way (no ok manifest) older than a day.
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || !e.name.startsWith('nanosoft_')) continue;
    const m = path.join(dir, e.name, 'manifest.json');
    let ok = false;
    try { ok = JSON.parse(fs.readFileSync(m, 'utf8')).ok === true; } catch { /* not ok */ }
    if (!ok && Date.now() - fs.statSync(path.join(dir, e.name)).mtimeMs > 86400000) {
      fs.rmSync(path.join(dir, e.name), { recursive: true, force: true });
    }
  }
}

let running = null;

async function doBackup(reason, by) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });
  const started = new Date();
  const folder = `nanosoft_${stamp(started)}_${reason === 'nightly' ? 'nightly' : 'manual'}`;
  const dest = path.join(dir, folder);
  fs.mkdirSync(dest);
  try {
    const dumpFile = path.join(dest, 'database.dump');
    await run(findPgTool('pg_dump'), ['--format=custom', '--no-owner', '--no-privileges', '--file', dumpFile], pgEnv(process.env.DATABASE_URL));
    const dbBytes = fs.statSync(dumpFile).size;
    if (dbBytes < 1024) throw new Error('The database backup came out empty');

    const uploadsSrc = path.join(ROOT, 'public', 'uploads');
    if (fs.existsSync(uploadsSrc)) fs.cpSync(uploadsSrc, path.join(dest, 'uploads'), { recursive: true });
    const dataSrc = path.join(ROOT, 'data');
    if (fs.existsSync(dataSrc)) fs.cpSync(dataSrc, path.join(dest, 'data'), { recursive: true });

    const uploads = countFiles(path.join(dest, 'uploads'));
    const data = countFiles(path.join(dest, 'data'));
    const manifest = {
      ok: true,
      reason,
      by: by || null,
      createdAt: started.toISOString(),
      finishedAt: new Date().toISOString(),
      database: { file: 'database.dump', bytes: dbBytes },
      uploads: { files: uploads.files, bytes: uploads.bytes },
      data: { files: data.files, bytes: data.bytes },
    };
    fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2));
    prune();
    return { folder, ...manifest };
  } catch (err) {
    fs.rmSync(dest, { recursive: true, force: true });
    throw err;
  }
}

// One backup at a time; a second request while one runs waits for it.
function runBackup({ reason = 'manual', by } = {}) {
  if (!running) running = doBackup(reason, by).finally(() => { running = null; });
  return running;
}

module.exports = { runBackup, listBackups, backupDir, findPgTool, pgEnv, run, KEEP };
