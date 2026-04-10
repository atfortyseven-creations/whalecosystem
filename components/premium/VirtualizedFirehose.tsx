"use client";

import React, { memo, useRef, useEffect, useState } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore, WhaleEvent } from '@/lib/vip-store';
import { Activity, ArrowRight, Clock, ShieldAlert, Zap } from 'lucide-react';

// ============================================================================
// ROW COMPONENT (Memoized to prevent unnecessary re-renders during scroll)
// ============================================================================
const FirehoseRow = memo(({ data, index, style }: any) => {
    const event: WhaleEvent = data[index];
    
    // Safety check in case array shrinks
    if (!event) return null;

    const isBuy = event.action === 'BUY' || event.action === 'COMPRA';
    const isSell = event.action === 'SELL' || event.action === 'VENTA';
    
    let actionColor = 'text-[#888888]';
    let bgPulse = 'bg-white/5';
    
    if (isBuy) {
        actionColor = 'text-[#00C076] drop-shadow-[0_0_8px_rgba(0,192,118,0.3)]';
        bgPulse = 'bg-[#00C076]/5 border-[#00C076]/20';
    } else if (isSell) {
        actionColor = 'text-[#FF3B30] drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]';
        bgPulse = 'bg-[#FF3B30]/5 border-[#FF3B30]/20';
    }

    const timeString = new Date(event.ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });

    return (
        <div style={style} className="px-2 py-1">
            <motion.div 
                initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(255,255,255,1)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`w-full h-full flex flex-col justify-center border-b border-[#111111] ${bgPulse} hover:bg-[#1A1A1A] transition-colors cursor-pointer rounded-sm px-4`}
                style={{ willChange: 'transform, opacity, background-color' }}
            >
                <div className="flex items-center justify-between">
                    
                    {/* LEFT: Time & Token */}
                    <div className="flex items-center gap-4 w-1/4">
                        <span className="text-[10px] font-mono text-[#555555] tracking-widest">{timeString}</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isBuy ? 'bg-[#00C076] shadow-[0_0_8px_rgba(0,192,118,0.8)]' : isSell ? 'bg-[#FF3B30] shadow-[0_0_8px_rgba(255,59,48,0.8)]' : 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]'}`} />
                            <span className="text-xs font-black text-white tracking-widest">{event.token}</span>
                        </div>
                    </div>

                    {/* MIDDLE: Amounts */}
                    <div className="flex flex-col items-center justify-center w-1/4">
                        <span className={`text-sm font-mono font-black tracking-tighter ${actionColor}`}>
                            {isBuy ? '+' : isSell ? '-' : ''} {(parseFloat(event.amount) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {event.token}
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
                            <span className="text-[9px] font-mono text-[#555555]">{event.wallet.substring(0,6)}...{event.wallet.slice(-4)}</span>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}, areEqual);

FirehoseRow.displayName = 'FirehoseRow';

// ============================================================================
// MAIN FIREHOSE COMPONENT
// ============================================================================
export function VirtualizedFirehose() {
    const whaleEvents = useVIPStore(state => state.whaleEvents);
    const listRef = useRef<List>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Keep scroll at top if autoScroll is enabled
    useEffect(() => {
        if (autoScroll && listRef.current && whaleEvents.length > 0) {
            listRef.current.scrollTo(0);
        }
    }, [whaleEvents, autoScroll]);

    return (
        <div className="w-full h-full flex flex-col bg-[#020202] border border-[#222222] rounded-sm shadow-[4px_4px_0_0_#050505]">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#050505]">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-[#00C076] animate-pulse" />
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                        Global Liquidity Firehose
                    </h2>
                    <span className="px-2 py-0.5 bg-[#00C076]/10 border border-[#00C076]/30 text-[#00C076] text-[9px] font-black rounded-sm shadow-[0_0_10px_rgba(0,192,118,0.2)]">
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
                className="flex-1 relative w-full h-[500px]" // Min height constraint
                onMouseEnter={() => setAutoScroll(false)}
                onMouseLeave={() => setAutoScroll(true)}
            >
                {/* Empty State */}
                {whaleEvents.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[#020202]">
                        <Zap size={24} className="text-[#333333] animate-pulse" />
                        <span className="text-[10px] font-black text-[#555555] uppercase tracking-[0.3em]">
                            Awaiting Neurometric Feeds...
                        </span>
                    </div>
                )}

                {/* AutoSizer expands to fill the flex-1 container */}
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <List
                            ref={listRef}
                            height={height}
                            itemCount={whaleEvents.length}
                            itemSize={64} // Fixed height per row for mathematical precision
                            width={width}
                            itemData={whaleEvents}
                            className="scrollbar-hide"
                            itemKey={(index, data) => data[index]?.id || index}
                        >
                            {FirehoseRow}
                        </List>
                    )}
                </AutoSizer>

                {/* Top fade gradient */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#020202] to-transparent pointer-events-none z-10" />
                {/* Bottom fade gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none z-10" />
            </div>
            
            {/* FOOTER */}
            <div className="p-2 border-t border-[#111111] bg-[#050505] flex items-center justify-between">
                <span className="text-[8px] font-mono text-[#555555] uppercase tracking-[0.3em]">
                    Powered by Zero-Knowledge Nodes
                </span>
                {!autoScroll && (
                    <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em] animate-pulse">
                        Auto-Scroll Paused
                    </span>
                )}
            </div>
        </div>
    );
}
