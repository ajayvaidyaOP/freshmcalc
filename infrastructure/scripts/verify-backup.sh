#!/bin/bash
# Restore rehearsal: proves the latest dump is actually usable.
#
#   docker compose exec -T postgres /backup/verify-backup.sh
#
# Restores into a throwaway database (freshmcalc_verify), checks the core
# tables have rows, then drops it. Run this monthly (and after every Postgres
# major upgrade) so a broken backup is discovered before you need it.
set -euo pipefail

DB_USER="${DB_USERNAME:-freshmcalc}"
DB_NAME="${DB_NAME:-freshmcalc}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
VERIFY_DB="${DB_NAME}_verify"

LATEST=$(ls -1t "${BACKUP_DIR}"/freshmcalc_"${DB_NAME}"_*.sql.gz 2>/dev/null | head -n 1 || true)
if [ -z "${LATEST}" ]; then
  echo "No backup found in ${BACKUP_DIR}. Run backup.sh first." >&2
  exit 2
fi

echo "Rehearsing restore of ${LATEST}"
dropdb -U "${DB_USER}" --if-exists "${VERIFY_DB}"
createdb -U "${DB_USER}" "${VERIFY_DB}"

set +e
gunzip -c "${LATEST}" | psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${VERIFY_DB}" >/tmp/restore.log 2>&1
STATUS=$?
set -e

if [ ${STATUS} -ne 0 ]; then
  echo "RESTORE FAILED — see /tmp/restore.log" >&2
  tail -n 20 /tmp/restore.log >&2
  dropdb -U "${DB_USER}" --if-exists "${VERIFY_DB}"
  exit ${STATUS}
fi

for TABLE in users subscription_plans market_rates calculations payments flyway_schema_history; do
  if ! COUNT=$(psql -tA -U "${DB_USER}" -d "${VERIFY_DB}" -c "SELECT count(*) FROM ${TABLE};"); then
    echo "RESTORE CHECK FAILED — required table ${TABLE} is missing or unreadable." >&2
    dropdb -U "${DB_USER}" --if-exists "${VERIFY_DB}"
    exit 1
  fi
  echo "  ${TABLE}: ${COUNT}"
done

dropdb -U "${DB_USER}" "${VERIFY_DB}"
echo "Backup verified and scratch database removed."
