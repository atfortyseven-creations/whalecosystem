#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# SOVEREIGN TERMINAL — CRASH-PROOF BOOT SEQUENCE
# ─────────────────────────────────────────────────────────────────────────────
# NOTE: NO set -e — individual command failures must NOT kill the container.
# Each phase has its own error handling.

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 1: Prisma client generation..."
echo "[Sovereign] ═══════════════════════════════════════════════"
npx prisma generate || echo "[Sovereign] WARNING: prisma generate failed — continuing anyway"

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 2: Database migration..."
echo "[Sovereign] ═══════════════════════════════════════════════"
npx prisma migrate deploy || echo "[Sovereign] WARNING: migrate deploy failed — continuing to db push"
npx prisma db push --accept-data-loss || echo "[Sovereign] WARNING: db push failed — DB may already be at latest schema"


echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 3: Launching PM2 process mesh..."
echo "[Sovereign] Port: ${PORT:-3000}"
echo "[Sovereign] ═══════════════════════════════════════════════"
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json
