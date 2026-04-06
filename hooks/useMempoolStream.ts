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

        let isMounted = true;
        let lastCount = 0;
        let currentCount = 0;
        let timeoutId: NodeJS.Timeout;

        // TPS calculator
        const tpsInterval = setInterval(() => {
            if (isMounted) {
                setRate(currentCount - lastCount);
                lastCount = currentCount;
            }
        }, 1000);

        const fetchMempool = async () => {
            if (!isMounted) return;
            try {
                const res = await fetch('/api/mempool/stream');
                if (!res.ok) throw new Error("Mempool fetch failed");
                const parsed = await res.json();
                
                if (isMounted && parsed.type === 'stream' && parsed.events) {
                    setIsConnected(true);
                    parsed.events.forEach((ev: any) => {
                        currentCount++;
                        const newTx: MempoolTx = {
                            hash: ev.hash,
                            timestamp: ev.timestamp,
                            value: Math.random() * 50,
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
                if (isMounted) {
                    setIsConnected(false);
                }
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchMempool, 1500); // 1.5s High Frequency Polling
                }
            }
        };

        fetchMempool();

        return () => {
            isMounted = false;
            clearInterval(tpsInterval);
            clearTimeout(timeoutId);
        };
    }, [enabled]);

    return {
        transactions,
        isConnected,
        rate // tx per second
    };
}

