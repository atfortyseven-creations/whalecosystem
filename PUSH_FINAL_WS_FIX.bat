@echo off
echo ================================================================
echo  THE FINAL EXORCISM: LAZY LOADING WEBSOCKETS
echo ================================================================
echo.
echo Removing global WebSockets from Viem and Ethers.js
echo.

git add lib/blockchain/rpcClient.ts lib/blockchain/MempoolWatcher.ts lib/blockchain/ResilientProvider.ts

git commit -m "fix(ssr): lazy load viem and ethers WebSockets to prevent module-level 402 UncaughtExceptions on invalid keys"

echo Pushing...
git push origin main || git push
echo.
echo ================================================================
echo  WOKER WEBSOCKETS ISOLATED. PUSH COMPLETE.
echo ================================================================
pause
