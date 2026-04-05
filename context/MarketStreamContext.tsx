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
        let eventSource: EventSource | null = null;
        let isMounted = true;

        const connectStream = () => {
            eventSource = new EventSource('/api/markets/stream');

            eventSource.onopen = () => {
                if (isMounted) setIsConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed && parsed.success && Array.isArray(parsed.data)) {
                        if (isMounted) {
                            const newMap = new Map<string, MarketData>();
                            parsed.data.forEach((d: MarketData) => {
                                if (d?.symbol) newMap.set(d.symbol, d);
                            });
                            setMarkets(newMap);
                            setLastUpdate(new Date(parsed.timestamp || Date.now()));
                        }
                    }
                } catch (e) {
                    console.error("MarketStream parse error", e);
                }
            };

            eventSource.onerror = () => {
                if (isMounted) setIsConnected(false);
                eventSource?.close();
                // Attempt to reconnect after 5 seconds if connection fails
                setTimeout(connectStream, 5000);
            };
        };

        connectStream();

        return () => {
            isMounted = false;
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    return (
        <MarketStreamContext.Provider value={{ markets, isConnected, lastUpdate }}>
            {children}
        </MarketStreamContext.Provider>
    );
};
