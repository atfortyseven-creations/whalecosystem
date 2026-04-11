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
        const hasHandshake = document.cookie.split('; ').some(row => row.startsWith('sovereign_handshake=0x'));
        
        if (isConnected && address) {
            syncAddress(address);
        } else if (!hasHandshake) {
            // Only clear the address if NO handshake is present
            syncAddress(null);
        }
    }, [isConnected, address, syncAddress]);

    // This component is a pure logic bridge - it renders nothing.
    return null;
}
