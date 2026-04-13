#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# SOVEREIGN TERMINAL — INSTITUTIONAL BOOT SEQUENCE
# Atomic, crash-proof, zero-dependency initialization protocol.
# All processes are orchestrated by PM2-runtime for self-healing resilience.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "[Sovereign] Phase 1: Database alignment..."
npx prisma generate
npx prisma migrate deploy

echo "[Sovereign] Phase 2: Launching PM2 process mesh from /app..."
# Use absolute path to ecosystem config to prevent CWD resolution failures.
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json
