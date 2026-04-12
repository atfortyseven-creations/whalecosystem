#!/bin/sh
set -e

echo "========================================="
echo "[WHALE TERMINAL] Commencing Institutional Boot Sequence v2.0"
echo "========================================="

# Database sync is now handled by the Railway releaseCommand (see railway.toml)
# to ensure zero-downtime, schema-safe deployments.
echo "[1/4] Starting Sovereign Infrastructure..."

# Inicialización lazy de workers (solo después de Next.js bind)
echo "[2/4] Starting Sovereign Mesh Worker (background)..."
npx tsx scripts/sovereign-mesh.ts &

echo "[3/4] Starting Solana SIMD-0109 Scanner (background)..."
npx tsx scripts/solana-worker.ts &

echo "[4/4] Summoning Next.js Core Service..."
# exec para que reciba signals correctamente y healthcheck pase rápido
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

