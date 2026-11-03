#!/usr/bin/env node

/**
 * Run database migrations via Node.js
 * Usage: node scripts/run-migration.js
 *
 * Scans server/migrations/*.sql in filename order and applies whichever
 * aren't yet recorded in the schema_migrations ledger. Adding a new
 * migration is just dropping a new idempotent .sql file in that folder —
 * no changes needed here.
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually (no dotenv dependency)
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });
}

const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function ensureLedger() {
  await client.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  );
}

async function appliedFilenames() {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function runMigration() {
  try {
    console.log('🔄 Checking database schema...\n');

    await client.connect();
    await ensureLedger();
    const applied = await appliedFilenames();

    const migrationsDir = path.join(__dirname, '../server/migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ranAny = false;

    for (const file of files) {
      if (applied.has(file)) continue;
      ranAny = true;

      console.log(`📝 Running migration: ${file}\n`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      try {
        await client.query(sql);
      } catch (err) {
        const errMsg = err.message || '';
        // Backward-compat safety net for pre-ledger runs of the legacy
        // Phase-1 file; new migrations should be written fully idempotent
        // instead of relying on this.
        if (!errMsg.includes('already exists') && !errMsg.includes('duplicate key')) {
          throw new Error(`Migration ${file} failed: ${errMsg}`);
        }
        console.log('ℹ️  Schema already exists, continuing...\n');
      }

      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      );
      console.log(`✅ Applied: ${file}\n`);
    }

    console.log(ranAny ? '✅ All migrations applied.\n' : '✅ Schema already up to date. Skipping migration.\n');
  } catch (error) {
    console.error('❌ Migration failed:\n', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check DATABASE_URL in .env.local');
    console.error('3. Verify database exists: nanosoft\n');
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

runMigration();
