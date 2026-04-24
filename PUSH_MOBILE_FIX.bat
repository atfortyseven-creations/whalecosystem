@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: MOBILE INCOGNITO FIX + DISCONNECT BUTTON
echo ========================================================

git add components/landing/MobileLanding.tsx

git commit -m "fix(mobile): incognito redirect + scanner disconnect button

- Add linkedAddress state: guarantees effectiveAddress is never null
  after performLink(), fixes blank screen on Android/iOS incognito
- Add useDisconnect + handleDisconnect: clears cookie, sessionStorage
  and wagmi session atomically when user wants to switch wallets
- Add Desconectar Session button in ConnectedScreen scanner area"

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo DEPLOY LISTO. Verifica Railway dashboard.
pause
