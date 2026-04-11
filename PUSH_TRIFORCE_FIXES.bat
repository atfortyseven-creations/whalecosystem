@echo off
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  SOVEREIGN TERMINAL — TRIFORCE PUSH                     ║
echo ║  1. Login page redesign (wave + wallet guide)           ║
echo ║  2. AppKit SSR fix (createAppKit module-level + ssr:f)  ║
echo ║  3. Prisma migration (IntelItem + Transaction fix)      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Staging all changes...
git add -A

echo [2/4] Committing...
git commit -m "fix: triforce — login redesign + appkit SSR + prisma migration

LOGIN PAGE (/login):
- Complete redesign: wallet-connection educational guide
- Panel 1: Step-by-step Chrome extension + WalletConnect instructions
- Panel 2 (scroll): RainbowKit connect button (no email, no Google, no Reown UX)
- Wave background using olas-hokusai-4k.png at full 4K quality (translateZ(0))
- Scroll indicator with animated pill to signal second panel
- Zero Clerk SignIn, zero email forms, zero social auth

APPKIT SSR FIX (digest:3117477805):
- Removed window check guard from createAppKit() in config/appkit.tsx
- createAppKit now called at module level (before any hook runs on SSR)
- Disabled email/socials features (email:false, socials:[]) — cleaner UX
- Dark theme configured (accent:#ffffff, mix:#050505)
- ClientLayout: ConnectWalletModal + LinkedGate now dynamic({ssr:false})
  → prevents hook calls during Next.js server-side hydration pass

PRISMA MIGRATION:
- New migration: 20260412000000_add_intel_item_fix_transaction
- Creates IntelItem table (was in schema but missing from Railway DB)
- Adds authUserId column to Transaction table (P2022 fix)
- Both errors were Non-blocking but flooding Railway logs at 500/sec"

echo [3/4] Pushing to Railway...
git push origin main

echo [4/4] Done!
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  DEPLOY TRIGGERED. After Railway builds:                ║
echo ║  Run migration with: npx prisma migrate deploy          ║
echo ║  Or: npx prisma db push --accept-data-loss              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause
