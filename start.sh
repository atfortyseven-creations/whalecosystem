#!/bin/sh
set -e

echo "========================================="
echo "[WHALE TERMINAL] Commencing Institutional Boot Sequence v2.0"
echo "========================================="

# LEADER ELECTION (Railway replica 0 or 1 is líder)
IS_LEADER=false
if [ "$RAILWAY_REPLICA_ID" = "0" ] || [ "$RAILWAY_REPLICA_ID" = "1" ] || [ "$LEADER_NODE" = "true" ]; then
    IS_LEADER=true
    echo "[LEADER] Ejecutando Prisma schema sync (solo líder)..."
    npx prisma db push --accept-data-loss || echo "[LEADER] Prisma non-fatal. Continuing..."
else
    echo "[FOLLOWER] Skipping Prisma db push - waiting for leader..."
    sleep 8  # Espera mínima para que el líder complete
fi

# Inicialización lazy de workers (solo después de Next.js bind)
echo "[2/4] Starting Sovereign Mesh Worker (background)..."
npx tsx scripts/sovereign-mesh.ts &

echo "[3/4] Starting Solana SIMD-0109 Scanner (background)..."
npx tsx scripts/solana-worker.ts &

echo "[4/4] Summoning Next.js Core Service..."
# exec para que reciba signals correctamente y healthcheck pase rápido
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

