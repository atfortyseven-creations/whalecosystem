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
            // This enables "any wallet" functionality by bridging the mobile-linked address.
            syncAddress(handshakeAddress);
        } else {
            // State: Purged/Disconnected
            syncAddress(null);
        }
    }, [isConnected, address, syncAddress]);

    // This component is a pure logic bridge - it renders nothing.
    return null;
}
