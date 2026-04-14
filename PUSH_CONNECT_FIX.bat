@echo off
cd /d "%~dp0"
echo ========================================================
echo  CONNECT PAGE FIXES — PUSHING TO RAILWAY
echo ========================================================

git add components/layout/ClientLayout.tsx
git add components/landing/CelestialMeshBackground.tsx

git commit -m "fix(connect): remove dark footer + enlarge wave white base

ClientLayout:
- /connect now excluded from Downhead footer
- Dark black newsletter/legal section will no longer render on /connect

CelestialMeshBackground:
- Wave img: added minHeight 42% + objectFit cover to expand white base
- L3 gradient: ivory now fades to transparent at 50% (was 40%)
- Result: wave white base covers more of the cream background area"

git push origin main

echo.
echo ✅ DONE — Deploy triggered on Railway.
pause
