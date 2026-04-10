@echo off
echo ================================================================
echo  WHALE ALERT NETWORK v3.0 — INSTITUTIONAL PUSH
echo  Manifest PWA + README Documentation + All Cosmic Changes
echo ================================================================
echo.

cd /d "%~dp0"

git add -A

git commit -m "docs(cosmic): institutional README, PWA manifest v3, full system documentation"

echo.
echo Pushing to Railway...
git push origin main

echo.
echo ================================================================
echo  PUSH COMPLETE.
echo  Railway will auto-deploy. Add CRON_SECRET to Railway env vars.
echo ================================================================
pause
