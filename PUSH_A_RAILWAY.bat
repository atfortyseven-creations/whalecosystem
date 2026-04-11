@echo off
setlocal
echo ========================================================
echo [SOVEREIGN TERMINAL] Protocol: High-Fidelity Cloud Push
echo ========================================================
echo.
echo Phase 0: Stratospheric Audit (Native Parallel Build)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CRITICAL ERROR] Institutional Audit failed. Transmission aborted.
    echo Resolve type errors in the optimized engine before pushing.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo Phase 1: Context Capture (git add .)
git add .
echo.
echo Phase 2: Cipher Metadata (git commit)
git commit -m "fix(ipad+perf): eradicate iPad blank screen + mobile scroll lag; add 16 chains; Rainbow Wallet creation flow; patron-cosmico-4k GPU overlay; zero blur-orb rendering contract"
echo.
echo Phase 3: Transmitting to Genesis Server (git push)
git push origin main --force
echo.
echo ========================================================
echo [WHALE ALERT] TRANSMISSION COMPLETE. Verify Railway Logs.
echo ========================================================
pause
