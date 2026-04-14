@echo off
echo ================================================================
echo   SOVEREIGN VAULT SYNTAX FIX - RAILWAY DEPLOYMENT
echo   Fix: Removed orphaned closing ^</div^> in SovereignVault.tsx
echo   Error was: "Unterminated regexp literal" at line 438
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/4] Staging fix...
git add components/dashboard/SovereignVault.tsx

echo [2/4] Committing...
git commit -m "fix(build): remove orphaned closing div in SovereignVault.tsx

The extra </div> at line 438 caused Next.js/webpack to emit an
'Unterminated regexp literal' syntax error during npx next build,
crashing the Railway production build.

Root cause: JSX tag imbalance - SovereignVault had 3 closing div
tags for 2 opening wrapper divs at the return statement.

Fix: Removed the superfluous third </div>, restoring correct JSX
tag balance and allowing the TypeScript/webpack compilation to
complete successfully."

echo [3/4] Pushing to origin...
git push origin main

echo [4/4] Done! Monitor Railway dashboard for build success.
echo.
echo Railway build should now complete without webpack errors.
pause
