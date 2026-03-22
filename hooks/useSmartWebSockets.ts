"use client";

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { formatUnits } from 'viem';
import { transactionNotifier } from '@/lib/wallet/transaction-notifier';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
/**
 * [LEGENDARY] Enhanced Smart WebSocket Hook
 * - Monitors pending transactions for instant alerts
 * - Detects native ETH and ERC20 transfers
 * - Triggers SWR revalidation for portfolio updates
 * - Shows rich notifications with amounts
 */
export function useSmartWebSockets(address: string | undefined, enabled = true) {
    const [lastTx, setLastTx] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { mutate } = useSWRConfig();

    useEffect(() => {
        if (!address || !enabled) return;

        const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
        if (!apiKey) {
            console.warn('[WebSocket] NEXT_PUBLIC_ALCHEMY_API_KEY not configured');
            return;
        }

        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const RECONNECT_DELAY = 5000; // 5 seconds

        const connect = () => {
            try {
                // Connect to Alchemy WebSocket
                const ws = new WebSocket(`wss://eth-mainnet.g.alchemy.com/v2/${apiKey}`);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('🌌 [Legendary] Smart Socket Connected');
                    setConnected(true);
                    reconnectAttempts = 0;

                    // Subscribe to pending transactions
                    ws.send(JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_subscribe",
                        params: ["alchemy_pendingTransactions", { 
                            toAddress: [address],
                            hashesOnly: false
                        }]
                    }));

                    // Also subscribe to mined transactions for confirmation
                    ws.send(JSON.stringify({
                        jsonrpc: "2.0",
                        id: 2,
                        method: "eth_subscribe",
                        params: ["alchemy_minedTransactions", { 
                            addresses: [{ to: address }],
                            includeRemoved: false
                        }]
                    }));
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        
                        // Handle subscription confirmations
                        if (message.result && !message.params) {
                            console.log('🌌 [Socket] Subscription confirmed:', message.id);
                            return;
                        }

                        // Handle transaction notifications
                        if (message.method === 'eth_subscription' && message.params?.result) {
                            const tx = message.params.result;
                            handleTransaction(tx);
                        }
                    } catch (e) {
                        console.error('[Socket] Parse error:', e);
                    }
                };

                ws.onerror = (error) => {
                    console.error('🌌 [Socket] Error:', error);
                    setConnected(false);
                };

                ws.onclose = () => {
                    console.log('🌌 [Socket] Connection closed');
                    setConnected(false);

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttempts++;
                        console.log(`🌌 [Socket] Reconnecting... (attempt ${reconnectAttempts})`);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, RECONNECT_DELAY * reconnectAttempts);
                    }
                };

            } catch (error) {
                console.error('[Socket] Connection failed:', error);
            }
        };

        const handleTransaction = async (tx: any) => {
            const isIncoming = tx.to?.toLowerCase() === address.toLowerCase();
            if (!isIncoming) return;

            console.log('🌌 [Legendary] Incoming transaction detected:', tx.hash);
            setLastTx(tx);

            // Determine if it's native ETH or ERC20
            let amount = '0';
            let symbol = 'ETH';
            let isToken = false;
            let usdValue: number | undefined;

            if (tx.value && tx.value !== '0x0') {
                // Native ETH transfer
                const ethValue = formatUnits(BigInt(tx.value), 18);
                amount = parseFloat(safeToFixed(ethValue, 4));
                symbol = 'ETH';
                
                // Estimate USD value (could fetch real-time price here)
                usdValue = parseFloat(amount) * 2500; // Rough estimate
            } else if (tx.input && tx.input.length > 10) {
                // Possible ERC20 transfer
                isToken = true;
                symbol = 'Tokens';
            }

            // Use centralized notifier service
            transactionNotifier.notify({
                hash: tx.hash,
                amount,
                symbol,
                usdValue,
                source: 'wallet',
                type: 'incoming',
                timestamp: Date.now(),
                chainId: 1 // Ethereum mainnet
            });

            // Trigger portfolio refresh with a slight delay to allow for confirmation
            setTimeout(() => {
                mutate('portfolio-assets');
                console.log('🌌 [Legendary] Portfolio cache invalidated');
            }, 1000); // 1 second delay (optimized for high frequency)

        };

        // Initialize connection
        connect();

        // Cleanup
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [address, enabled, mutate]);

    return { lastTx, connected };
}

