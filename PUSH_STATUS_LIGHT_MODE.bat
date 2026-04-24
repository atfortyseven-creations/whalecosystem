@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: LIGHT MODE STATUS UPDATE
echo ========================================================

git add app/status/page.tsx

git commit -m "style(ui): refactor public status terminal to institutional light mode"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Light Mode pushed successfully.
pause
