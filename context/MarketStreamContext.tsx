"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type MarketData = {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
    source?: string;
    [key: string]: any;
};

interface MarketStreamContextType {
    markets: Map<string, MarketData>;
    isConnected: boolean;
    lastUpdate: Date;
    latency: number;
    mode: 'live' | 'synthetic' | 'fallback';
}

const MarketStreamContext = createContext<MarketStreamContextType>({
    markets: new Map(),
    isConnected: false,
    lastUpdate: new Date(),
    latency: 0,
    mode: 'synthetic',
});

export const useMarketStream = () => useContext(MarketStreamContext);

// ── Client-side synthetic bootstrap so the UI is never empty on first paint ──
function buildSyntheticMap(): Map<string, MarketData> {
    const BASE: [string, number][] = [
        ['BTCUSDT', 83500], ['ETHUSDT', 1610], ['BNBUSDT', 585],
        ['SOLUSDT', 122],   ['XRPUSDT', 0.53],  ['ADAUSDT', 0.46],
        ['DOGEUSDT', 0.16], ['AVAXUSDT', 20.5],  ['LINKUSDT', 11],
        ['DOTUSDT', 5.2],   ['SUIUSDT', 0.85],   ['PEPEUSDT', 0.0000098],
    ];
    const m = new Map<string, MarketData>();
    BASE.forEach(([sym, base]) => {
        const fluctuation = (Math.random() - 0.5) * 0.04;
        const price = base * (1 + fluctuation);
        m.set(sym, {
            symbol: sym,
            lastPrice: price.toFixed(sym === 'BTCUSDT' || sym === 'ETHUSDT' ? 2 : 4),
            priceChangePercent: (fluctuation * 100).toFixed(2),
            quoteVolume: (base * 1000 * (0.8 + Math.random() * 0.4)).toFixed(2),
            source: 'client-synthetic',
        });
    });
    return m;
}

export const MarketStreamProvider = ({ children }: { children: ReactNode }) => {
    // Pre-seed with synthetic data so the UI is never empty on first render
    const [markets, setMarkets] = useState<Map<string, MarketData>>(buildSyntheticMap);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [latency, setLatency] = useState(0);
    const [mode, setMode] = useState<'live' | 'synthetic' | 'fallback'>('synthetic');

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchStream = async () => {
            const start = performance.now();
            try {
                const res = await fetch('/api/markets/stream');
                const end = performance.now();
                if (!res.ok) throw new Error("Stream fetch failed");
                const parsed = await res.json();

                if (parsed && parsed.success && Array.isArray(parsed.data)) {
                    if (isMounted) {
                        const newMap = new Map<string, MarketData>();
                        parsed.data.forEach((d: MarketData) => {
                            if (d?.symbol) newMap.set(d.symbol, d);
                        });
                        setMarkets(newMap);
                        setLastUpdate(new Date(parsed.timestamp || Date.now()));
                        setIsConnected(true);
                        setLatency(Math.round(end - start));
                        setMode(parsed.source === 'binance' || parsed.source?.includes('getblock') ? 'live' : 'fallback');
                    }
                }
            } catch {
                // Keep existing data but mark degraded
                if (isMounted) {
                    setIsConnected(false);
                    setMode('synthetic');
                    setLatency(0);
                }
            } finally {
                if (isMounted) {
                    // Fixed 3s interval — deterministic, no synthetic fluctuation
                    timeoutId = setTimeout(fetchStream, 3000);
                }
            }
        };

        fetchStream();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <MarketStreamContext.Provider value={{ markets, isConnected, lastUpdate, latency, mode }}>
            {children}
        </MarketStreamContext.Provider>
    );
};
