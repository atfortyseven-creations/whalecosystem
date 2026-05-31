"use client";

import { useCallback } from 'react';
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * [Enterprise SYSTEM LOGOUT]
 * Secures the local session. Locks the wallet vault but PRESERVES the encrypted 
 * blob so the user can log in again with their Humanity Ledger password.
 */
export function useSystemSignOut() {
    const { disconnect, disconnectAsync } = useDisconnect();

    const nuclearDisconnect = useCallback(async () => {
        console.log('%c[System] Initiating System Logout...', 'color:#FF3B30;font-weight:bold');

        // 0. (Moved to end) Lock local custom wallet Zustand state after clearing cookies to prevent UI glitches

        // 1. Clear Cookies FIRST (Nuclear approach)
        // Must happen before wagmi disconnect to prevent race where React re-renders
        // see valid cookies and re-authenticates during the async disconnect.
        try {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                // Keep the persistent PINs
                if (name.toLowerCase().startsWith('whale_chat_pin_')) continue;

                // Clear for current path, root path, and domain
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};SameSite=Lax`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname};SameSite=Lax`;
            }
        } catch (e) {
            console.warn('[System:Logout] Cookie purge failed:', e);
        }

        // 2. Clear LocalStorage BEFORE wagmi disconnect (same reason as cookies)
        try {
            // Priority targets
            const targets = [
                'system_handshake',
                'system_session_v2',
                'system_vault_v1',
                'system_pending_wakeup',
                'whale-system-wallet-registry-v2' // Old version, safe to delete
            ];
            targets.forEach(t => localStorage.removeItem(t));

            // Full scan for Wagmi, AppKit, WalletConnect, etc.
            Object.keys(localStorage).forEach(key => {
                const lower = key.toLowerCase();
                if (lower.startsWith('whale_chat_pin_')) return; // Preserve PIN
                if (lower.includes('whale-system-wallet-registry-v3')) return; // PRESERVE ENCRYPTED VAULT!
                if (lower === 'system_accounts' || lower === 'system_keystore') return; // PRESERVE ACCOUNTS!
                
                if (
                    lower.includes('wagmi') || 
                    lower.includes('walletconnect') || 
                    lower.includes('wc@2') ||
                    lower.includes('walletlink') ||
                    lower.includes('appkit') || 
                    lower.includes('w3m') || 
                    lower.includes('reown') ||
                    lower.includes('whale_chat') ||
                    lower.includes('whale_draft') ||
                    lower.includes('system_')
                ) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('[System:Logout] LocalStorage purge failed:', e);
        }

        // 3. Clear SessionStorage and set disconnect guard BEFORE wagmi disconnect.
        // Preserves sw_nuclear_purge_v4 so the layout script does NOT trigger
        // an extra forced reload on the redirect target page.
        try {
            const swNuclearPurgeFlag = sessionStorage.getItem('sw_nuclear_purge_v4');
            sessionStorage.clear();
            sessionStorage.setItem('__disconnected__', '1'); // Flag to prevent immediate auto-relink
            if (swNuclearPurgeFlag) {
                sessionStorage.setItem('sw_nuclear_purge_v4', swNuclearPurgeFlag); // Don't re-trigger forced reload
            }
        } catch (e) {}

        // 3.5 Nuke IndexedDB (WalletConnect stores its persistent session here)
        try {
            if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
                const dbs = await window.indexedDB.databases();
                dbs.forEach(db => {
                    if (db.name && (db.name.includes('walletconnect') || db.name.includes('wc@2') || db.name.includes('wagmi') || db.name.includes('w3m'))) {
                        window.indexedDB.deleteDatabase(db.name);
                    }
                });
            }
        } catch (e) {
            console.warn('[System:Logout] IndexedDB purge failed:', e);
        }

        // 4. Disconnect Wagmi AFTER clearing all storage.
        // We MUST wait for disconnectAsync because WalletConnect needs to clear its IndexedDB asynchronously.
        // If we reload immediately, the disconnect is aborted and WalletConnect reconnects on reload!
        try {
            if (disconnectAsync) {
                await Promise.race([
                    disconnectAsync(),
                    new Promise(resolve => setTimeout(resolve, 1500))
                ]);
            } else if (disconnect) {
                disconnect();
            }
        } catch (e) {
            console.warn('[System:Logout] Wagmi disconnect failed:', e);
        }

        // 5. NextAuth SignOut (if applicable) - Fire and forget
        try {
            signOut({ redirect: false }).catch(() => {});
        } catch (e) {
            console.warn('[System:Logout] NextAuth signout failed:', e);
        }

        // 6. Do NOT clear the wallet state here!
        // Calling clearWallet() wipes the encrypted vault and passwordHash, destroying the ability to log in.
        // Instead, we call lockVault() which safely hides the keys in memory.
        try {
            useWalletStore.getState().lockVault();
        } catch (e) {
            console.warn('[System:Logout] Zustand wallet lock failed:', e);
        }

        // 7. Hard Redirect - Instant
        console.log('%c[System] Session Locked. Redirecting...', 'color:#00A36C');
        
        // Force the window to reload to completely wipe memory state
        window.location.href = '/';
    }, [disconnect, disconnectAsync]);

    return { nuclearDisconnect };
}
