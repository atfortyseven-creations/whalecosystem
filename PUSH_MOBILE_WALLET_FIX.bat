@echo off
cd /d "%~dp0"
echo ========================================================
echo  MOBILE WALLET CONNECT FIX — PUSHING TO RAILWAY
echo ========================================================

git add components/mobile/MobileWhaleLanding.tsx
git add components/layout/MobileEnforcer.tsx

git commit -m "fix(mobile): restore AppKit wallet picker modal on landing page

- MobileEnforcer now uses MobileWhaleLanding (was using MobileLanding)
- handleConnectTrigger opens custom WalletPickerModal (not useAppKit directly)
- WalletPickerModal shows: WalletConnect, MetaMask, Trust, Coinbase, Rainbow
- WalletConnect entry opens AppKit modal with all wallet types + QR code
- QR scanner still accessible post-connection for PC handshake"

git push origin main

echo.
echo ✅ DONE — Deploy triggered on Railway.
pause
