@echo off
cd /d "%~dp0"
echo ========================================================
echo  DESPLIEGUE A RAILWAY: FIX SOVEREIGN AUTH & SYNC
echo ========================================================

git add app/page.tsx
git add components/landing/MobileLanding.tsx
git add components/shared/ConnectWalletModal.tsx
git add app/api/whale-stream/route.ts
git add app/api/auth/complete-signup/route.ts
git add app/api/auth/send-code/route.ts
git add app/api/auth/qr-session/route.ts

git commit -m "fix(auth): harden sovereign pc-to-mobile sync, enforce pc redirect, and resolve prisma IDE errors"

:: Haciendo force push a origin y railway
git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ DESPLIEGUE COMPLETADO — Verifica el progreso en Railway.
pause
