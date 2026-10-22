#!/bin/bash
# Update a running FreshmCalc server to the latest commit.
#
#   cd /opt/freshmcalc/infrastructure && ./scripts/deploy.sh
#
# Safe by design: takes a database backup first, rebuilds images, waits for the
# health endpoint, and prints logs if anything fails. A failed deploy leaves the
# previous images on disk, so `docker compose up -d --no-build` rolls back.
set -euo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${HERE}/.."

echo "→ Pulling the latest code"
git -C .. pull --ff-only

echo "→ Backing up the database before the update"
if docker compose ps --status running --services | grep -qx postgres; then
  docker compose exec -T postgres /backup/backup.sh || echo "  (backup skipped — check logs)"
fi

echo "→ Building and starting"
docker compose up -d --build

echo "→ Waiting for the API to report healthy"
for i in $(seq 1 60); do
  if curl -fsS http://127.0.0.1/health >/dev/null 2>&1; then
    echo "✅ Healthy after ${i}0s"
    docker compose ps
    exit 0
  fi
  sleep 10
done

echo "❌ The API did not become healthy. Recent backend logs:" >&2
docker compose logs --tail 80 backend >&2
exit 1
