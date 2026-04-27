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
echo "[Sovereign] Phase 2: Database schema synchronization..."
echo "[Sovereign] ═══════════════════════════════════════════════"

# ── Pre-push: purge duplicate WatchedWallet & ExchangeBalance rows (fix P2002) ──────────────
# The @@unique constraints fail if duplicate rows exist.
# This step deletes the newer duplicate keeping only the oldest entry per pair.
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function clean() {
  try {
    const res1 = await p.\$executeRawUnsafe(\`
      DELETE FROM \\\"WatchedWallet\\\" a
      USING \\\"WatchedWallet\\\" b
      WHERE a.id > b.id
        AND a.\\\"userId\\\" = b.\\\"userId\\\"
        AND a.address = b.address
    \`);
    console.log('[Sovereign] WatchedWallet Dedup OK — rows removed: ' + res1);
  } catch(e) { console.log('[Sovereign] WatchedWallet Dedup skipped: ' + e.message); }

  try {
    const res2 = await p.\$executeRawUnsafe(\`
      DELETE FROM \\\"ExchangeBalance\\\" a
      USING \\\"ExchangeBalance\\\" b
      WHERE a.id > b.id
        AND a.\\\"userId\\\" = b.\\\"userId\\\"
        AND a.asset = b.asset
    \`);
    console.log('[Sovereign] ExchangeBalance Dedup OK — rows removed: ' + res2);
  } catch(e) { console.log('[Sovereign] ExchangeBalance Dedup skipped: ' + e.message); }
  
  await p.\$disconnect();
}
clean();
" || echo "[Sovereign] Dedup step skipped"

npx prisma db push --accept-data-loss || echo "[Sovereign] WARNING: db push failed — DB may be at latest schema or locked by another instance"

echo "[Sovereign] ═══════════════════════════════════════════════"
echo "[Sovereign] Phase 3: Launching PM2 process mesh..."
echo "[Sovereign] Port: ${PORT:-3000}"
echo "[Sovereign] ═══════════════════════════════════════════════"
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json
