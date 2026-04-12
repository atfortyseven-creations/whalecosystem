"use client";

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * WalletConnectionBridge
 * 
 * Synchronizes the external Wagmi/RainbowKit connection with the internal 
 * Sovereign Wallet Store. This ensures that when a user connects their 
 * wallet via the UI, the entire portfolio system recognizes the identity.
 */
export function WalletConnectionBridge() {
    const { address, isConnected } = useAccount();
    const syncAddress = useWalletStore(state => state.syncAddress);

    useEffect(() => {
        // [AUDITED] Extract handshake address from cookie with strict validation
        const cookies = document.cookie.split('; ');
        const handshakeCookie = cookies.find(row => row.trim().startsWith('sovereign_handshake=0x'));
        const handshakeAddress = handshakeCookie ? handshakeCookie.split('=')[1]?.trim().toLowerCase() : null;
        
        if (isConnected && address) {
            // Priority 1: Direct Web3 Connection (MetaMask/Rainbow/AppKit)
            syncAddress(address.toLowerCase());
        } else if (handshakeAddress && handshakeAddress.startsWith('0x')) {
            // Priority 2: Sovereign Handshake (QR Link)
            syncAddress(handshakeAddress);
        } else {
            // State: Purged/Disconnected
            syncAddress(null);
        }
    }, [isConnected, address, syncAddress]);

    // ─── [COSMIC BRIDGE] Real-Time Autologin Listener ───────────────────────
    useEffect(() => {
        if (isConnected) return; // Already logged in

        const eventSource = new EventSource('/api/whale-stream');
        
        eventSource.addEventListener('auth-complete', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                const currentSessionId = sessionStorage.getItem('pending_qr_session');
                
                if (data.socketId === currentSessionId && data.address) {
                    console.log(`[Handshake:Success] 10000% Relay Received for ${data.address}`);
                    
                    // 1. Set the cookie for persistent auth
                    document.cookie = `sovereign_handshake=${data.address.toLowerCase()}; path=/; max-age=604800; samesite=lax`;
                    
                    // 2. Trigger the sync in the store
                    syncAddress(data.address.toLowerCase());
                    
                    // 3. Emit global event for UI transitions (ConnectWalletModal)
                    window.dispatchEvent(new CustomEvent('sovereign:auth_success', { 
                        detail: { address: data.address } 
                    }));

                    // 4. Cleanup
                    sessionStorage.removeItem('pending_qr_session');
                }
            } catch (err) {
                console.error('[Handshake:RelayError]', err);
            }
        });

        return () => eventSource.close();
    }, [isConnected, syncAddress]);

    // This component is a pure logic bridge - it renders nothing.
    return null;
}
