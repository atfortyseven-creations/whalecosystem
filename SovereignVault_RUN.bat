@echo off
TITLE SOVEREIGN VAULT - MONITOR
COLOR 0B
echo =================================================
echo   WHALE ALERT NETWORK: SOVEREIGN VAULT DAEMON
echo =================================================
echo [SYSTEM] Initializing node environment...
echo [SYSTEM] Checking for vault-storage directory...

IF NOT EXIST "vault-storage" (
    echo [SYSTEM] Creating cold storage directory...
    mkdir "vault-storage"
)

echo [SYSTEM] Starting Sovereign Vault Daemon...
echo [SYSTEM] Port: 7007
echo [SYSTEM] Status: LISTENING FOR CLOUD INGRESS
echo -------------------------------------------------
node scripts\vault-daemon.js
pause
