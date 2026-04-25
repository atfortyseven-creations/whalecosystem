#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# SOVEREIGN TERMINAL — CRASH-PROOF BOOT SEQUENCE
# ─────────────────────────────────────────────────────────────────────────────
# NOTE: NO set -e — individual command failures must NOT kill the container.

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 1: Prisma client generation..."
echo "[Sovereign] ═══════════════════════════════════════════════"
npx prisma generate || echo "[Sovereign] WARNING: prisma generate failed — continuing anyway"

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 2: Database migration..."
echo "[Sovereign] ═══════════════════════════════════════════════"
npx prisma migrate deploy || echo "[Sovereign] WARNING: migrate deploy failed — DB may be at latest schema"

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 3: Launching PM2 process mesh..."
echo "[Sovereign] Port: ${PORT:-3000}"
echo "[Sovereign] ═══════════════════════════════════════════════"
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json &

# Phase 4: Post-boot schema hardening — run sync-db once the server is ready
# Polls until the server responds, then fires sync-db to apply any missing columns/tables
PM2_PID=$!
echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 4: Waiting for server readiness..."
echo "[Sovereign] ═══════════════════════════════════════════════"
ATTEMPTS=0
MAX_ATTEMPTS=30
until curl -sf "http://localhost:${PORT:-8080}/api/healthcheck" > /dev/null 2>&1 || [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; do
  sleep 2
  ATTEMPTS=$((ATTEMPTS + 1))
  echo "[Sovereign] Waiting for server... (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
done

if [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; then
  echo "[Sovereign] Server ready. Running schema sync..."
  curl -sf "http://localhost:${PORT:-8080}/api/admin/sync-db" > /dev/null 2>&1 && \
    echo "[Sovereign] ✓ Schema sync complete" || \
    echo "[Sovereign] WARNING: Schema sync failed — columns may need manual migration"
else
  echo "[Sovereign] WARNING: Server did not start in time — skipping schema sync"
fi

wait $PM2_PID
