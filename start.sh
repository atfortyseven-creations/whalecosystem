#!/bin/sh
# 
# SOVEREIGN TERMINAL  CRASH-PROOF BOOT SEQUENCE
# 
# NOTE: NO set -e  individual command failures must NOT kill the container.

#  Suppress npm update notices and Prisma update banners (both go to stderr) 
export PRISMA_HIDE_UPDATE_MESSAGE=1
export NPM_CONFIG_UPDATE_NOTIFIER=false
export NO_UPDATE_NOTIFIER=1

#  Fallback: If running inside Railway internal network, rewrite public proxy DATABASE_URL to internal URL 
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *proxy.rlwy.net*)
      echo "[System] Rewriting public proxy DATABASE_URL to use high-speed internal Railway network..."
      export DATABASE_URL=$(echo "$DATABASE_URL" | sed -E 's/@[^/]+/@postgres.railway.internal:5432/')
      MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/:[^:@/]+@/:****@/')
      echo "[System] Internal DATABASE_URL: $MASKED_URL"
      ;;
  esac
fi

echo "[System] "
echo "[System] Phase 1: Prisma client generation..."
echo "[System] "
npx --quiet prisma generate 2>&1 | grep -v 'npm notice' | grep -v 'Update available' | grep -v 'major update' | grep -v 'pris.ly' | grep -v 'npm i ' || echo "[System] WARNING: prisma generate failed  continuing anyway"

echo "[System] "
echo "[System] Phase 2: Database schema synchronization..."
echo "[System] "

#  Pre-push: purge duplicate WatchedWallet & ExchangeBalance rows (fix P2002) 
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
    console.log('[System] WatchedWallet Dedup OK  rows removed: ' + res1);
  } catch(e) { console.log('[System] WatchedWallet Dedup skipped: ' + e.message); }

  try {
    const res2 = await p.\$executeRawUnsafe(\`
      DELETE FROM \\\"ExchangeBalance\\\" a
      USING \\\"ExchangeBalance\\\" b
      WHERE a.id > b.id
        AND a.\\\"userId\\\" = b.\\\"userId\\\"
        AND a.asset = b.asset
    \`);
    console.log('[System] ExchangeBalance Dedup OK  rows removed: ' + res2);
  } catch(e) { console.log('[System] ExchangeBalance Dedup skipped: ' + e.message); }
  
  await p.\$disconnect();
}
clean();
" || echo "[System] Dedup step skipped"

npx prisma db push --accept-data-loss 2>&1 | grep -v 'npm notice' | grep -v 'Update available' | grep -v 'major update' | grep -v 'pris.ly' | grep -v 'npm i ' || echo "[System] WARNING: db push failed  DB may be at latest schema or locked by another instance"

echo "[System] "
echo "[System] Phase 3: Launching PM2 process mesh..."
echo "[System] Port: ${PORT:-3000}"
echo "[System] "
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json
