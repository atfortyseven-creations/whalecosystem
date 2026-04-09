@echo off
echo ================================================================
echo  WHALE ALERT — SECONDARY ARCHITECTURE PUSH
echo  Fixes Alpine Linux PATH resolution and restores Mesh Daemons
echo ================================================================
echo.
git add Dockerfile scripts/solana-worker.ts package.json
git commit -m "fix(deploy): restore sovereign mesh daemon and fix alpine path

CRITICAL FIXES:
1. Dockerfile              - Replaced 'next start' with 'npx next start' as 'next' is not in global PATH on node:alpine
2. Dockerfile              - Restored Sovereign Mesh and Solana background daemons (running in background so they don't block boot)
3. scripts/solana-worker   - Changed raw 'ioredis' connection to our resilient 'createRedisClient' to prevent fatal UnhandledPromiseRejection if REDIS_URL drops or locally fails.
"
echo.
echo Pushing to Railway...
git push origin main || git push
echo.
echo ================================================================
echo  PUSH COMPLETE. Railway will now build with full Sovereign Daemons.
echo ================================================================
pause
