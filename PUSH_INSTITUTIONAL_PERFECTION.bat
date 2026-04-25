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
echo perf: schema hardening + forum fixes + aztec academic section
echo.
echo CRITICAL SCHEMA FIXES:
echo - /api/admin/sync-db: idempotent SQL endpoint creates all missing
echo   tables and columns like avatarUrl, displayName, bio, tier, isPro,
echo   ForumTelemetry, AuditLog, ForumNotification with IF NOT EXISTS
echo - forum/layout.tsx: raw SQL query for avatarUrl to avoid P2022
echo - posts and topics routes: removed lastActive upsert
echo.
echo FORUM ZERO-MOCK FIXES:
echo - TitaniumGate: /forum added to public whitelist
echo - /api/forum/categories: removed auth wall
echo - /api/forum/topics GET: removed auth wall
echo - /api/forum/topics/[id] GET: removed auth wall
echo - posts and topics POST: resilient upsert instead of findUnique
echo - forum/new/page.tsx: complete rewrite with purple styles
echo - forum/t/[id]/page.tsx: rewrite with error messages
echo - ForumRadar: deleted from forum home
echo.
echo LANDING PAGE:
echo - ClientRootRouter: DownheadSection replaced with AztecArchitectureSection
echo - AztecArchitectureSection: 6 academic pillars + parameter reference
echo - Session bar: redesigned 44px minimal strip
echo - page.tsx: removed forced redirect
echo.
echo FORUM HEADER:
echo - powered by Aztec Network now uses font-aztec-mono and font-aztec-h2
) > "%TEMP%\sovereign_commit.txt"

git commit -F "%TEMP%\sovereign_commit.txt"
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
