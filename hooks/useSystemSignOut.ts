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
    const { disconnectAsync } = useDisconnect();

    const nuclearDisconnect = useCallback(async () => {
        console.log('%c[System] Initiating System Logout...', 'color:#FF3B30;font-weight:bold');

        // 0. LOCK local custom wallet Zustand state instead of purging
        // This ensures the user can log back in with their password!
        try {
            useWalletStore.getState().lockVault();
        } catch (e) {
            console.warn('[System:Logout] Zustand wallet lock failed:', e);
        }

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

        // 4. Disconnect Wagmi AFTER clearing all storage.
        // Now any React re-renders triggered by the wagmi state change will see
        // no valid cookies/localStorage and the __disconnected__ flag already set.
        try {
            if (disconnectAsync) {
                await disconnectAsync();
            }
        } catch (e) {
            console.warn('[System:Logout] Wagmi disconnect failed:', e);
        }

        // 5. NextAuth SignOut (if applicable) - MUST AWAIT to ensure HttpOnly cookies are cleared
        try {
            await Promise.race([
                signOut({ redirect: false }),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);
        } catch (e) {
            console.warn('[System:Logout] NextAuth signout failed:', e);
        }

        // 6. Hard Redirect - Instant
        console.log('%c[System] Session Locked. Redirecting...', 'color:#00A36C');
        window.location.replace('/');

    }, [disconnectAsync]);

    return { nuclearDisconnect };
}
