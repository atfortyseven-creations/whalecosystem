@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: SOVEREIGN HARDENING v3 — CIRCUIT BREAKER
echo ========================================================

git add lib/blockchain/ResilientProvider.ts
git add prisma/schema.prisma
git add next.config.js
git add app/api/akashic/route.ts
git add app/api/health/route.ts
git add services/scanner/index.ts
git add components/dashboard/WhaleDashboard.tsx

git commit -m "feat(sovereign-hardening): circuit breaker, compound indexes, security headers

ResilientProvider — Circuit Breaker 3-estados:
- CLOSED: operacion normal
- OPEN: rechaza llamadas inmediatamente (cooldown activo)
- HALF_OPEN: permite UNA llamada de prueba tras cooldown
- Timeout enforcement 8s en todas las llamadas RPC
- markRecovered(): transicion explicita OPEN->CLOSED en probe exitosa
- Emergency reset logging cuando todos los circuitos estan abiertos
- Latency telemetry: warn si >6s, error si timeout

Prisma Schema — Compound indexes:
- GoldenTicket: [isActive, claimedAt DESC], [tier, claimedAt], [ticketNumber]
- GoldenTicket: campo updatedAt para audit trail
- WhaleActivity: [chain, timestamp, usdValue] (Akashic feed)
- WhaleActivity: [institutional, usdValue, timestamp] (dashboard institucional)
- WhaleActivity: [token, chain, timestamp] (analisis por token)
- WhaleActivity: [fromAddress, timestamp], [toAddress, timestamp] (wallet lookup)

next.config.js — Security headers institucionales:
- HSTS: max-age=31536000 includeSubDomains preload
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- no-store forzado en /api/health,akashic,golden-ticket,signals

Scanner Cluster:
- Polygon añadido al EVM Mesh (4 cadenas: ETH/BASE/BSC/POLYGON)
- Sovereign Ignition Protocol: validacion env en boot
- Redis Heartbeat Loop: 30s interval, TTL 60s"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ SOVEREIGN HARDENING v3 COMPLETADO
echo.
echo Verifica en Railway que el build pasa.
echo Luego ejecuta en Railway Shell:
echo   npx prisma migrate deploy
echo   (Para aplicar los nuevos compound indexes en produccion)
echo.
pause
