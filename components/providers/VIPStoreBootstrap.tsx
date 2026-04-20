"use client";

/**
 * VIPStoreBootstrap
 *
 * Zero-Mock Mandate: All synthetic event generators have been permanently
 * eradicated. The store is hydrated exclusively via:
 *   1. Live Oracle prices from Binance (fetchOraclePrices)
 *   2. Real alpha events from the database (/api/alpha-events)
 *
 * No Math.random() mock streams. No synthetic whale events.
 */

import { useEffect, useRef } from 'react';
import { useVIPStore, WhaleEvent, parseAlphaEvents } from '@/lib/vip-store';


/**
 * VIPStoreBootstrap: The Institutional Oracle Hub
 */
export function VIPStoreBootstrap() {
    const mergeWhaleEvents  = useVIPStore(s => s.mergeWhaleEvents);
    const setEthPrice       = useVIPStore(s => s.setEthPrice);
    const setBtcPrice       = useVIPStore(s => s.setBtcPrice);
    
    // Internal state for live oracle pricing to scale synthetic generators correctly
    const pricesRef = useRef({ BTC: 83500, ETH: 1610, SOL: 125 });
    
    const hasBootstrapped   = useRef(false);
    const pollingIntervalId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 0. Primary Oracle: Fetch real market prices from Binance for high-fidelity scaling
        const fetchOraclePrices = async () => {
            try {
                // Fetching multiple price points in one call
                const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=["${symbols.join('","')}"]`);
                if (res.ok) {
                    const data = await res.json();
                    const pMap: Record<string, number> = {};
                    data.forEach((item: any) => {
                        const price = parseFloat(item.price);
                        if (item.symbol === 'BTCUSDT') {
                            setBtcPrice(price);
                            pMap.BTC = price;
                        }
                        if (item.symbol === 'ETHUSDT') {
                            setEthPrice(price);
                            pMap.ETH = price;
                        }
                        if (item.symbol === 'SOLUSDT') pMap.SOL = price;
                    });
                    pricesRef.current = { ...pricesRef.current, ...pMap };
                }
            } catch (err) {
                console.warn("[Oracle Failure] Reverting to last known institutional coordinates.", err);
            }
        };

        // 1. Immediate bootstrap using live or cached oracle prices
        // 1. Unified Event Hydration: Pure On-Chain Data only
        // [MODIFIED] No more generateSyntheticEvents. We go straight to polling real DB records.
        if (!hasBootstrapped.current) {
            hasBootstrapped.current = true;
            fetchOraclePrices();
        }

        // [DEACTIVATED] Synthetic live simulation loop removed to protect data integrity.
        // The real-time SSE stream (/api/whale-events/stream) now manages all live updates.

        // 3. Periodic Oracle Sync (every 10s) to keep valuations current
        const oracleSyncId = setInterval(fetchOraclePrices, 10000);

        // 4. Poll real alpha events from the database
        const pollReal = async () => {
            try {
                const res = await fetch('/api/alpha-events?limit=30');
                if (res.ok) {
                    const data = await res.json();
                    const events = Array.isArray(data?.events)
                        ? parseAlphaEvents(data.events)
                        : Array.isArray(data)
                            ? parseAlphaEvents(data)
                            : [];
                    if (events.length > 0) mergeWhaleEvents(events);
                }
            } catch {
                // Silently ignore — synthetic data keeps UI responsive during outages
            }
        };

        pollingIntervalId.current = setInterval(pollReal, 12000);
        pollReal(); 

        return () => {
            // [MODIFIED] No liveSimInterval to clear
            clearInterval(oracleSyncId);
            if (pollingIntervalId.current) clearInterval(pollingIntervalId.current);
        };
    }, [mergeWhaleEvents, setEthPrice, setBtcPrice]);

    return null;
}

