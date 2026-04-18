@echo off
echo ================================================================
echo  WHALE ALERT NETWORK — PUSHING AUTHENTICATION SECURE FRAME FIX
echo ================================================================
echo.

echo 1. Adding Auth config fix...
git add config/appkit.tsx

echo.
echo 2. Committing updates...
git commit -m "fix(auth): make appkit url dynamic to prevent cross-origin social login blocks"

echo.
echo 3. Pushing to GitHub (will trigger Railway deployment)...
git push origin main || git push

echo.
echo ================================================================
echo  PUSH COMPLETE. Google & Social Auth frames are now unlocked.
echo ================================================================
pause
