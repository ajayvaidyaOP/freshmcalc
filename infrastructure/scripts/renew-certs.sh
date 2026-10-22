#!/bin/bash
# Renew Let's Encrypt certificates and reload nginx. Safe to run daily:
# certbot exits without touching anything when renewal is not due yet.
#
#   crontab -e
#   15 3 * * * cd /opt/freshmcalc/infrastructure && ./scripts/renew-certs.sh >> /var/log/freshmcalc-tls.log 2>&1
set -euo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${HERE}/.."

docker compose --profile tls run --rm certbot renew --webroot -w /var/www/certbot

if docker compose ps --status running --services | grep -qx nginx; then
  docker compose exec -T nginx nginx -s reload
  echo "nginx reloaded"
fi
