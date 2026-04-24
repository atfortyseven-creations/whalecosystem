@echo off
echo ==============================================================
echo [SOVEREIGN TERMINAL] DEPLOYING THE FINAL PARADIGM (PHASES 7-14)
echo ==============================================================
echo.
echo Iniciando protocolo de sincronizacion absoluta...
echo.

echo [1/3] Añadiendo todos los modulos blindados al Ledger...
git add .
echo.

echo [2/3] Sellando el compromiso criptografico (Commit)...
git commit -m "[INSTITUTIONAL SYNC] The Final Paradigm: Phases 7-14 (Deadman, Mempool, HW-Detect, Anti-Replay)"
echo.

echo [3/3] Desplegando en los servidores de produccion de Railway...
echo Ejecutando "railway up"...
railway up --detach

echo.
echo ==============================================================
echo [DEPLOYMENT INITIATED]
echo La artilleria pesada esta ahora en camino hacia Railway.
echo Puedes monitorizar los logs en tu panel de Railway.
echo ==============================================================
pause
