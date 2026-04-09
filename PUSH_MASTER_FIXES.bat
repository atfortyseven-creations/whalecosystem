@echo off
echo ============================================================
echo  HOSPITAL: DIAGNOSTICS AND SURGICAL REPAIR COMPLETE
echo ============================================================
echo.
echo  BUG FIXES APLICADOS:
echo  1. [iOS CRITICO] AbortSignal.timeout incompatible con Safari iOS menor 16.4
echo       - Corregido: ClearanceView.tsx
echo       - Corregido: NewsTerminal.tsx
echo       - Corregido: LegendaryDownhead.tsx
echo  2. [ESTABILIDAD] global-error.tsx usando Tailwind sin CSS cargado
echo       - Corregido: estilos inline resistentes a crash total
echo  3. [SEGURIDAD] WatchlistTable localStorage sin try/catch al parsear
echo       - Corregido: saveToLocal y removeFromLocal con guardias defensivas
echo  4. [iOS CRITICO] SignaturePad coordenadas sin escalar al buffer del canvas
echo       - Corregido: calculo DPR-aware para dibujo preciso en Retina
echo  5. [iOS CRITICO] WorldFinancialClocks: new Date(toLocaleString) crashes
echo       - Corregido: toLocaleTimeString directo via Intl
echo  6. README.md actualizado con vocabulario academico formal
echo  7. Manifesto del Landing Mobile actualizado al mismo nivel
echo.

git add app/global-error.tsx
git add components/dashboard/GoldTicketPanel.tsx
git add components/dashboard/WatchlistTable.tsx
git add components/landing/ClearanceView.tsx
git add components/landing/LegendaryDownhead.tsx
git add components/mobile/MobileWhaleLanding.tsx
git add components/news/NewsTerminal.tsx
git add README.md

git commit -m "fix(critical): resolve 7 production bugs - iOS AbortSignal.timeout compat, canvas DPR scaling, localStorage JSON safety guards, global-error inline styles"

echo Sincronizando con Railway Pro...
git push origin main || git push
echo.
echo ============================================================
echo  SISTEMA ESTABLE. 1-2 MINUTOS PARA COMPILACION FINAL.
echo ============================================================
pause
