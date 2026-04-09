@echo off
echo ================================================================
echo  WHALE ALERT — THE CRLF FIX (FINAL DEPLOYMENT PUSH)
echo  Bypassing Windows CRLF constraints through NPM Orchestration
echo ================================================================
echo.

git add package.json Dockerfile

git commit -m "fix(deploy): bypass CRLF execution failure by moving orchestration to npm scripts"

echo.
echo Pushing to Railway...
git push origin main || git push
echo.
echo ================================================================
echo  PUSH COMPLETE. Railway will now properly spawn Next.js
echo ================================================================
pause
