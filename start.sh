#!/bin/sh
set -e

echo "========================================="
echo "[WHALE TERMINAL] Commencing boot sequence"
echo "========================================="

echo "[1/4] Synchronizing Prisma Database Schema..."
# Run synchronously so we don't race condition the workers or Next.js
npx prisma db push --accept-data-loss || echo "⚠️ Prisma DB Push encountered a non-fatal error. Continuing."

echo "[2/4] Initializing Sovereign Mesh P2P Worker (Background)..."
npx tsx scripts/sovereign-mesh.ts &

echo "[3/4] Initializing Solana SIMD-0109 Scanner (Background)..."
npx tsx scripts/solana-worker.ts &

echo "[4/4] Summoning Next.js Core Service..."
# Use exec to replace the shell process with Next.js, allowing native signal handling
exec npx next start -p ${PORT:-3000} -H 0.0.0.0
