#!/bin/bash
# Automated PostgreSQL backup for FreshmCalc.
# Runs inside the postgres container or as a cron job.
set -euo pipefail

DB_NAME="${DB_NAME:-freshmcalc}"
DB_USER="${DB_USERNAME:-freshmcalc}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/freshmcalc_${DB_NAME}_${TIMESTAMP}.sql.gz"
TEMP_FILE="${BACKUP_FILE}.tmp"

mkdir -p "${BACKUP_DIR}"
trap 'rm -f "${TEMP_FILE}"' EXIT

# pipefail catches pg_dump errors. Publish only a complete, gzip-valid file so
# a failed dump can never masquerade as the latest restorable backup.
pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${TEMP_FILE}"
gzip -t "${TEMP_FILE}"
mv "${TEMP_FILE}" "${BACKUP_FILE}"
trap - EXIT

echo "Backup created: ${BACKUP_FILE}"

# Retention: keep last 7 daily backups
find "${BACKUP_DIR}" -name "freshmcalc_${DB_NAME}_*.sql.gz" -mtime +7 -delete
