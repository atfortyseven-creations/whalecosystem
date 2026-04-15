@echo off
echo ============================================================
echo  SOVEREIGN DEPLOYMENT — DB MIGRATION + CODE PUSH
echo ============================================================
echo.

echo [1/4] Pushing Prisma schema to production DB...
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 echo [WARN] Prisma push returned %ERRORLEVEL%

echo.
echo [2/4] Generating Prisma client...
call npx prisma generate

echo.
echo [3/4] Generating VOSS Master Plan markdown artifact...
if exist scripts\generate_voss_plan.js (
    call node scripts/generate_voss_plan.js
) else (
    echo [SKIP] scripts\generate_voss_plan.js not found.
)

echo.
echo [4/4] Committing and pushing all fixes...
call git add -A
call git commit -m "fix(sovereign): WSS 451 fallback, dashboard scroll, Voss Matrix tab, NewsArticle migration"
echo [PUSHING] This may take a moment to sync with Railway...
call git push

echo.
echo ============================================================
echo  DEPLOYMENT SEQUENCE COMPLETE
echo ============================================================
pause
