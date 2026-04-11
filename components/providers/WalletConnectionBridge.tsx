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
        // Automatically sync the Wagmi address into our internal state management.
        // If disconnected, pass null to clear the active view.
        syncAddress(isConnected ? address || null : null);
    }, [address, isConnected, syncAddress]);

    // This component is a pure logic bridge - it renders nothing.
    return null;
}
