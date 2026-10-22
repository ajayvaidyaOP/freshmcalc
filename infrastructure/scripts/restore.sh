#!/bin/bash
# Restore a FreshmCalc PostgreSQL dump by replacing the current database.
#
#   docker compose stop backend
#   docker compose exec -T postgres /backup/restore.sh /backups/<file>.sql.gz
#   docker compose start backend
#
# DESTROYS the current database contents. The dump is gzip-tested first and the
# import runs in one transaction so SQL errors cannot leave a half-loaded dump.
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
if ! gzip -t "${FILE}"; then
  echo "Backup is not a valid gzip file: ${FILE}" >&2
  exit 2
fi

DB_NAME="${DB_NAME:-freshmcalc}"
DB_USER="${DB_USERNAME:-freshmcalc}"

echo "Restoring ${FILE} into ${DB_NAME} as ${DB_USER} …"
echo "Terminating connections and recreating ${DB_NAME}; the current contents will be replaced."
# Use stdin for safe psql variable quoting. With `psql -c`, :'dbname' would be
# sent literally to PostgreSQL and fail with a syntax error.
psql -v ON_ERROR_STOP=1 --set=dbname="${DB_NAME}" -U "${DB_USER}" -d postgres <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'dbname' AND pid <> pg_backend_pid();
SQL
dropdb -U "${DB_USER}" --if-exists "${DB_NAME}"
createdb -U "${DB_USER}" --owner="${DB_USER}" "${DB_NAME}"
gunzip -c "${FILE}" | psql -v ON_ERROR_STOP=1 --single-transaction -U "${DB_USER}" -d "${DB_NAME}"
echo "Restore finished. Verify with: SELECT count(*) FROM users;"
