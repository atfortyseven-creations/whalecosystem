@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: FINAL PARADIGM DEPLOYMENT (PHASE 15)
echo ========================================================

git add .
git commit -m "feat(ui): implement Phase 15 Final Paradigm" -m "Resolved P2022 density schema drift. Restructured Catastrophe Chronicle to 2-column grid. Adjusted Lottie sizes and purged SEC markers. Integrated Sovereign Scanner Direct Handshake documentation and image matrix. Updated README.md."

git push origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Final Paradigm pushed to Railway successfully.
pause
