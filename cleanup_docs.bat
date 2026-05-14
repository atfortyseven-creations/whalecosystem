@echo off
echo Cleaning up legacy documentation routes...

rd /s /q "app\docs\cookie-policy"
rd /s /q "app\docs\developer"
rd /s /q "app\docs\intro"
rd /s /q "app\docs\operator"
rd /s /q "app\docs\platform"
rd /s /q "app\docs\privacy-policy"
rd /s /q "app\docs\quickstart"
rd /s /q "app\docs\risk-disclosure"
rd /s /q "app\docs\terms-of-service"
rd /s /q "app\docs\whale-code"
rd /s /q "app\docs\whitepaper"

echo Legacy routes removed successfully!
echo The new [...slug] routing engine is now fully authoritative.
pause
