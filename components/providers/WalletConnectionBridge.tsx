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
        // PROTECTION: If the user has a local managed wallet (Intel) with a private key,
        // we do NOT let the bridge clear it automatically just because MetaMask is disconnected.
        const hasManagedWallet = useWalletStore.getState().privateKey !== null;
        
        if (!isConnected && hasManagedWallet) {
            console.log("[BRIDGE] Managed wallet detected. Skipping syncAddress(null) to preserve identity persistence.");
            return;
        }

        // Otherwise, sync the Wagmi address into our internal state management.
        syncAddress(isConnected ? address || null : null);
    }, [address, isConnected, syncAddress]);

    // This component is a pure logic bridge - it renders nothing.
    return null;
}
