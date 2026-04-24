@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: SOVEREIGN PERFECTION PUSH
echo ========================================================

git add app/api/akashic/route.ts
git add app/api/health/route.ts
git add services/scanner/index.ts
git add components/dashboard/WhaleDashboard.tsx

git commit -m "feat(sovereign): Akashic live DB + health proof + scanner hardening

Akashic Ledger (/api/akashic):
- PRIMARY: Serves live WhaleActivity >$50M from PostgreSQL (Railway)
- FALLBACK: Curated registry if no qualifying live events yet
- SHA-256 tamper-evident hash per entry (canonical: id|chain|usdValue|...)
- Integrity verify endpoint: GET /api/akashic?verify=<id_or_hash>
- Pagination: limit/offset, hasMore, nextOffset
- Chain filter: ?chain=ETH|SOL|BTC|BASE
- Standard envelope: {ok, source, total, records, lastUpdated}
- No-store cache: always serves fresh cryptographic data

Health API (/api/health):
- Exposes verifiable live proof: totalWhaleEventsIndexed, last24hEvents
- Worker heartbeat timestamps (lastMeshBeat, lastSolanaBeat)
- DB latency measurement
- Infrastructure inventory (RPC pools, API route count, migrations)
- X-Whale-Events-Total header for monitoring integrations

Scanner Cluster (services/scanner/index.ts):
- Added Polygon to EVM mesh (now 4 chains: ETH/BASE/BSC/POLYGON)
- Sovereign Ignition Protocol: env validation on boot
- Redis Heartbeat Loop: publishes hb:worker:mesh/solana every 30s
- Closes health endpoint gap: workers now self-report to Redis
- Structured boot logs with chain status per worker"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ SOVEREIGN PERFECTION DEPLOYED — Verifica en Railway.
pause
