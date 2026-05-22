"use client";

import { useCallback } from 'react';
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * [SOVEREIGN NUCLEAR DISCONNECT]
 * Performs a deep-clean of the user session across all persistence layers.
 * 1. Purges authentication cookies (multi-path/domain)
 * 2. Nukes LocalStorage (System + Wagmi + AppKit keys)
 * 3. Clears SessionStorage
 * 4. Disconnects Wagmi/AppKit connectors
 * 5. Signs out of NextAuth
 * 6. Hard redirect to /connect
 */
export function useSystemSignOut() {
    const { disconnect } = useDisconnect();

    const nuclearDisconnect = useCallback(async () => {
        console.log('%c[System] Initiating Nuclear Disconnect...', 'color:#FF3B30;font-weight:bold');

        // 0. Purge local custom wallet Zustand state
        try {
            useWalletStore.getState().clearWallet();
        } catch (e) {
            console.warn('[System:Logout] Zustand wallet purge failed:', e);
        }

        // 1. Clear Cookies (Nuclear approach)
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

        // 2. Clear LocalStorage (Targeted + Full fallback)
        try {
            // Priority targets
            const targets = [
                'system_handshake',
                'system_session_v2',
                'system_vault_v1',
                'system_pending_wakeup',
                'whale-system-wallet-registry-v2'
            ];
            targets.forEach(t => localStorage.removeItem(t));

            // Full scan for Wagmi, AppKit, WalletConnect, etc.
            Object.keys(localStorage).forEach(key => {
                const lower = key.toLowerCase();
                if (lower.startsWith('whale_chat_pin_')) return; // Preserve PIN
                
                if (
                    lower.includes('wagmi') || 
                    lower.includes('walletconnect') || 
                    lower.includes('appkit') || 
                    lower.includes('w3m') || 
                    lower.includes('reown') ||
                    lower.includes('whale_chat') ||
                    lower.includes('whale_draft') ||
                    lower.includes('whale_') ||
                    lower.includes('whale-') ||
                    lower.includes('system_')
                ) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('[System:Logout] LocalStorage purge failed:', e);
        }

        // 3. Clear SessionStorage
        try {
            sessionStorage.clear();
            sessionStorage.setItem('__disconnected__', '1'); // Flag to prevent immediate auto-relink
        } catch (e) {}

        // 4. Disconnect Wagmi
        try {
            disconnect();
        } catch (e) {
            console.warn('[System:Logout] Wagmi disconnect failed:', e);
        }

        // 5. NextAuth SignOut (if applicable)
        try {
            await signOut({ redirect: false });
        } catch (e) {}

        // 6. Hard Redirect
        console.log('%c[System] Session Purged. Redirecting...', 'color:#00A36C');
        
        // Brief delay to ensure storage writes/clears are committed
        setTimeout(() => {
            window.location.href = '/connect';
        }, 300);

    }, [disconnect]);

    return { nuclearDisconnect };
}
