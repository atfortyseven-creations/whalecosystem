@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY DEPLOY: MOBILE REDIRECT + QR WARNING FIX
echo ========================================================

git add components/landing/MobileLanding.tsx
git add components/landing/ConnectPage.tsx
git add components/layout/MobileEnforcer.tsx

git commit -m "fix(mobile): bulletproof redirect via live refs - defeat stale closure race on Android/AppKit"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo DEPLOY COMPLETADO. Verifica Railway dashboard.
pause
