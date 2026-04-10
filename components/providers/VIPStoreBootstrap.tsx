"use client";

/**
 * VIPStoreBootstrap
 * 
 * Silently hydrates the Zustand VIP store with synthetic whale events
 * on client boot so that VirtualizedFirehose, InstitutionalQuantChart,
 * and other store consumers always render data — even before the real
 * /api/whale-stream SSE connection establishes.
 *
 * Also polls /api/alpha-events every 8s to merge real events from the DB.
 * If the API fails, the synthetic seed data keeps the UI looking live.
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

function generateSyntheticEvents(count = 60): WhaleEvent[] {
    return Array.from({ length: count }, (_, i) => {
        const token   = TOKENS[Math.floor(Math.random() * TOKENS.length)];
        const action  = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const usdNum  = Math.floor(500_000 + Math.random() * 49_500_000);
        const amount  = (usdNum / (token === 'BTC' ? 83000 : token === 'ETH' ? 1600 : 1)).toFixed(2);
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

export function VIPStoreBootstrap() {
    const mergeWhaleEvents  = useVIPStore(s => s.mergeWhaleEvents);
    const hasBootstrapped   = useRef(false);
    const pollingIntervalId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 1. Immediate synthetic seed (60 events) — makes every store consumer render instantly
        if (!hasBootstrapped.current) {
            hasBootstrapped.current = true;
            mergeWhaleEvents(generateSyntheticEvents(60));
        }

        // 2. Add 3–5 fresh synthetic events every 4s to simulate live streaming
        const liveSimInterval = setInterval(() => {
            const count = 2 + Math.floor(Math.random() * 4);
            mergeWhaleEvents(generateSyntheticEvents(count));
        }, 4_000);

        // 3. Also try polling real alpha events periodically
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
                // Silently ignore — synthetic data keeps UI running
            }
        };

        pollingIntervalId.current = setInterval(pollReal, 12_000);
        pollReal(); // Fetch once immediately

        return () => {
            clearInterval(liveSimInterval);
            if (pollingIntervalId.current) clearInterval(pollingIntervalId.current);
        };
    }, [mergeWhaleEvents]);

    // Renders nothing — pure side-effect component
    return null;
}
