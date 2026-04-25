@echo off
echo =======================================================
echo SOVEREIGN TERMINAL: VANGUARD INSTITUTIONAL DEPLOYMENT
echo =======================================================
echo.
echo Ejecutando verificacion de tipos (Type-Check)...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo [ERROR] La compilacion TypeScript ha fallado. Abortando despliegue.
    pause
    exit /b %errorlevel%
)

echo.
echo Construyendo aplicacion localmente (Build Check)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Next.js Build ha fallado. Abortando despliegue.
    pause
    exit /b %errorlevel%
)

echo.
echo Empaquetando actualizacion de Telemetria (Bell Icon -> Session Logs)...
git add .
git commit -m "feat(ui): connect global bell notification icon to omni security audit logs endpoint"

echo.
echo Iniciando despliegue en produccion (Railway)...
git push origin main

echo.
echo =======================================================
echo DESPLIEGUE INICIADO CON EXITO
echo Monitoriza Railway para ver la propagacion de los nodos.
echo =======================================================
pause
