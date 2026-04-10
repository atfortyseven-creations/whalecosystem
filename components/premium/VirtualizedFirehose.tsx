"use client";

import React, { memo, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useVIPStore, WhaleEvent } from '@/lib/vip-store';
import { Activity, ArrowRight, Zap } from 'lucide-react';

// Dynamic imports to avoid SSR crashes (React Error #130)
const FixedSizeList = dynamic<any>(
    () => import('react-window').then(m => m.FixedSizeList),
    { ssr: false }
);
const AutoSizer = dynamic<any>(
    () => import('react-virtualized-auto-sizer'),
    { ssr: false }
);

// ============================================================================
// SKELETON COMPONENT
// ============================================================================
const FirehoseSkeleton = () => (
    <div className="w-full flex flex-col gap-2 p-4 border-b border-[#111111]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-1/4">
                <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="flex flex-col items-end gap-1 w-1/2">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

// ============================================================================
// ROW COMPONENT
// ============================================================================
const FirehoseRow = memo(({ data, index, style }: any) => {
    const event: WhaleEvent = data[index];
    if (!event) return null;

    const isBuy  = event.action === 'BUY'  || event.action === 'COMPRA';
    const isSell = event.action === 'SELL' || event.action === 'VENTA';

    let actionColor = 'text-[#888888]';
    let bgPulse     = 'border-transparent';

    if (isBuy)  { actionColor = 'text-[#00C076]'; bgPulse = 'border-[#00C076]/10 bg-[#00C076]/3'; }
    if (isSell) { actionColor = 'text-[#FF3B30]'; bgPulse = 'border-[#FF3B30]/10 bg-[#FF3B30]/3'; }

    const timeString = new Date(event.ts).toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return (
        <div style={style} className="px-2 py-1">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`w-full h-full flex flex-col justify-center border-b border-[#111111] ${bgPulse} hover:bg-[#1A1A1A] transition-colors cursor-pointer rounded-sm px-4`}
            >
                <div className="flex items-center justify-between">
                    {/* LEFT: Time & Token */}
                    <div className="flex items-center gap-4 w-1/4">
                        <span className="text-[10px] font-mono text-[#555555] tracking-widest">{timeString}</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isBuy ? 'bg-[#00C076]' : isSell ? 'bg-[#FF3B30]' : 'bg-[#D4AF37]'}`} />
                            <span className="text-xs font-black text-white tracking-widest">{event.token}</span>
                        </div>
                    </div>

                    {/* MIDDLE: Amounts */}
                    <div className="flex flex-col items-center justify-center w-1/4">
                        <span className={`text-sm font-mono font-black tracking-tighter ${actionColor}`}>
                            {isBuy ? '+' : isSell ? '-' : ''}
                            {(parseFloat(event.amount) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {event.token}
                        </span>
                        <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                            ${(event.usdNum || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>

                    {/* RIGHT: Action & Wallet */}
                    <div className="flex items-center justify-end gap-6 w-1/2">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 border border-[#333] text-[9px] font-black text-[#888888] uppercase tracking-[0.2em] rounded-sm">
                                {event.action}
                            </span>
                            <ArrowRight size={10} className="text-[#333333]" />
                            <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest">
                                {event.dex}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black tracking-widest text-white uppercase">{event.label}</span>
                            <span className="text-[9px] font-mono text-[#555555]">
                                {event.wallet.substring(0, 6)}...{event.wallet.slice(-4)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

FirehoseRow.displayName = 'FirehoseRow';

// ============================================================================
// MAIN FIREHOSE COMPONENT
// ============================================================================
export function VirtualizedFirehose() {
    const whaleEvents = useVIPStore(state => state.whaleEvents);
    const listRef     = useRef<any>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [isMounted,  setIsMounted]  = useState(false);
    const [showJumpTop, setShowJumpTop] = useState(false);

    // Dynamic imports SSR guard
    useEffect(() => { setIsMounted(true); }, []);

    // Keep scroll at top if autoScroll is enabled
    useEffect(() => {
        if (autoScroll && listRef.current && whaleEvents.length > 0) {
            listRef.current.scrollTo(0);
        }
    }, [whaleEvents, autoScroll]);

    const handleJumpTop = () => {
        if (listRef.current) {
            listRef.current.scrollTo(0);
            setAutoScroll(true);
            setShowJumpTop(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#020202] border border-[#222222] rounded-sm shadow-[4px_4px_0_0_#050505] relative group">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#050505]">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-[#00C076] animate-pulse" />
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                        Global Liquidity Firehose
                    </h2>
                    <span className="px-2 py-0.5 bg-[#00C076]/10 border border-[#00C076]/30 text-[#00C076] text-[9px] font-black rounded-sm">
                        LIVE
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] shadow-[0_0_8px_rgba(0,192,118,0.8)]" />
                        <span className="text-[9px] font-mono text-[#888888] uppercase tracking-widest">
                            {whaleEvents.length} TXs in Memory
                        </span>
                    </div>
                </div>
            </div>

            {/* VIRTUALIZED LIST CONTAINER */}
            <div
                className="flex-1 relative w-full"
                style={{ minHeight: 400 }}
                onMouseEnter={() => {
                    setAutoScroll(false);
                    setShowJumpTop(true);
                }}
                onMouseLeave={() => {
                    // Don't auto-resume if they are scrolled way down
                }}
            >
                {/* Empty State / Skeleton — shown briefly before bootstrap kicks in */}
                {(!isMounted || whaleEvents.length === 0) && (
                    <div className="absolute inset-0 z-10 bg-[#020202] flex flex-col">
                        {Array.from({ length: 10 }).map((_, i) => <FirehoseSkeleton key={i} />)}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm">
                            <Zap size={24} className="text-[#00FF55] animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                                Syncing Neurometric Feeds…
                            </span>
                        </div>
                    </div>
                )}

                {/* Only render list on client with data */}
                {isMounted && whaleEvents.length > 0 && (
                    <AutoSizer>
                        {({ height, width }: { height: number; width: number }) => (
                            <FixedSizeList
                                ref={listRef}
                                height={height || 400}
                                itemCount={whaleEvents.length}
                                itemSize={64}
                                width={width || 800}
                                itemData={whaleEvents}
                                className="scrollbar-hide"
                                itemKey={(index: number, data: WhaleEvent[]) => data[index]?.id || index}
                            >
                                {FirehoseRow}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                )}

                {/* Fade gradients */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#020202] to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none z-10" />

                {/* Floating "Jump to Top" / Resume Control */}
                <AnimatePresence>
                    {!autoScroll && showJumpTop && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onClick={handleJumpTop}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-[#00FF55] text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_10px_30px_rgba(0,255,85,0.4)] hover:scale-105 transition-transform active:scale-95"
                        >
                            <ChevronUp size={12} /> Jump to Live Stream
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="p-2 border-t border-[#111111] bg-[#050505] flex items-center justify-between">
                <span className="text-[8px] font-mono text-[#555555] uppercase tracking-[0.3em]">
                    Powered by Zero-Knowledge Nodes
                </span>
                {!autoScroll && (
                    <button 
                        onClick={() => setAutoScroll(true)}
                        className="text-[8px] font-black text-[#00FF55] uppercase tracking-[0.2em] animate-pulse hover:underline"
                    >
                        Resume Alpha Feed
                    </button>
                )}
            </div>
        </div>
    );
}
