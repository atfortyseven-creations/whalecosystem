@echo off
echo ================================================================
echo  WHALE ALERT — FINAL QUARTENARY PUSH (FATAL ORCHESTRATION FIX)
echo  Eliminates fragile shell chains and enforces start.sh
echo ================================================================
echo.

:: Add files safely
git add start.sh Dockerfile app/api/webhooks/whale-transfers/route.ts app/api/whales/stream/route.ts scripts/defi-scanner-worker.ts

:: Commit with single line string, avoiding newlines in batch
git commit -m "fix(deploy): strict sequential boot and eradicate ioredis module-level leakage"

echo.
echo Pushing to Railway...
git push origin main || git push
echo.
echo ================================================================
echo  PUSH COMPLETE. Monitor Railway dashboard for GREEN deployment.
echo ================================================================
pause
