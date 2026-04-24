@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: LEGAL & DOCS EXTENSION (TERMS, PRIVACY, DOCS)
echo ========================================================

git add app/terms/page.tsx
git add app/privacy/page.tsx
git add app/docs/page.tsx

git commit -m "docs(legal): massive institutional legal and technical expansion" -m "Expanded Terms, Privacy, and Docs pages to an institutional scale, strictly adopting the Light Mode Sovereign Aesthetic. Added clauses for L1 Consensus Failures, Anti-Sybil Policies, Zero-Knowledge Storage, Subpoena Protocols, and Real-time WebSocket Memory Topologies."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Legal and Documentation pages pushed successfully.
pause
