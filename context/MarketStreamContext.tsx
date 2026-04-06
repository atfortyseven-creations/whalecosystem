"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type MarketData = {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
    [key: string]: any;
};

interface MarketStreamContextType {
    markets: Map<string, MarketData>;
    isConnected: boolean;
    lastUpdate: Date;
}

const MarketStreamContext = createContext<MarketStreamContextType>({
    markets: new Map(),
    isConnected: false,
    lastUpdate: new Date(),
});

export const useMarketStream = () => useContext(MarketStreamContext);

export const MarketStreamProvider = ({ children }: { children: ReactNode }) => {
    const [markets, setMarkets] = useState<Map<string, MarketData>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchStream = async () => {
            try {
                const res = await fetch('/api/markets/stream');
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
                    }
                }
            } catch (e) {
                console.warn("MarketStream fetch error, retrying...", e);
                if (isMounted) setIsConnected(false);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchStream, 2500);
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
        <MarketStreamContext.Provider value={{ markets, isConnected, lastUpdate }}>
            {children}
        </MarketStreamContext.Provider>
    );
};
