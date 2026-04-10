@echo off
echo ================================================================
echo  WHALE ALERT — CRITICAL BUILD FIX
echo  Fix: swcMinify removed + serverExternalPackages + Prisma build crash
echo ================================================================
echo.

cd /d "%~dp0"

git add next.config.js lib/prisma.ts

git commit -m "fix(build): remove swcMinify, fix serverExternalPackages for Next.js 15, guard Prisma against build-time DATABASE_URL absence"

echo.
echo Pushing to Railway...
git push origin main

echo.
echo ================================================================
echo  BUILD FIX PUSHED. Railway will retry the deployment now.
echo ================================================================
pause
