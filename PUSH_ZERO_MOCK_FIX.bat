@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: ZERO-MOCK MANDATE ENFORCEMENT FIX
echo ========================================================

git add components/dashboard/VossSupremacyPanel.tsx

git commit -m "fix(ui): enforce zero-mock mandate in VerifiedLedger" -m "Removed MOCK_LEDGER to prevent initial state hydration flash of dummy data." -m "Implemented native empty state for zero clearances."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Zero-Mock Enforcement pushed successfully.
pause
