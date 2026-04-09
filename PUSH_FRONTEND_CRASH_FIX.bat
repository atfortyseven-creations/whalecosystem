@echo off
echo ================================================================
echo  GLOBAL ERROR 402 FIX (THE FRONTEND CRASH)
echo  Isolating WebSockets from Server-Side Rendering
echo ================================================================
echo.

git add lib/blockchain/MempoolWatcher.ts lib/blockchain/rpcClient.ts

git commit -m "fix(ssr): remove global auto-start of MempoolWatcher and fix Alchemy Demo Key 402 WS UncaughtExceptions"

echo.
echo Pushing...
git push origin main || git push
echo.
echo ================================================================
echo  THE 402 UNCAUGHT EXCEPTION HAS BEEN NEUTRALIZED.
echo ================================================================
pause
