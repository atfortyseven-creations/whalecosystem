@echo off
echo ================================================================
echo  PUSH: LANDING PAGE REDESIGN + SETTINGS FOOTER + NULL CRASH FIX
echo ================================================================
echo.

git add components/landing/WhaleAlertLanding.tsx
git add components/shared/GlobalSettingsModal.tsx
git add components/dashboard/GoldTicketPanel.tsx
git add components/dashboard/WatchlistTable.tsx
git add components/landing/ClearanceView.tsx
git add components/landing/LegendaryDownhead.tsx
git add components/mobile/MobileWhaleLanding.tsx
git add components/news/NewsTerminal.tsx
git add app/global-error.tsx

git commit -m "feat: redesign landing page + fix settings footer + resolve null-signature crash"

echo Desplegando en Railway...
git push origin main || git push

echo.
echo ================================================================
echo  LISTO. Railway compilara en 60-90 segundos.
echo ================================================================
pause
