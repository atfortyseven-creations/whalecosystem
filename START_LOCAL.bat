@echo off
title Whale Alert Network - Sovereign Launcher
echo.
echo ============================================================
echo  WHALE ALERT NETWORK - SOVEREIGN LOCAL LAUNCHER
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Updating PM2 daemon to latest version...
call pm2 update 2>nul
timeout /t 1 /nobreak >nul

echo [2/4] Stopping any existing PM2 processes...
call pm2 delete all 2>nul
timeout /t 1 /nobreak >nul

echo [3/4] Verifying .next build exists...
if not exist ".next" (
    echo  [!] No production build found. Running next build first...
    call npx next build
    if errorlevel 1 (
        echo  [!] Build failed. Cannot launch production server.
        echo      Run: npm run dev   to launch in development mode instead.
        pause
        exit /b 1
    )
)

echo [4/4] Launching sovereign-web and sovereign-worker via PM2...
call pm2 start ecosystem.config.json
call pm2 save --force

echo.
echo ============================================================
echo  ECOSYSTEM STATUS
echo ============================================================
call pm2 list
echo.
echo  sovereign-web  running on: http://localhost:3000
echo  sovereign-worker listening on WebSocket port 3001
echo.
echo  To view live logs:    pm2 logs
echo  To stop everything:   pm2 kill
echo ============================================================
pause
