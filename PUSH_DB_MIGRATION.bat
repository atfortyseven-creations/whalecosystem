@echo off
echo ============================================================
echo  SOVEREIGN DB MIGRATION — Creating missing tables
echo ============================================================
echo.
echo [1/2] Pushing Prisma schema to production database...
npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] prisma db push failed. Check DATABASE_URL in .env
    pause
    exit /b 1
)
echo.
echo [2/2] Generating fresh Prisma client...
npx prisma generate
echo.
echo ============================================================
echo  DONE — NewsArticle and other missing tables created.
echo  Now commit + push to Railway to deploy the code fixes.
echo ============================================================
echo.
git add -A
git commit -m "fix: suppress P2021 log flood, Binance WSS fallback, dashboard scroll"
git push
pause
