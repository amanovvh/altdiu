#!/usr/bin/env bash
# =====================================================
# Restore PostgreSQL backup for International Finance
# Usage: ./restore.sh /path/to/backup.sql.gz
# =====================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>"
  echo "Example: $0 /var/backups/lyceum/lyceum-2026-09-17_03-00-00.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: File not found: ${BACKUP_FILE}"
  exit 1
fi

# Load env vars if .env exists
if [ -f "$(dirname "$0")/../.env" ]; then
  set -a
  source "$(dirname "$0")/../.env"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')

echo "⚠️  WARNING: This will REPLACE data in '${DB_NAME}' on ${DB_HOST}"
echo "    Backup file: ${BACKUP_FILE}"
echo ""
read -p "Type 'YES' to continue: " CONFIRM

if [ "${CONFIRM}" != "YES" ]; then
  echo "Aborted."
  exit 0
fi

# Detect compression
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  echo "Decompressing and restoring..."
  gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASS}" pg_restore \
    -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER}" -d "${DB_NAME}" \
    --clean --if-exists --no-owner --no-acl --verbose
else
  echo "Restoring from uncompressed backup..."
  PGPASSWORD="${DB_PASS}" pg_restore \
    -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER}" -d "${DB_NAME}" \
    --clean --if-exists --no-owner --no-acl --verbose "${BACKUP_FILE}"
fi

echo "✅ Restore complete."
