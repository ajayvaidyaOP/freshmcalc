# Production Deployment Guide

## Overview

FreshmCalc deploys as Docker containers behind Nginx with HTTPS.

## Steps

1. Provision a server with Docker and Docker Compose.
2. Clone the repository to the server.
3. Copy `infrastructure/.env.example` to `infrastructure/.env` and set production values:
   - Strong `JWT_SECRET` (256+ bits).
   - Live Razorpay keys (`RAZORPAY_TEST_MODE=false`).
   - Production database credentials.
   - `CORS_ALLOWED_ORIGINS` set to your domain.
4. Obtain TLS certificates (Let's Encrypt) and mount them into Nginx; update `infrastructure/nginx/nginx.conf` for port 443.
5. Run `docker compose up -d --build`.
6. Verify `https://your-domain/health` returns healthy.

## Environment-based configuration

All credentials come from environment variables. No secrets are committed to Git.

## Database backups

Run `infrastructure/scripts/backup.sh` on a schedule (cron) to create compressed PostgreSQL dumps with 7-day retention.

## Rate limiting & security

- Spring Security stateless JWT sessions.
- Role-based access control (`CUSTOMER` / `ADMIN`).
- Server-side authorization prevents access to other customers' records.
- CORS configured via `CORS_ALLOWED_ORIGINS`.
- No mock data in production mode.
