#!/bin/bash
# Automated PostgreSQL backup for FreshmCalc.
# Runs inside the postgres container or as a cron job.
set -euo pipefail

DB_NAME="${DB_NAME:-freshmcalc}"
DB_USER="${DB_USERNAME:-freshmcalc}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/freshmcalc_${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"

# Retention: keep last 7 daily backups
find "${BACKUP_DIR}" -name "freshmcalc_${DB_NAME}_*.sql.gz" -mtime +7 -delete
