"use client";

import { useEffect, useState, useCallback } from "react";

export interface MempoolTx {
    hash: string;
    timestamp: number;
    value: number;
    type: 'whale' | 'dust';
    gasPrice: number;
}

export function useMempoolStream(enabled: boolean = true) {
    const [transactions, setTransactions] = useState<MempoolTx[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [rate, setRate] = useState(0); // Txs per second

    useEffect(() => {
        if (!enabled) return;

        let eventSource: EventSource | null = null;
        let pings = 0;
        let lastCount = 0;
        let currentCount = 0;

        // TPS calculator
        const tpsInterval = setInterval(() => {
            setRate(currentCount - lastCount);
            lastCount = currentCount;
        }, 1000);

        const connect = () => {
            eventSource = new EventSource('/api/network/whale/mempool-stream');

            eventSource.onopen = () => {
                setIsConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data: MempoolTx = JSON.parse(event.data);
                    currentCount++;
                    
                    setTransactions(prev => {
                        // Keep the last 150 transactions in memory to prevent DOM lag
                        const next = [data, ...prev];
                        if (next.length > 150) return next.slice(0, 150);
                        return next;
                    });
                } catch (e) {
                    console.error("Error parsing mempool data", e);
                }
            };

            eventSource.onerror = (err) => {
                console.error("SSE Connection Error", err);
                setIsConnected(false);
                eventSource?.close();
                // Attempt to auto-reconnect after 3 seconds
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            clearInterval(tpsInterval);
            if (eventSource) {
                eventSource.close();
                setIsConnected(false);
            }
        };
    }, [enabled]);

    return {
        transactions,
        isConnected,
        rate // tx per second
    };
}

