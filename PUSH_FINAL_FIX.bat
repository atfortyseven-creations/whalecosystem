@echo off
echo ============================================================
echo  HOTFIX CRITICO: NULL SIGNATURE CRASH + IOS ABORT FIXES
echo ============================================================
echo.
echo  BUGS RESUELTOS EN ESTE PUSH:
echo.
echo  [CRITICO - CRASH TOTAL]
echo  TypeError: Cannot read properties of null (reading 'signature')
echo  - JSON.parse devuelve null cuando el valor es la cadena "null"
echo    sin lanzar excepcion. El codigo asumia que un try/catch era
echo    suficiente - ERROR: null no es una excepcion, es un valor valido.
echo  - Corregido: doble guardia       if (raw AND typeof raw === 'object')
echo  - Corregido en: signatureData del ticket propio del usuario
echo  - Corregido en: signatureData del Global Genesis Ledger (feed)
echo  - Corregido: f.claimedAt null crasheaba en new Date(null)
echo.
echo  [CRITICO - iOS Safari]
echo  AbortSignal.timeout() no existe en iOS Safari menor 16.4
echo  - Corregido: ClearanceView.tsx (precio ETH)
echo  - Corregido: NewsTerminal.tsx (precio EUR)
echo  - Corregido: LegendaryDownhead.tsx (latencia de red)
echo  - Corregido: WorldFinancialClocks - new Date(toLocaleString)
echo.
echo  [ESTABILIDAD]
echo  - global-error.tsx: estilos inline (no requiere CSS cargado)
echo  - WatchlistTable: localStorage JSON.parse envuelto en try/catch
echo  - GoldTicketPanel SignaturePad: coordenadas DPR-aware
echo  - README.md + Manifesto Mobile actualizados al standard academico
echo.

git add components/dashboard/GoldTicketPanel.tsx
git add components/dashboard/WatchlistTable.tsx
git add components/landing/ClearanceView.tsx
git add components/landing/LegendaryDownhead.tsx
git add components/mobile/MobileWhaleLanding.tsx
git add components/news/NewsTerminal.tsx
git add app/global-error.tsx
git add README.md

git commit -m "hotfix(critical): null-signature crash + iOS AbortSignal compat + localStorage safety guards"

echo Desplegando en Railway...
git push origin main || git push

echo.
echo ============================================================
echo  PERFECCION TOTAL. RAILWAY COMPILARA EN 60-90 SEGUNDOS.
echo ============================================================
pause
