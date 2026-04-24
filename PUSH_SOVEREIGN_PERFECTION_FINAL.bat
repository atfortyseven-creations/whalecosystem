@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: SOVEREIGN PERFECTION ABSOLUTA — FINAL PUSH
echo ========================================================

:: Stage all sovereign hardening changes
git add app/api/scanner/status/route.ts
git add app/api/akashic/verify/route.ts
git add app/api/trap/route.ts
git add app/api/golden-ticket/claim/route.ts
git add app/api/akashic/route.ts
git add app/api/health/route.ts
git add services/scanner/index.ts
git add lib/blockchain/ResilientProvider.ts
git add prisma/schema.prisma
git add next.config.js
git add components/dashboard/WhaleDashboard.tsx

git commit -m "feat(sovereign-perfection): full hardening pass — all Grok items addressed

=== NEW ENDPOINTS (0-auth public verifiable) ===

GET /api/scanner/status
  - Worker heartbeats (EVM mesh + Solana), per-chain ingestion counts (1h/24h)
  - Redis stream depth (backpressure indicator)
  - Infrastructure inventory (RPC pools, chains, circuit breaker config)
  - Throughput proof: eventsLast1h, eventsPerMinute1h, newestEvent
  - X-Total-Events-Indexed header for monitoring integrations

POST /api/akashic/verify  (+ GET /api/akashic/verify?id=XXXXX)
  - Batch SHA-256 tamper-evident verification (up to 50 entries per request)
  - timingSafeEqual comparison (constant-time, side-channel resistant)
  - Returns: allVerified, anyTampered, integrityStatus (INTACT/COMPROMISED/PARTIAL)
  - Per-entry: storedHash, recomputedHash, tampered boolean

GET/POST /api/trap (honeypot)
  - 18 common attack probe paths trapped (/api/admin, /debug, /env, /wp-admin, etc.)
  - Returns plausible-but-empty response (doesn't alert attacker)
  - Logs: {level: SECURITY_TRAP, event: HONEYPOT_HIT, ip, path, userAgent, timestamp}

=== HARDENED ENDPOINTS ===

POST /api/golden-ticket/claim
  - Redis-backed rate limit: 3 attempts/IP/hour (INCR + EXPIRE + TTL)
  - Graceful fallback if Redis unavailable (allows request, logs warning)
  - Structured security logging: CLAIM_RATE_LIMIT_HIT, INVALID_SIGNATURE events
  - Proper JSON parse error handling (400 vs 500)
  - Field-level input validation with type checks
  - Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining headers

=== INFRASTRUCTURE ===

ResilientProvider (circuit breaker 3-state):
  - CLOSED / OPEN / HALF_OPEN state machine
  - 8s timeout enforcement per RPC call (Promise.race)
  - HALF_OPEN probe: one test call after cooldown, markRecovered on success
  - Emergency reset logging when all circuits open

Prisma schema (compound indexes):
  - GoldenTicket: [isActive, claimedAt DESC], [tier, claimedAt], [ticketNumber]
  - WhaleActivity: [chain, timestamp, usdValue], [institutional, usdValue, timestamp]
  - WhaleActivity: [token, chain, timestamp], [fromAddress, timestamp], [toAddress, timestamp]

next.config.js (security headers):
  - HSTS: max-age=31536000 includeSubDomains preload
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - no-store enforced on /api/health,akashic,golden-ticket,signals

Scanner cluster:
  - Polygon added (4 EVM chains: ETH/BASE/BSC/POLYGON)
  - Sovereign Ignition Protocol (env validation at boot)
  - Redis heartbeat loop (30s interval, 60s TTL)"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ============================================================
echo  PASO CRITICO: Despues del deploy en Railway, ejecuta:
echo    npx prisma migrate deploy
echo  Para aplicar los compound indexes en produccion.
echo ============================================================
echo.
pause
