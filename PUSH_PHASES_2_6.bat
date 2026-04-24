@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: SOVEREIGN ARCHITECTURE (PHASES 2-6)
echo ========================================================

git add package.json
git add lib/neo4j/client.ts
git add lib/neo4j/cypher.ts
git add lib/blockchain/ResilientProvider.ts
git add lib/blockchain/merkle.ts
git add lib/blockchain/mev.ts
git add app/api/golden-ticket/claim/route.ts
git add scripts/chaos-monkey.ts

git commit -m "feat(arch): implement phases 2-6 sovereign mechanics" -m "Added Neo4j driver and heuristics, Merkle Tree proofs, MEV Flashbots protection, Archive Node resilience, and Anti-Sybil Rate Limiting."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Sovereign Master Architecture pushed successfully.
pause
