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
echo fix: scroll, Optimism switch, ledger UI + open news access + landing panels > commit_msg.txt
echo. >> commit_msg.txt
echo SCROLL SYSTEM >> commit_msg.txt
echo - SmoothScroll.tsx: Singleton RAF loop, proper cleanup, modal scroll passthrough >> commit_msg.txt
echo - ZoomWrapper.tsx: Replace CSS zoom:1.2 with transform:scale (Lenis-compatible) >> commit_msg.txt
echo - globals.css: Remove scroll-behavior:smooth (Lenis owns it), fix touch-action >> commit_msg.txt
echo - smooth-scroll.css: Remove conflicting scroll-behavior:smooth >> commit_msg.txt
echo. >> commit_msg.txt
echo WEB3 / OPTIMISM >> commit_msg.txt
echo - providers.tsx: Add Optimism chain to wagmi config (chains + transports) >> commit_msg.txt
echo - GoldTicketPanel.tsx: useSwitchChain with onError handler + isSwitching state >> commit_msg.txt
echo - Switch to Optimism button: loading state feedback, disabled during switch >> commit_msg.txt
echo. >> commit_msg.txt
echo LEDGER TICKETS UI >> commit_msg.txt
echo - GoldTicketPanel.tsx: Rename 'Global Genesis Ledger' -^> 'Ledger Tickets' >> commit_msg.txt
echo - Remove LivePulse green dot from ledger header >> commit_msg.txt
echo - Signature column: always render visual (real PNG or placeholder SVG) >> commit_msg.txt
echo. >> commit_msg.txt
echo NEWS — OPEN ACCESS >> commit_msg.txt
echo - NewsTerminal.tsx: hasAccess = true for all users, paywall fully disabled >> commit_msg.txt
echo - Paywall overlay and blurred content replaced with direct content render >> commit_msg.txt
echo. >> commit_msg.txt
echo LANDING PAGE PANELS (^>=1600px screens) >> commit_msg.txt
echo - WhaleAlertLanding.tsx: NewsOfTodayPanel (left) - live /api/news feed >> commit_msg.txt
echo - WhaleAlertLanding.tsx: WhalePostIframePanel (right) - scaled /news iframe >> commit_msg.txt
echo - Both panels: glassmorphism border, dark header, footer CTA, responsive >> commit_msg.txt
echo. >> commit_msg.txt
echo - Fix missing closing div tag in GoldTicketPanel component >> commit_msg.txt

git commit -F commit_msg.txt
del commit_msg.txt

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
