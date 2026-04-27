@echo off
echo ============================================
echo  PUSH: RainbowKit Modal Fix (Scroll.io style)
echo ============================================
cd /d "%~dp0"
git add components/landing/MobileLanding.tsx
git commit -m "fix(mobile): switch wallet connect to RainbowKit modal (Scroll.io style)

- Replace openAppKitDirect() with openConnectModal() from RainbowKit
- RainbowKit generates correct WalletConnect v2 deep links on Android
- Android OS now shows native Open with dialog (Rainbow/MetaMask/Base)
- Remove useUIStore and useAppKit dependencies from MobileLanding
- Keep injected connector path for MetaMask in-app browser detection
- After connecting, user sees ImmersiveManifestoLanding (pursuit of transparency)"
git push origin main
echo.
echo DONE. Deploy should trigger automatically on Railway.
pause
