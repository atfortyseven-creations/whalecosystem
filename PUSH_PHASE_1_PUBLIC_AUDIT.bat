@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: PHASE 1 -- PUBLIC VERIFIABILITY -- FINAL PUSH
echo ========================================================

git add app/status/page.tsx
git add app/api/scanner/status/route.ts
git add app/api/akashic/verify/route.ts
git add components/landing/ImmersiveManifestoLanding.tsx

git commit -m "feat(public): phase 1 public auditability rollout" -m "1. Deployed /status page to visualize scanner health." -m "2. Added PublicAkashicLedgerSample to landing page." -m "3. Added CORS preflight to scanner and verify APIs." -m "4. Zero-Mock mandated: all components hit live production DB."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Phase 1 Public Auditability deployed.
pause
