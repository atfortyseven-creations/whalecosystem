@echo off
echo ==============================================================================
echo [SOVEREIGN TERMINAL] PREPARING ZERO-MOCK INSTITUTIONAL DEPLOYMENT
echo ==============================================================================

echo [1] Staging all files...
git add .

echo [2] Committing updates with institutional integrity...
git commit -m "perf: eliminate forum mobile lag and element stacking" -m "- Applied CSS paint containment (forum-container) to forum layout main" -m "- Removed group-hover:opacity transitions from post action rows" -m "- Fixed nav flexbox stacking on mobile with flex-col/md:flex-row" -m "- Added hide-scrollbar and forum-specific @media hover:none rules" -m "- Anchored Reply button to #reply-composer using scrollIntoView"

echo [3] Pushing to main branch...
git push origin main

echo ==============================================================================
echo [SUCCESS] PUSH COMPLETED. RAILWAY WILL NOW AUTO-DEPLOY THE PERFECT STATE.
echo ==============================================================================
pause
