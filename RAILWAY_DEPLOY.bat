@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: FINAL PARADIGM CLI DEPLOYMENT (PHASE 15)
echo ========================================================

git add .
git commit -m "feat(ui): implement Phase 15 Final Paradigm updates"

echo Iniciando despliegue directo con Railway CLI...
railway up

echo.
echo [OK] Railway up ejecutado.
pause
