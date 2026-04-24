@echo off
cd /d "%~dp0"
echo ========================================================
echo  DESPLIEGUE A RAILWAY: APPKIT WEBSOCKET RECOVERY FIX
echo ========================================================

git add components/landing/MobileLanding.tsx

git commit -m "fix(mobile): revert to AppKit deep-linking to ensure iOS Safari websocket session recovery upon waking up"

:: Haciendo force push a origin y railway
git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ DESPLIEGUE COMPLETADO — Verifica el progreso en Railway.
pause
