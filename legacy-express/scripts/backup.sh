#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# Nanosoft Technology — PostgreSQL backup script
# Usage: ./scripts/backup.sh
#
# Schedule with cron (daily at 2am):
#   0 2 * * * /opt/nanosoft/scripts/backup.sh >> /var/log/nanosoft-backup.log 2>&1
#
# ENV expected (or set via .env at top of this file):
#   POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
#   BACKUP_DIR (optional, default: /opt/nanosoft/backups)
#   BACKUP_RETAIN_DAYS (optional, default: 14)
# ════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Config ───────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

DB_NAME="${POSTGRES_DB:-nanosoft}"
DB_USER="${POSTGRES_USER:-nanosoft}"
DB_PASS="${POSTGRES_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
CONTAINER="${DB_CONTAINER:-nanosoft_db}"   # set to empty string to use host pg

BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
RETAIN="${BACKUP_RETAIN_DAYS:-14}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="nanosoft_${TIMESTAMP}.sql.gz"
DEST="$BACKUP_DIR/$FILENAME"

# ── Ensure backup dir ────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup → $DEST"

# ── Dump ─────────────────────────────────────────────────────────
if [ -n "$CONTAINER" ] && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  # Dump from Docker container (preferred for Coolify deployments)
  docker exec "$CONTAINER" \
    pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$DEST"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dumped from container: $CONTAINER"
else
  # Dump from host PostgreSQL
  export PGPASSWORD="$DB_PASS"
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$DEST"
  unset PGPASSWORD
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dumped from host Postgres"
fi

SIZE=$(du -sh "$DEST" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $FILENAME ($SIZE)"

# ── Prune old backups ────────────────────────────────────────────
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruning backups older than ${RETAIN} days…"
find "$BACKUP_DIR" -name "nanosoft_*.sql.gz" -mtime +${RETAIN} -delete
REMAINING=$(ls "$BACKUP_DIR" | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done. ${REMAINING} backup(s) retained."

# ── Optional: copy to remote (uncomment and configure) ───────────
# rsync -az "$DEST" user@backup-host:/backups/nanosoft/
# OR: aws s3 cp "$DEST" s3://your-bucket/nanosoft-backups/
