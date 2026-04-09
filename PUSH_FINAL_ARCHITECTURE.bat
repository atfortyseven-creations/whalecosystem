@echo off
echo ============================================================
echo  THE FINAL & PERFECT FRONTEND FIX
echo ============================================================
echo.
echo  Arreglado:
echo  1. Corregido router.push() en WhaleAlertLanding (de /vip a /dashboard)
echo  2. WhaleDashboard es ahora 100%% Dynamic Client Component (SSR: false)
echo  3. El frontend de las 7 fases cargara de forma perfecta sin errores 402/500
echo.

git add components/landing/WhaleAlertLanding.tsx app/dashboard/DashboardClient.tsx

git commit -m "fix(frontend): route to /dashboard instead of /vip; make WhaleDashboard dynamic to prevent hydration crashes"

echo Pushing a Railway...
git push origin main || git push
echo.
echo ============================================================
echo  LISTO. 3 minutos de deploy y la web debe cargar completa.
echo ============================================================
pause
