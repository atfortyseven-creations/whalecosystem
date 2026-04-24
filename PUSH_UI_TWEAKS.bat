@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: UI/UX TWEAKS
echo ========================================================

git add components/landing/ConnectPage.tsx

git commit -m "style(ui): connect page tweaks" -m "1. Fixed mobile viewport clipping." -m "2. Increased wave background visibility." -m "3. Removed ECDSA subtitle." -m "4. Streamlined verified identity text."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] UI Tweaks pushed successfully.
pause
