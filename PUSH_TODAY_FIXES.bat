@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║        WHALE ALERT NETWORK — PUSH SESSION FIXES          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Staging all changes...
git add -A
if %errorlevel% neq 0 ( echo ERROR: git add failed & pause & exit /b 1 )

echo.
echo [2/4] Files staged:
git status --short

echo.
echo [3/4] Committing...
git commit -m "fix: scroll, Optimism switch, ledger UI + open news access + landing panels

SCROLL SYSTEM
- SmoothScroll.tsx: Singleton RAF loop, proper cleanup, modal scroll passthrough
- ZoomWrapper.tsx: Replace CSS zoom:1.2 with transform:scale (Lenis-compatible)
- globals.css: Remove scroll-behavior:smooth (Lenis owns it), fix touch-action
- smooth-scroll.css: Remove conflicting scroll-behavior:smooth

WEB3 / OPTIMISM
- providers.tsx: Add Optimism chain to wagmi config (chains + transports)
- GoldTicketPanel.tsx: useSwitchChain with onError handler + isSwitching state
- Switch to Optimism button: loading state feedback, disabled during switch

LEDGER TICKETS UI
- GoldTicketPanel.tsx: Rename 'Global Genesis Ledger' -> 'Ledger Tickets'
- Remove LivePulse green dot from ledger header
- Signature column: always render visual (real PNG or placeholder SVG)

NEWS — OPEN ACCESS
- NewsTerminal.tsx: hasAccess = true for all users, paywall fully disabled
- Paywall overlay and blurred content replaced with direct content render

LANDING PAGE PANELS (>=1600px screens)
- WhaleAlertLanding.tsx: NewsOfTodayPanel (left) - live /api/news feed
- WhaleAlertLanding.tsx: WhalePostIframePanel (right) - scaled /news iframe
- Both panels: glassmorphism border, dark header, footer CTA, responsive"

if %errorlevel% neq 0 ( echo ERROR: git commit failed & pause & exit /b 1 )

echo.
echo [4/4] Pushing to origin...
git push origin main
if %errorlevel% neq 0 (
    echo Trying 'master' branch...
    git push origin master
)

if %errorlevel% neq 0 (
    echo ERROR: push failed — check your remote and credentials.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✓  PUSH COMPLETADO — Railway desplegando...            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause
