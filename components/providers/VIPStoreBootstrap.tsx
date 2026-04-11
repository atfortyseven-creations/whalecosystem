"use client";

/**
 * VIPStoreBootstrap
 * 
 * Silently hydrates the Zustand VIP store with synthetic whale events
 * on client boot so that VirtualizedFirehose, InstitutionalQuantChart,
 * and other store consumers always render data — even before the real
 * /api/whale-stream SSE connection establishes.
 *
 * This version is hardened with a live Oracle (Binance) to ensure
 * all generated data is scaled to real-world market prices.
 */

import { useEffect, useRef } from 'react';
import { useVIPStore, WhaleEvent, parseAlphaEvents } from '@/lib/vip-store';

const TOKENS   = ['BTC', 'ETH', 'SOL', 'BNB', 'ARB', 'PEPE', 'LINK', 'AVAX', 'UNI', 'DOGE'];
const ACTIONS: WhaleEvent['action'][] = ['BUY', 'SELL', 'TRANSFER', 'BUY', 'BUY', 'SELL'];
const DEXES    = ['Uniswap V3', 'PancakeSwap', 'Curve', 'Balancer', 'GMX', 'dYdX', 'Aevo'];
const LABELS   = ['Polychain Capital', 'Wintermute', 'Jump Crypto', 'Galaxy Digital', 'Cumberland', 'DRW', 'Amber Group', 'Unknown Alpha Whale'];

function randomAddr() {
    return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function randomHash() {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

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
        if (!hasBootstrapped.current) {
            hasBootstrapped.current = true;
            fetchOraclePrices().then(() => {
                mergeWhaleEvents(generateSyntheticEvents(60, pricesRef.current));
            });
        }

        // 2. Continuous live simulation (every 4s) using oracle scaling
        const liveSimInterval = setInterval(() => {
            const count = 2 + Math.floor(Math.random() * 4);
            mergeWhaleEvents(generateSyntheticEvents(count, pricesRef.current));
        }, 4000);

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
            clearInterval(liveSimInterval);
            clearInterval(oracleSyncId);
            if (pollingIntervalId.current) clearInterval(pollingIntervalId.current);
        };
    }, [mergeWhaleEvents, setEthPrice, setBtcPrice]);

    return null;
}

/**
 * generateSyntheticEvents: Scales USD valuations to real-time oracle prices.
 */
function generateSyntheticEvents(count = 60, currentPrices: Record<string, number>): WhaleEvent[] {
    return Array.from({ length: count }, (_, i) => {
        const token   = TOKENS[Math.floor(Math.random() * TOKENS.length)];
        const action  = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const usdNum  = Math.floor(500_000 + Math.random() * 49_500_000);
        
        // Oracle-driven amount scaling: Eliminate fixed-multiplier artifacts
        const divisor = currentPrices[token] || (token === 'BTC' ? 83500 : token === 'ETH' ? 1610 : 1);
        const amount  = (usdNum / divisor).toFixed(2);
        
        const hash    = randomHash();
        const wallet  = randomAddr();
        const label   = LABELS[Math.floor(Math.random() * LABELS.length)];
        const dex     = DEXES[Math.floor(Math.random() * DEXES.length)];
        const ageMs   = Math.floor(Math.random() * 86_400_000);
        const ts      = Date.now() - ageMs;

        return {
            id:       hash + i,
            wallet,
            label,
            tier:     usdNum > 10_000_000 ? 'MEGA' : usdNum > 1_000_000 ? 'LARGE' : 'ALPHA',
            action,
            token,
            amount,
            usdValue: usdNum >= 1_000_000 ? `$${(usdNum / 1_000_000).toFixed(2)}M` : `$${(usdNum / 1000).toFixed(0)}K`,
            usdNum,
            dex,
            winRate:  50 + Math.floor(Math.random() * 45),
            age:      Math.floor(ageMs / 1000),
            hash,
            ts,
            type:     action === 'SELL' ? 'dump' : 'accumulation',
            confidence: 60 + Math.floor(Math.random() * 40),
            gasUsd:   0.5 + Math.random() * 12,
            blockConfirmations: Math.floor(Math.random() * 100) + 1,
        };
    });
}
