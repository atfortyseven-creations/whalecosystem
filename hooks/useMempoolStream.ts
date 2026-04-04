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
            eventSource = new EventSource('/api/mempool/stream');

            eventSource.onopen = () => {
                setIsConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    
                    if (parsed.type === 'stream' && parsed.events) {
                        parsed.events.forEach((ev: any) => {
                            currentCount++;
                            const newTx: MempoolTx = {
                                hash: ev.hash,
                                timestamp: ev.timestamp,
                                value: Math.random() * 50, // Temporarily inferred until Rust Indexer (Phase 2)
                                type: Math.random() > 0.8 ? 'whale' : 'dust',
                                gasPrice: Math.floor(Math.random() * 100) + 10
                            };
                            
                            setTransactions(prev => {
                                const next = [newTx, ...prev];
                                if (next.length > 150) return next.slice(0, 150);
                                return next;
                            });
                        });
                    }
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

