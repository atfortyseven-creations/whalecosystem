@echo off
cd /d "%~dp0"
echo ========================================================
echo  MOBILE + DASHBOARD FIXES — PUSHING TO RAILWAY
echo ========================================================

git add components/layout/MobileEnforcer.tsx
git add components/dashboard/EntityGraphVis.tsx
git add components/premium/PremiumMatrixStack.tsx
git add components/dashboard/WhaleProShell.tsx
git add components/mobile/MobileWhaleLanding.tsx

git commit -m "fix(mobile+dashboard): whale post navigation + empty scroll zones

Mobile:
- MobileEnforcer now passes onEnterNews={() => setShowNews(true)} to MobileWhaleLanding
- Connected users can now tap THE WHALE POST to enter MobileNewsShell
- QR scanner still available as second option post-connection

Dashboard blank space:
- WhaleProShell: p-8 -> p-6 pb-4, eliminates 32px grey gap at bottom
- PremiumMatrixStack: removed pb-10 (40px blank at dashboard tab bottom)
- EntityGraphVis: removed mb-24 (96px blank at graph bottom)

Entity Graph:
- Panel height increased min-h-[75vh] -> min-h-[85vh]
- More visible canvas space for node/link exploration"

git push origin main

echo.
echo ✅ DONE — Deploy triggered on Railway.
pause
