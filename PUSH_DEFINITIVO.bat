@echo off
cd /d "%~dp0"
echo =====================================================
echo  RAILWAY: MOBILE REDIRECT - DEFINITIVE FIX
echo =====================================================
git add components/landing/MobileLanding.tsx
git add components/landing/ConnectPage.tsx
git add components/layout/MobileEnforcer.tsx
git commit -m "fix(mobile): useAppKitAccount as primary source + single clean link effect - eliminate stale closure deadlock"
git push --force origin HEAD:main
git push --force railway HEAD:main
echo.
echo DEPLOY LISTO. Verifica Railway.
pause
