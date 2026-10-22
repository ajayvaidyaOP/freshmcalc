#!/bin/bash
# Restore a FreshmCalc PostgreSQL dump.
#
#   docker compose exec -T postgres /backup/restore.sh /backups/freshmcalc_....sql.gz
#
# DESTROYS the current database contents. Stops the API first so no writes race
# the restore:
#   docker compose stop backend
#   docker compose exec -T postgres /backup/restore.sh /backups/<file>.sql.gz
#   docker compose start backend
set -euo pipefail

FILE="${1:-}"
if [ -z "${FILE}" ]; then
  echo "Usage: restore.sh /backups/freshmcalc_<db>_<timestamp>.sql.gz" >&2
  exit 2
fi
if [ ! -f "${FILE}" ]; then
  echo "Backup not found: ${FILE}" >&2
  exit 2
fi

DB_NAME="${DB_NAME:-freshmcalc}"
DB_USER="${DB_USERNAME:-freshmcalc}"

echo "Restoring ${FILE} into ${DB_NAME} as ${DB_USER} …"
gunzip -c "${FILE}" | psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}"
echo "Restore finished. Verify with: SELECT count(*) FROM users;"
