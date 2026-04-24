@echo off
echo ============================================================
echo  PUSHING: signatureData 10KB critical fix to Railway
echo ============================================================

git add app/api/golden-ticket/claim/route.ts components/dashboard/GoldTicketPanel.tsx components/dashboard/VossSupremacyPanel.tsx

git commit -m "fix(critical): resolve signatureData 10KB overflow crashing ticket claims" -m "Root cause: canvas.toDataURL('image/png') on Retina/mobile (DPR 2-3x) produces 50-150KB payloads, exceeding the 10KB server guard (HTTP 413) for all users." -m "- GoldTicketPanel: export 320x80 JPEG@0.4 instead of full-res PNG" -m "- VossSupremacyPanel: identical fix to AuthorizationSignaturePad" -m "- API route: replace hard 413 rejection with silent truncation (safeSignatureData)"

git push origin main

echo.
echo ============================================================
echo  DONE. Railway will auto-deploy in ~2 minutes.
echo ============================================================
pause
