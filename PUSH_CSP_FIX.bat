@echo off
echo ============================================================
echo  PUSH COMPLETO: CSP + WALLETCONNECT REAL PROJECT ID
echo ============================================================
echo.
echo Project ID: 093232b25784a0694c642ad54a6331fa
echo.

git add config/appkit.tsx app/providers.tsx middleware.ts lib/blockchain/rpcClient.ts lib/blockchain/MempoolWatcher.ts lib/blockchain/ResilientProvider.ts

git commit -m "fix: set real WalletConnect projectId + fix CSP for Clerk/Reown + lazy load viem WebSockets"

echo Pushing...
git push origin main || git push
echo.
echo ============================================================
echo  LISTO. Espera 3 minutos y recarga la web.
echo ============================================================
pause
