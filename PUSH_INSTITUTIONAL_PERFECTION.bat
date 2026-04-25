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
echo perf: forum web3 redesign + capital ledger hardening + DPI wave fix
echo.
echo FORUM - ZERO-LOAD ARCHITECTURE:
echo - Removed framer-motion from template.tsx (instant tab navigation)
echo - Removed all blocking loading guards from all forum pages
echo.
echo FORUM - WEB3 MINIMALIST REDESIGN:
echo - ForumHeader: removed Old English logotype + lucide icons, mono text nav
echo - forum/page.tsx: clean tab bar + topic list, client-side fetch
echo - forum/new/page.tsx: fixed style-jsx App Router bug, mono composer
echo - t/[id]/page.tsx: removed sidebar, blue colors, icons; PostRow mono
echo - u/[address]/page.tsx: tabs ACTIVITY/TOPICS/REPLIES, mono feed
echo - tags/page.tsx: monochrome bar chart, no Tag icons
echo - notifications/page.tsx: signal log table, no colored icons
echo - badges/page.tsx: plain text table, no Award/Star/Zap icons
echo - groups/page.tsx: cohort table with live Prisma counts
echo - guidelines/page.tsx: numbered rules mono, no Shield icons
echo - anniversaries/page.tsx: epoch table, no Cake icon
echo - forum/layout.tsx: bg #FAF9F6, text #050505, max-w 920px
echo.
echo CAPITAL LEDGER - HARDENING:
echo - New route /api/intelligence/mass-transfers (ETH+BSC+BASE)
echo - api-client.ts: direct fetch, 30s refetch / 25s stale
echo - MassTransferIntel.tsx: floor pills ALL/$100K to $50M
echo - Real Sync button with bust cache + queryClient invalidate
echo - Removed ArrowUpDown unused import and framer-motion
echo.
echo WAVE PATTERN - MAX DPI FIX:
echo - WavePatternOverlay reads devicePixelRatio on mount
echo - Patron Cosmico: 280px/DPR CSS = same physical px on all screens
echo - Hokusai wave: 100%% auto replaced with cover (no mobile zoom)
echo.
echo FORUM SEED - 50 INSTITUTIONAL NODES:
echo - /api/admin/seed-forum: 50 users, 10 topics, 48 replies
echo - Topics: ZK-SNARKs, MEV, Noir, DeFi yields, RWA, whale clustering
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
echo  POST-DEPLOY CHECKLIST:
echo  1. GET /api/admin/seed-forum  (populate 50 users + topics)
echo  2. Check Capital Ledger tab   (floor pills + LIVE indicator)
echo  3. Open on iPhone/Android     (wave should be crisp at any DPI)
echo.
pause
