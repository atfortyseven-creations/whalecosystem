@echo off
cd /d "%~dp0"
echo ========================================================
echo  DOWNPAGE + SCROLL FIX — PUSHING TO RAILWAY
echo ========================================================

git add components/mobile/MobileWhaleLanding.tsx
git add components/layout/MobileEnforcer.tsx
git add components/dashboard/WhaleProShell.tsx

git commit -m "fix(ui): fix tab empty scroll + redesign mobile downpage

Dashboard:
- WhaleProShell main area now overflow-hidden
- Inner scroll wrapper is position:absolute inset-0
- Tabs only show their own content — no blank grey area when scrolling

Mobile downpage (PageManifesto):
- Removed massive text block
- Full-screen snap page: Hokusai wave covers bottom 62%
- Centered whale logo + WHALE ALERT title
- Twitter + GitHub social icons in a row
- Legal links + copyright pinned above wave
- Clean ivory fade gradient from top to separate from wave"

git push origin main

echo.
echo ✅ DONE — Deploy triggered on Railway.
pause
