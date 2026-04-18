@echo off
echo ================================================================
echo  WHALE ALERT NETWORK — FINAL PUSH + LOTTIE COPY TO RAILWAY
echo ================================================================
echo.

echo 1. Creating public lotties folder so Railway can actually host them...
mkdir "public\lotties" 2>nul

echo.
echo 2. COPYING your desktop Lotties into the project...
echo (Railway does not have access to your Windows desktop, so we must copy them into the source code)
xcopy /Y "C:\Users\admin\Desktop\*.json" "public\lotties\"
xcopy /Y "C:\Users\admin\Desktop\lottifile\*.json" "public\lotties\"

echo.
echo 3. Adding new files to Git...
git add app/page.tsx
git add components/landing/ClientRootRouter.tsx
git add components/landing/ImmersiveManifestoLanding.tsx
git add public/lotties/*

echo.
echo 4. Committing updates...
git commit -m "feat(landing): post-login immersive white manifesto with fully integrated lotties"

echo.
echo 5. Pushing to GitHub (will trigger Railway deployment)...
git push origin main || git push

echo.
echo ================================================================
echo  PUSH COMPLETE. Railway will now build everything.
echo ================================================================
pause
