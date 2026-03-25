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
            
            // Fast cookie parse
            const cookies = document.cookie.split('; ');
            const handshakeCookie = cookies.find(row => row.startsWith('sovereign_handshake='));
            
            if (handshakeCookie) {
                const address = handshakeCookie.split('=')[1];
                if (address && address.startsWith('0x')) {
                    setHandshakeAddress(address);
                }
            } else {
                setHandshakeAddress(null);
            }
            setIsChecking(false);
        };

        checkHandshake();
        
        // Optional: Poll for cookie changes if needed, but usually a page reload is triggered
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
