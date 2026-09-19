#!/usr/bin/env bash
# =====================================================
# Automated PostgreSQL backup for International Finance
# Run via cron: 0 3 * * * /path/to/backup.sh
# =====================================================

set -euo pipefail

# Load env vars if .env exists
if [ -f "$(dirname "$0")/../.env" ]; then
  set -a
  source "$(dirname "$0")/../.env"
  set +a
fi

BACKUP_PATH="${BACKUP_PATH:-/var/backups/lyceum}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
FILENAME="lyceum-${TIMESTAMP}.sql.gz"
LOGFILE="${BACKUP_PATH}/backup.log"

mkdir -p "${BACKUP_PATH}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[$(date)] ERROR: DATABASE_URL not set" | tee -a "${LOGFILE}"
  exit 1
fi

# Parse DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')

echo "[$(date)] Starting backup → ${BACKUP_PATH}/${FILENAME}" | tee -a "${LOGFILE}"

# Perform the backup
PGPASSWORD="${DB_PASS}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  --no-owner --no-acl \
  | gzip > "${BACKUP_PATH}/${FILENAME}"

# Verify backup
if [ -s "${BACKUP_PATH}/${FILENAME}" ]; then
  SIZE=$(du -h "${BACKUP_PATH}/${FILENAME}" | cut -f1)
  echo "[$(date)] ✅ Backup complete: ${FILENAME} (${SIZE})" | tee -a "${LOGFILE}"
else
  echo "[$(date)] ❌ Backup file is empty!" | tee -a "${LOGFILE}"
  exit 1
fi

# Apply retention policy
if [ "${RETENTION_DAYS}" -gt 0 ]; then
  find "${BACKUP_PATH}" -name "lyceum-*.sql.gz" -mtime +${RETENTION_DAYS} -delete
  DELETED=$(find "${BACKUP_PATH}" -name "lyceum-*.sql.gz" -mtime +${RETENTION_DAYS} | wc -l)
  if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] 🗑 Removed ${DELETED} old backup(s) (>${RETENTION_DAYS} days)" | tee -a "${LOGFILE}"
  fi
fi

echo "[$(date)] Done." | tee -a "${LOGFILE}"
