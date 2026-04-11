@echo off
echo ================================================================
echo  WHALE ALERT — INSTITUTIONAL HARDENING PUSH
echo  Fix: QR Handshake, Prisma Schema, TypeScript Types, and UI Crashes
echo ================================================================
echo.

cd /d "%~dp0"

echo.
echo [1/2] Adding Modified Infrastructure Files to GIT...
git add prisma/schema.prisma
git add app/api/institutional/stats/route.ts
git add app/api/auth/qr-sync/route.ts
git add app/providers.tsx
git add components/ui/InstitutionalErrorBoundary.tsx
git add components/dashboard/WatchlistTable.tsx
git add components/dashboard/NewPairsTable.tsx
git add components/mobile/MobileWhaleLanding.tsx

echo.
echo [2/2] Committing and Pushing to Railway...
git commit -m "fix(core): institutional hardening - qr handshake robust, prisma schema fix, and ui stability"
git push origin main

echo.
echo ================================================================
echo  ULTRA-STABLE BUILD PUSHED. Railway will deploy automatically.
echo ================================================================
pause
