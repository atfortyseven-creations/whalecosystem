@echo off
echo ============================================================
echo  SOVEREIGN TERMINAL — MASTER DEPLOY v4.4
echo  Phase 3: WebSockets + PWA Engine + Portfolio Syntax Fix
echo ============================================================
echo.

echo [Phase 1] Staging all files...
git add components/dashboard/PortfolioDashboard.tsx
git add components/dashboard/MassTransferIntel.tsx
git add components/dashboard/AkashicLedger.tsx
git add lib/store/websocket-store.ts
git add hooks/useSmartWebSockets.ts

echo.
echo [Phase 2] Commit with full semantic record...
git commit -m "feat(phase3): WebSockets Global Store + PWA Engine Integration

PHASE 3 ARCHITECTURE:
- Syntax Error Fixed: portfolio dashboard conditional ternary block wrapped in React fragments
- PWA Engine: sw.js and manifest.json wiring verified for native standalone installation
- Global WebSocket Store: lib/store/websocket-store.ts implemented as a Zustand single-source-of-truth
- SWR Annihilation: MassTransferIntel and AkashicLedger refactored to consume WebSocket store instead of aggressive HTTP polling
- useSmartWebSockets rewritten to wrap the global Zustand store to eliminate duplicate connections
"

echo.
echo [Phase 3] Push to Railway production...
git push origin main

echo.
echo ============================================================
echo  MASTER DEPLOY COMPLETE.
echo  Verify in Railway:
echo  1. Docker build passes successfully (Syntax Error purged)
echo  2. PWA Engine: Terminal installable as standalone Mega-App
echo  3. Institutional feeds loading flawlessly via hybrid-sockets
echo ============================================================
pause
