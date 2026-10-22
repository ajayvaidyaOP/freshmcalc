#!/bin/bash
# One-shot HTTPS setup: obtain a Let's Encrypt certificate for FreshmCalc.
#
#   ./scripts/init-letsencrypt.sh freshmcalc.com you@example.com
#
# What it does:
#   1. creates a throwaway self-signed certificate so nginx can start with
#      https.conf before a real one exists,
#   2. starts the stack,
#   3. asks Let's Encrypt for the real certificate (HTTP-01),
#   4. loads it and reloads nginx.
#
# Requirements: DNS for the domain (and www.) already points at this server,
# ports 80 + 443 open, and the stack stopped or startable (`docker compose`).
# Certificates are stored in ./certbot/conf and renew with renew-certs.sh.
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
STAGING="${STAGING:-0}"

if [ -z "${DOMAIN}" ] || [ -z "${EMAIL}" ]; then
  echo "Usage: $0 <domain> <email>   e.g. $0 freshmcalc.com you@example.com" >&2
  echo "Set STAGING=1 to test against the Let's Encrypt staging CA (no rate limits)." >&2
  exit 2
fi

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "${HERE}/.." && pwd)
cd "${ROOT}"

CONF="./certbot/conf"
WWW="./certbot/www"
LIVE="${CONF}/live/${DOMAIN}"
mkdir -p "${LIVE}" "${WWW}"

if [ ! -f nginx/https.conf ]; then
  echo "→ Creating nginx/https.conf from the example for ${DOMAIN}"
  sed "s/your-domain.com/${DOMAIN}/g" nginx/https.conf.example > nginx/https.conf
fi

# 1) Dummy certificate so the 443 server block can load.
if [ ! -f "${LIVE}/fullchain.pem" ]; then
  echo "→ Creating a temporary self-signed certificate"
  docker compose --profile tls run --rm --entrypoint sh certbot -c "
    apk add --no-cache openssl >/dev/null 2>&1 || true
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout '/etc/letsencrypt/live/${DOMAIN}/privkey.pem' \
      -out '/etc/letsencrypt/live/${DOMAIN}/fullchain.pem' \
      -subj '/CN=localhost' 2>/dev/null
  "
fi

# 2) Start the stack (nginx can now serve :443 with the dummy cert).
echo "→ Starting the stack"
docker compose up -d --build
sleep 5

# 3) Request the real certificate.
echo "→ Requesting the certificate for ${DOMAIN}"
STAGING_FLAG=""
[ "${STAGING}" = "1" ] && STAGING_FLAG="--staging"

docker compose --profile tls run --rm certbot certonly --webroot -w /var/www/certbot \
  ${STAGING_FLAG} \
  --email "${EMAIL}" --agree-tos --no-eff-email \
  --force-renewal \
  -d "${DOMAIN}" -d "www.${DOMAIN}"

# 4) Reload nginx with the real certificate.
echo "→ Reloading nginx"
docker compose exec -T nginx nginx -s reload

echo
echo "✅ https://${DOMAIN} should be live."
echo "   Next: set APP_PUBLIC_URL=https://${DOMAIN} and CORS_ALLOWED_ORIGINS=https://${DOMAIN} in .env,"
echo "   then: docker compose up -d backend"
