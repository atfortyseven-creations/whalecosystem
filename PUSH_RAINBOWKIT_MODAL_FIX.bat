@echo off
echo ============================================
echo  PUSH: ConnectButton.Custom fix (Scroll.io style)
echo ============================================
cd /d "%~dp0"
git add components/landing/MobileLanding.tsx
git commit -m "fix(mobile): use ConnectButton.Custom instead of useConnectModal

Root cause: useConnectModal() returns undefined when wagmi detects a
stale AppKit session in localStorage (isConnected=true), silently
causing the wallet modal to never open.

Fix: Wrap wallet buttons in ConnectButton.Custom which ALWAYS provides
a valid openConnectModal from RainbowKit's internal render prop API
(same mechanism as Scroll.io's Connect Wallet button).

Added pre-flight disconnect: if wagmi/AppKit has stale session,
call disconnect() + 300ms delay before opening modal so RainbowKit
does not block the modal due to isConnected state.

Flow: click -> stale session cleared -> RainbowKit modal opens
     -> WalletConnect v2 deep link -> Android Open with dialog
     -> wallet app opens -> user approves -> ImmersiveManifestoLanding"
git push origin main
echo.
echo DONE. Deploy triggered on Railway.
pause
