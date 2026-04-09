@echo off
echo ============================================================
echo  SOVEREIGN VIP & METADATA SIGNATURES SYNC
echo ============================================================
echo.
echo  Modificaciones:
echo  1. App/Vip (Redirect 100%% Nativo al Dashboard de 7 Fases)
echo  2. Signature Canvas y Empaquetado JSON IP/Pais/Telemetria
echo  3. HUD Brutalista de Telemetria en el Gold Ticket Claim
echo.

git add app/vip/page.tsx
git add components/dashboard/GoldTicketPanel.tsx

git commit -m "feat(golden-ticket): implement cryptographic signature canvas, ip telemetry injection, and /vip navigation redirect"

echo Subiendo al Nucleo Railway...
git push origin main || git push
echo.
echo ============================================================
echo  ¡SINCRONIZANDO! TARDARA ENTRE 1-2 MIN EN COMPILAR
echo ============================================================
pause
