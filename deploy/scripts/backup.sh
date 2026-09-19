#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Daily backup of PostgreSQL + uploads directory.
# Configure in /etc/cron.d/lyceum-backup → 0 3 * * * root /opt/lyceum/backup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="${BACKUP_PATH:-/var/backups/lyceum}"
APP_DIR="${APP_DIR:-/opt/lyceum}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE=$(date +%Y-%m-%d_%H-%M)

mkdir -p "$BACKUP_DIR"

# 1. PostgreSQL dump
if command -v pg_dump >/dev/null 2>&1; then
    pg_dump \
        --format=custom \
        --compress=9 \
        --no-owner \
        --no-privileges \
        --dbname="$DATABASE_URL" \
        --file="$BACKUP_DIR/db_${DATE}.dump"
    echo "✓ DB dump written: db_${DATE}.dump"
else
    echo "⚠ pg_dump not found, skipping DB"
fi

# 2. Uploads archive
if [[ -d "$APP_DIR/public/uploads" ]]; then
    tar -czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" \
        -C "$APP_DIR/public" uploads
    echo "✓ Uploads archive written: uploads_${DATE}.tar.gz"
fi

# 3. Cleanup old backups
find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -name '*.dump' -delete
find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -name '*.tar.gz' -delete
echo "✓ Old backups older than ${RETENTION_DAYS} days removed"

# 4. Optional: sync to S3 (if configured)
if [[ -n "${BACKUP_S3_BUCKET:-}" ]] && command -v aws >/dev/null 2>&1; then
    aws s3 sync "$BACKUP_DIR" "s3://${BACKUP_S3_BUCKET}/" \
        --exclude "*.tmp" \
        --storage-class STANDARD_IA
    echo "✓ Synced to S3: s3://${BACKUP_S3_BUCKET}/"
fi

echo "Backup complete at $(date)"
