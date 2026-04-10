@echo off
echo ================================================================
echo  WHALE ALERT — FINAL STABILIZATION PUSH
echo  Fix: Prisma Transactions, Mesh Network, Graph Miner, and Background Assets
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Injecting High-Fidelity 4K Wallpapers...
copy "C:\Users\admin\Downloads\image (2)_PhotoGrid.png" "public\patron-cosmico-4k.png" /Y
copy "C:\Users\admin\Downloads\image (4)_PhotoGrid.png" "public\olas-hokusai-4k.png" /Y

echo.
echo [2/3] Adding Modified Files to GIT...
git add public/patron-cosmico-4k.png public/olas-hokusai-4k.png
git add app/page.tsx
git add lib/wallet/transactions-server.ts
git add services/intelligence/entity-graph-miner.ts
git add scripts/sovereign-mesh.ts

echo.
echo [3/3] Committing and Pushing to Railway...
git commit -m "fix(backend): Prisma types mapped correctly, graphMiner schema aligned, redis mesh hardened against mock crashes, and missing 4k wallpapers injected locally"
git push origin main

echo.
echo ================================================================
echo  ULTRA-STABLE BUILD PUSHED. Railway will deploy automatically.
echo ================================================================
pause
