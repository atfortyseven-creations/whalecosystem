@echo off
echo ============================================================
echo  CONNECT PAGE REDESIGN
echo ============================================================
echo.
echo  Arreglado:
echo  1. Eliminado el "Ready" y el punto verde.
echo  2. Logo de la Ballena masivo centrado en diseño horizontal.
echo  3. El Mobile Sync (roto) eliminado, ahora RainbowKit asume el QR.
echo.

git add components/landing/ConnectPage.tsx

git commit -m "fix(ui): redesign ConnectPage to horizontal layout centered with whale logo, removing broken Mobile Sync QR"

echo Pushing a Railway...
git push origin main || git push
echo.
echo ============================================================
echo  LISTO.
echo ============================================================
pause
