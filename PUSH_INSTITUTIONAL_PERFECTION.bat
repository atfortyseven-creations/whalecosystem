@echo off
echo ==============================================================================
echo [SOVEREIGN TERMINAL] PREPARING ZERO-MOCK INSTITUTIONAL DEPLOYMENT
echo ==============================================================================

echo [1] Staging all files...
git add .

echo [2] Committing updates with institutional integrity...
git commit -m "feat: complete forum system — discourse tabs, perf, mobile" -m "- Built /forum/users live directory (Prisma User query + grid UI)" -m "- Built /forum/groups dynamic aggregator (prisma.user.groupBy by tier)" -m "- Built /forum/anniversaries with real-time month matching algorithm" -m "- Built /forum/badges with Genesis/Pro/Verified/Signal ranks" -m "- Built /forum/guidelines institutional manifesto page" -m "- Wired ForumHeader hamburger links to all new routes" -m "- Added /forum to MobileEnforcer DIRECT_ACCESS_ROUTES" -m "- Created /api/admin/sync-db production Prisma schema enforcer" -m "- Created /api/admin/seed-forum category injector for Railway" -m "- Applied CSS paint containment (forum-container) to isolate forum GPU" -m "- Removed group-hover opacity transitions (zero repaint on mobile scroll)" -m "- Fixed nav flexbox stacking on mobile (flex-col / md:flex-row)" -m "- Added hide-scrollbar utility + @media hover:none forum rules" -m "- Anchored Reply buttons to #reply-composer via scrollIntoView"

echo [3] Pushing to main branch...
git push origin main

echo ==============================================================================
echo [SUCCESS] PUSH COMPLETED. RAILWAY WILL NOW AUTO-DEPLOY THE PERFECT STATE.
echo ==============================================================================
pause
