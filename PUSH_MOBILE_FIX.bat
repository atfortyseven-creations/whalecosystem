@echo off
cd /d "%~dp0"
echo ========================================================
echo  DESPLIEGUE A RAILWAY: FIX MOBILE WALLET DEEP LINKS
echo ========================================================

git add components/landing/MobileLanding.tsx

git commit -m "fix(mobile): resolve WC v2 deep-link race condition and auto-open wallet for signing"

:: Haciendo force push a origin y railway
git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ DESPLIEGUE COMPLETADO — Verifica el progreso en Railway.
pause
