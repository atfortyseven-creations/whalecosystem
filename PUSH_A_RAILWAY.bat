@echo off
echo ==============================================
echo [WHALE ALERT] Iniciando Push Seguro a la Nube
echo ==============================================
echo.
echo 1. Guardando archivos (git add .)
git add .
echo.
echo 2. Empaquetando cambios (git commit)
git commit -m "fix(build): remove prisma db push from build time — Railway green deploy"
echo.
echo 3. Enviando a los servidores de Railway/Github (git push)
git push origin main || git push
echo.
echo ==============================================
echo [WHALE ALERT] PUSH COMPLETADO. Verifica Railway.
echo ==============================================
pause
