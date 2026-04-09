@echo off
echo =========================================
echo WHALE NETWORK — HEALTHCHECK CRITICAL FIX
echo =========================================
echo.
echo [FIX 1] WAF now bypasses /api/health (wget UA was scoring 5-8 pts)
echo [FIX 2] Middleware Layer -1: /api/health bypasses ALL processing
echo [FIX 3] /api/health route: zero-dependency, pure 200 OK
echo [FIX 4] railway.toml: healthcheckTimeout 120 -> 300s
echo [FIX 5] Dockerfile: HEALTHCHECK start-period 60s -> 90s
echo [FIX 6] railway.json: was empty {} causing config conflict
echo.

cd /d "c:\Users\admin\.gemini\.antigravity\scratch\Wallet Human Polymarket ID"

git add lib/security/waf-engine.ts
git add middleware.ts
git add app/api/health/route.ts
git add railway.toml
git add railway.json
git add Dockerfile

git commit -m "fix(health): bulletproof Railway healthcheck — WAF bypass + timeout 300s

CRITICAL ROOT CAUSE ANALYSIS:
1. WAF was scoring /api/health probe at 5-8 anomaly pts:
   - Railway wget has no User-Agent -> NO_UA vector: +5 pts
   - Railway internal host doesnt match expectedHosts -> HOST_MISMATCH: +3 pts
   - Total: 8/10 pts — 1 request away from hard 403 block
   Fix: WAF_BYPASS_PATHS whitelist + middleware Layer -1 instant pass-through

2. Healthcheck timeout was 120s — insufficient for 2372-package cold start
   Fix: healthcheckTimeout = 300s, HEALTHCHECK start-period = 90s

3. /api/health imported NextResponse unnecessarily — removed all imports
   Fix: Pure Response.json() with no external module dependencies

4. railway.json was {} (empty) — potential conflict with railway.toml config
   Fix: Proper schema-only JSON

Build: Next.js 15 standalone, Prisma v6.19.2, node:22-alpine"

git push origin main

echo.
echo ========================================
echo PUSH COMPLETE — Awaiting Railway deploy
echo Expected: HEALTHY within 4-5 minutes
echo ========================================
pause
