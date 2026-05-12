"use client";

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

/**
 * [SOVEREIGN HANDSHAKE] Account Bridge
 * Provides a unified address state that respects either a local wagmi connection
 * or a verified QR Handshake cookie.
 */
export function useSovereignAccount() {
    const wagmiAccount = useAccount();
    const [handshakeAddress, setHandshakeAddress] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkHandshake = () => {
            if (typeof document === 'undefined') return;
            
            // Fast cookie parse — match any 0x address in sovereign_handshake cookie
            const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
            if (match?.[1]) {
                setHandshakeAddress(match[1].toLowerCase());
            } else {
                setHandshakeAddress(null);
            }
            setIsChecking(false);
        };

        // Run immediately
        checkHandshake();
        
        // Polling is only necessary for QR/Mobile handshakes where Wagmi isn't active.
        // If Wagmi is already handling the connection natively, we can kill the polling
        // to save CPU cycles and battery.
        if (wagmiAccount.isConnected) return;
        
        // Poll every 500ms — catches cookie written by mobile QR handshake
        const poll = setInterval(checkHandshake, 500);
        
        return () => clearInterval(poll);
    }, [wagmiAccount.isConnected]);

    // Priority 1: Direct Wagmi Connection (Active Extension/Mobile App)
    if (wagmiAccount.isConnected) {
        return {
            ...wagmiAccount,
            isSovereignHandshake: false
        };
    }

    // Priority 2: Verified QR Handshake (Cookie-based session)
    if (handshakeAddress) {
        return {
            address: handshakeAddress as `0x${string}`,
            isConnected: true,
            isConnecting: false,
            isDisconnected: false,
            status: 'connected',
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSovereignHandshake: true
        } as const;
    }

    return {
        ...wagmiAccount,
        isSovereignHandshake: false
    };
}
