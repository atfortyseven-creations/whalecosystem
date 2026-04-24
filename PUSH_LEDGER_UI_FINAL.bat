@echo off
cd /d "%~dp0"
echo ========================================================
echo  DESPLIEGUE A RAILWAY: FIX HEIGHT COLLAPSE
echo ========================================================

git add components/dashboard/WhaleDashboard.tsx

git commit -m "fix(ui): uncollapse verified ledger rows by migrating rigid height to flex-1 min-h-[950px]"

:: Haciendo force push por si acaso, aunque ya estamos en la punta
git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo ✅ DESPLIEGUE FORZADO COMPLETADO — Verifica el progreso en Railway.
pause
