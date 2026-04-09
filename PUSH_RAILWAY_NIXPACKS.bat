@echo off
echo ================================================================
echo  WHALE ALERT — OVERRIDING RAILWAY NIXPACKS (THE LAST BOSS)
echo  Deploying the OOMKiller Immunity Patch
echo ================================================================
echo.

git add railway.json railway.toml package.json

git commit -m "fix(deploy): override Railway Nixpacks startCommand and inject OOMKiller immunity caps"

echo.
echo Pushing to Railway...
git push origin main || git push
echo.
echo ================================================================
echo  PUSH COMPLETE. Railway will now obey our V8 memory limits.
echo ================================================================
pause
