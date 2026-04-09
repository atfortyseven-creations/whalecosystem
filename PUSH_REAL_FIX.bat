@echo off
echo ============================================================
echo  THE REAL FIX: next.config.js + WalletConnect Project ID
echo ============================================================
echo.
echo  Arreglado:
echo  1. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID inyectado en build
echo  2. CSP duplicada eliminada (conflicto next.config.js x middleware)
echo  3. Project ID real: 093232b25784a0694c642ad54a6331fa
echo.

git add next.config.js config/appkit.tsx app/providers.tsx middleware.ts lib/blockchain/rpcClient.ts lib/blockchain/MempoolWatcher.ts lib/blockchain/ResilientProvider.ts

git commit -m "fix(critical): inject NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID at build time; remove duplicate CSP from next.config.js; fix Clerk blocking"

echo Pushing a Railway...
git push origin main || git push
echo.
echo ============================================================
echo  LISTO. 3 minutos de deploy y la web debe cargar completa.
echo ============================================================
pause
