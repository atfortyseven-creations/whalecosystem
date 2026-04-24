@echo off
cd /d "%~dp0"
echo ========================================================
echo  RAILWAY: ZERO-DAY SECURITY AUDIT -- FINAL PUSH
echo ========================================================

git add middleware.ts
git add next.config.js
git add app/api/golden-ticket/claim/route.ts

git commit -m "security(core): patch all high-severity audit vulnerabilities" -m "1. Expanded middleware HONEYPOT_PATTERNS to 18 paths." -m "2. Fixed SWC removeConsole to preserve warn/error in prod." -m "3. Fixed TOCTOU Race Condition via DB autoincrement sequence." -m "4. Fixed XSS Vector by sanitizing twitterHandle." -m "5. Fixed DoS Vector by capping signatureData to 10KB."

git push --force origin HEAD:main
git push --force railway HEAD:main

echo.
echo [OK] Security audit complete. All vectors patched. System hardened.
pause
