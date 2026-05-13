"use client";

import { useCallback } from 'react';
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';

/**
 * [SOVEREIGN NUCLEAR DISCONNECT]
 * Performs a deep-clean of the user session across all persistence layers.
 * 1. Purges authentication cookies (multi-path/domain)
 * 2. Nukes LocalStorage (Sovereign + Wagmi + AppKit keys)
 * 3. Clears SessionStorage
 * 4. Disconnects Wagmi/AppKit connectors
 * 5. Signs out of NextAuth
 * 6. Hard redirect to /connect
 */
export function useSovereignSignOut() {
    const { disconnect } = useDisconnect();

    const nuclearDisconnect = useCallback(async () => {
        console.log('%c[Sovereign] Initiating Nuclear Disconnect...', 'color:#FF3B30;font-weight:bold');

        // 1. Clear Cookies (Nuclear approach)
        try {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                // Clear for current path, root path, and domain
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};SameSite=Lax`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname};SameSite=Lax`;
            }
        } catch (e) {
            console.warn('[Sovereign:Logout] Cookie purge failed:', e);
        }

        // 2. Clear LocalStorage (Targeted + Full fallback)
        try {
            // Priority targets
            const targets = [
                'sovereign_handshake',
                'sovereign_session_v2',
                'sovereign_vault_v1',
                'sovereign_pending_wakeup'
            ];
            targets.forEach(t => localStorage.removeItem(t));

            // Full scan for Wagmi, AppKit, WalletConnect, etc.
            Object.keys(localStorage).forEach(key => {
                const lower = key.toLowerCase();
                if (
                    lower.includes('wagmi') || 
                    lower.includes('walletconnect') || 
                    lower.includes('appkit') || 
                    lower.includes('w3m') || 
                    lower.includes('reown') ||
                    lower.includes('whale_chat') ||
                    lower.includes('whale_draft') ||
                    lower.includes('sovereign_')
                ) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('[Sovereign:Logout] LocalStorage purge failed:', e);
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
            console.warn('[Sovereign:Logout] Wagmi disconnect failed:', e);
        }

        // 5. NextAuth SignOut (if applicable)
        try {
            await signOut({ redirect: false });
        } catch (e) {}

        // 6. Hard Redirect
        console.log('%c[Sovereign] Session Purged. Redirecting...', 'color:#00A36C');
        
        // Brief delay to ensure storage writes/clears are committed
        setTimeout(() => {
            window.location.href = '/connect';
        }, 300);

    }, [disconnect]);

    return { nuclearDisconnect };
}
