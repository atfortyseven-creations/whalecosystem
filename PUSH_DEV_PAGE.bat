@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: DEVELOPER PAGE UPDATE (LOTTIE PURGE + MANIFESTO)
echo ========================================================

git add components/landing/WhaleAlertLanding.tsx
git add README.md

git commit -m "docs(developer): massive architectural manifesto extension" -m "Purged Lottie animations for a cleaner aesthetic and added Chapter 29 detailing the Absolute Sovereignty Upgrade (Neo4j, Archive Nodes, Merkle Trees, Anti-Sybil, Chaos Monkey, MEV Protection)."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Developer Page updated successfully.
pause
