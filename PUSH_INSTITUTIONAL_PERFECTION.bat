@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo  SOVEREIGN TERMINAL - INSTITUTIONAL DEPLOYMENT
echo ============================================================
echo.

echo [1/3] Staging all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: git add failed.
    pause & exit /b 1
)
echo  OK - staged.
echo.

echo [2/3] Writing commit message...
(
echo perf: aztec architecture integration + cosmic perfection
echo.
echo AZTEC ARCHITECTURE REPLICATION:
echo - /forum: 12-column Split-View Layout 35%% Categories, 65%% Latest
echo - /forum/t/[id]: Discourse-style layout with Left Author Sidebar and Interactive Timeline
echo - /forum/new: Minimalist high-end topic composer sans-serif, soft borders
echo - ForumHeader: Sub-navigation filters Categories, Latest, New, Top
echo.
echo COSMIC PERFECTION UI:
echo - Typography: Replaced terminal fonts with clean sans-serif and UnifrakturMaguntia for the Aztec logo
echo - Spacing: Massive 40px Institutional Gutters and 1110px bounded max-widths
echo - Hover States: 200ms silky transitions with #1a112a purple active states
echo - Landing Page: Purged green connection dot and 'Sovereign Session' text for absolute minimalism
echo.
echo BACKEND RESILIENCE:
echo - Fixed P2022 Prisma crash by stripping missing columns from topic/post selects
) > "%TEMP%\sovereign_commit.txt"

git commit --allow-empty -F "%TEMP%\sovereign_commit.txt"
del "%TEMP%\sovereign_commit.txt" 2>nul

echo.
echo [3/3] Pushing to origin/main...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: git push failed. Check remote and credentials.
    pause & exit /b 1
)

echo.
echo ============================================================
echo  PUSH COMPLETE - RAILWAY AUTO-DEPLOYS IN ~90 SECONDS
echo ============================================================
echo.
echo  POST-DEPLOY CHECKLIST (CRITICAL ORDER):
echo  1. POST /api/admin/sync-db     ^<-- RUN THIS FIRST (fixes all DB errors)
echo  2. GET  /api/admin/seed-forum  ^<-- Populate categories + topics
echo  3. Test /forum - should load instantly
echo  4. Test creating a new topic
echo.
pause
