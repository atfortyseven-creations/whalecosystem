@echo off
echo ============================================================
echo  DASHBOARD BUG FIXES SYNC
echo ============================================================
echo.
echo  Bugs arreglados:
echo  1. ReferenceError: LivePulse is not defined (Gold Ticket)
echo  2. ReferenceError: mounted is not defined (Multicharts)
echo  3. TypeError: Cannot convert undefined or null to object (Watchlist)
echo  4. Error #310 Hydration (WhalePortfolio / SSR fixes apply)
echo.

git add components/dashboard/GoldTicketPanel.tsx
git add components/dashboard/PolymarketPanel.tsx
git add components/dashboard/WatchlistTable.tsx

git commit -m "fix(dashboard): resolve LivePulse and mounted reference errors, safeguard Watchlist against undefined objects"

echo Pushing a Railway...
git push origin main || git push
echo.
echo ============================================================
echo  LISTO. COMPILANDO EN RAILWAY TARDARA 1-2 MIN.
echo ============================================================
pause
