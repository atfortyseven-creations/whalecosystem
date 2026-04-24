@echo off
cd /d "%~dp0"
echo ========================================================
echo  DESPLIEGUE A RAILWAY: FIX MOBILE UI ENFORCER
echo ========================================================

git add components/layout/MobileEnforcer.tsx

git commit -m "fix(layout): remove innerWidth check from MobileEnforcer to prevent mobile UI takeover on narrow PC windows"

:: Haciendo force push a origin y railway
git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ DESPLIEGUE COMPLETADO — Verifica el progreso en Railway.
pause
