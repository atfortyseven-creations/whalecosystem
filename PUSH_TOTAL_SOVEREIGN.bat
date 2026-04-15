@echo off
echo [WhaleFortress] Starting Institutional Synchronization...
echo.

echo 1. Synchronizing external high-fidelity assets...
copy "C:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\public\peakpx.jpg" "public\" /Y
copy "C:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\public\illustration_web3-scaled.png" "public\" /Y
copy "C:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\public\illustration_web3-scaled.jpg" "public\" /Y

echo.
echo 2. Staging all localized assets and infrastructure refinements...
git add .

echo 3. Sealed cryptographic commit: Hardening v6.12.0 - Sovereign Protocol v2
git commit -m "feat: institutional hardening v6.12.0 (ResilientProvider shield + Landing Asset Bridge + Mobile Fixes)"

echo 4. Initiating Sovereign Uplink to Railway...
railway up

echo.
echo [COMPLETE] Deployment channel established. Monitor logs for convergence.
pause
