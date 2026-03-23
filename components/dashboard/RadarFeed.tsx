"use client";

import React, { useEffect } from 'react';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';
import { useSniperStore } from '@/store/useSniperStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function RadarFeed() {
  const { unifiedWhaleFeed } = useWhaleFeed();
  const pushAlert = useSniperStore((state) => state.pushAlert);
  
  // Use a fine-grained selector to ONLY re-render when alerts array changes
  const alerts = useSniperStore((state) => state.alerts);
  const filters = useSniperStore((state) => state.filters);

  // Hydrate Store with Real-time Feed
  // In a real HFT environment, this would be a direct WebSocket, but we use the existing unified feed 
  // and push it to our zero-render Zustand store.
  useEffect(() => {
    if (!unifiedWhaleFeed.length) return;
    
    // Take the latest event
    const latest = unifiedWhaleFeed[0];
    
    // Parse into our strict interface
    const newAlert = {
      id: latest.id || latest.hash,
      txHash: latest.hash,
      asset: latest.asset || 'UNKNOWN',
      amount: Number(latest.amount || 0),
      usdValue: Number(latest.usdValue || 0),
      from: latest.from || 'UNKNOWN',
      to: latest.to || 'UNKNOWN',
      chain: latest.chain || 'UNKNOWN',
      action: (latest.action === 'COMPRA' || latest.action === 'BUY') ? 'BUY' : latest.action === 'SELL' ? 'SELL' : 'TRANSFER',
      timestamp: latest.timestamp,
    };

    // Store handles the mathematical filtering (minVolumeUsd, etc) and circular buffering
    pushAlert(newAlert as any);
  }, [unifiedWhaleFeed, pushAlert]);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] p-2">
      <div className="grid grid-cols-[120px_1fr_120px_80px_60px] gap-4 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 mb-2">
        <span>TIME</span>
        <span>SIGNATURE // ROUTE</span>
        <span className="text-right">VOLUME (USD)</span>
        <span className="text-right">ASSET</span>
        <span className="text-right">ACT</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-2">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-[120px_1fr_120px_80px_60px] gap-4 px-4 py-2 border border-white/[0.02] bg-[#080808] hover:bg-[#0c0c0c] transition-colors rounded-sm group"
            >
              {/* TIME & CHAIN */}
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/60">
                  {new Date(alert.timestamp).toISOString().split('T')[1].slice(0, -1)}
                </span>
                <span className="text-[8px] text-white/30 truncate">{alert.chain}</span>
              </div>

              {/* HASH / ROUTE */}
              <div className="flex flex-col justify-center overflow-hidden">
                 <span className="text-[10px] text-white/90 truncate font-mono">
                    {alert.txHash}
                 </span>
                 <div className="flex items-center gap-2 text-[8px] text-white/40 font-mono mt-0.5">
                    <span className="truncate w-20">{alert.from.slice(0,6)}...</span>
                    <span>→</span>
                    <span className="truncate w-20">{alert.to.slice(0,6)}...</span>
                 </div>
              </div>

              {/* VOLUME USD */}
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-black font-mono text-white">
                  ${alert.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* ASSET */}
              <div className="flex items-center justify-end">
                 <span className="text-[10px] uppercase font-bold text-white/70 px-2 py-0.5 bg-white/5 rounded-sm">
                   {alert.asset}
                 </span>
              </div>

              {/* ACTION (BUY/SELL) WITH FLASH */}
              <div className="flex items-center justify-end">
                 <span className={`text-[9px] font-black px-2 py-1 rounded-sm w-full text-center tracking-widest ${
                   alert.action === 'BUY' 
                     ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' 
                     : alert.action === 'SELL'
                     ? 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
                     : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                 }`}>
                   {alert.action}
                 </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center opacity-30 gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-widest">
              Awaiting Mempool Ignition...
              <br/>
              (Min Volume: ${filters.minVolumeUsd.toLocaleString()})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
