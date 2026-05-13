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
    const [isZkVerified, setIsZkVerified] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkHandshake = () => {
            if (typeof document === 'undefined') return;
            
            // Fast cookie parse — match any 0x address in sovereign_handshake cookie
            const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
            if (match?.[1]) {
                try {
                    const { getAddress } = require('viem');
                    setHandshakeAddress(getAddress(match[1]));
                } catch {
                    setHandshakeAddress(match[1].toLowerCase());
                }
            } else {
                setHandshakeAddress(null);
            }
        };

        const checkZkStatus = async () => {
            try {
                const res = await fetch('/api/auth/session');
                const data = await res.json();
                if (data?.user?.isZkVerified) {
                    setIsZkVerified(true);
                }
            } catch {}
        };

        // Run immediately
        checkHandshake();
        checkZkStatus();
        setIsChecking(false);
        
        // Polling is only necessary for QR/Mobile handshakes where Wagmi isn't active.
        let pollHandshake: any = null;
        if (!wagmiAccount.isConnected) {
          pollHandshake = setInterval(checkHandshake, 500);
        }
        
        const pollZk = setInterval(checkZkStatus, 3000); // Check ZK status every 3s
        
        return () => {
            if (pollHandshake) clearInterval(pollHandshake);
            clearInterval(pollZk);
        };
    }, [wagmiAccount.isConnected]);

    // Priority 1: Direct Wagmi Connection (Active Extension/Mobile App)
    if (wagmiAccount.isConnected) {
        return {
            address: wagmiAccount.address,
            isConnected: true,
            isConnecting: wagmiAccount.isConnecting,
            isReconnecting: wagmiAccount.isReconnecting,
            isDisconnected: false,
            status: 'connected',
            connector: wagmiAccount.connector,
            chainId: wagmiAccount.chainId,
            chain: wagmiAccount.chain,
            isSovereignHandshake: false,
            isZkVerified: isZkVerified,
            isChecking: false
        };
    }

    // Priority 2: Verified QR Handshake (Cookie-based session)
    if (handshakeAddress) {
        return {
            address: handshakeAddress as `0x${string}`,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            isDisconnected: false,
            status: 'connected',
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSovereignHandshake: true,
            isZkVerified: isZkVerified,
            isChecking: false
        };
    }

    // Priority 3: Fallback to Wagmi state (Disconnected/Connecting)
    return {
        address: wagmiAccount.address,
        isConnected: false,
        isConnecting: wagmiAccount.isConnecting,
        isReconnecting: wagmiAccount.isReconnecting,
        isDisconnected: wagmiAccount.isDisconnected,
        status: wagmiAccount.status,
        connector: wagmiAccount.connector,
        chainId: wagmiAccount.chainId,
        chain: wagmiAccount.chain,
        isSovereignHandshake: false,
        isChecking
    };
}
