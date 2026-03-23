"use client";

import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Activity, Skull, Zap, Crosshair } from 'lucide-react';
import { useSniperStore } from '@/store/useSniperStore';
import ContextMenu from '@/components/premium/ContextMenu';
import { toast } from 'sonner';

// Note: Logic inside these modules will be built in Phase 2
import RadarFeed from './RadarFeed';
import SniperBrain from './SniperBrain';
import ExecutionDock from './ExecutionDock';

export default function WhaleSniperTerminal() {
  const { address, isConnected } = useAccount();
  const metrics = useSniperStore((state) => state.metrics);
  const setConnectionStatus = useSniperStore((state) => state.setConnectionStatus);
  const setArmed = useSniperStore((state) => state.setArmed);

  // Phase 1 Mock Connection Setup (Zero-render WS Simulation)
  useEffect(() => {
    setConnectionStatus(true);
    return () => setConnectionStatus(false);
  }, []);

  const handleContextMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'copy':
        if (address) {
          navigator.clipboard.writeText(address);
          toast.success('Sovereign Address copied to clipboard.');
        } else {
          toast.error('No ID linked. Cannot copy.');
        }
        break;
      case 'alert':
        toast.success('Whale Alert configured for current viewport thresholds.');
        break;
      case 'ai':
        toast.promise(
          new Promise((resolve) => setTimeout(resolve, 2000)),
          {
            loading: 'Initializing Oracle Intelligence...',
            success: 'Market Analysis: Extreme Volatility detected. Proceed with caution.',
            error: 'AI Node unreachable.',
          }
        );
        break;
      case 'trade':
        setArmed(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      case 'terminal':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
    }
  };

  return (
    <ContextMenu onAction={handleContextMenuAction}>
     <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-mono selection:bg-[#fff] selection:text-[#000] flex flex-col relative overflow-hidden">
      
      {/* ── TOP NAV BAR (MILITARY THEME) ── */}
      <header className="h-10 border-b border-white/10 bg-black flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-black">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/50">
            <Skull size={12} className={metrics.activeConnection ? "text-emerald-500" : "text-rose-500"} />
            <span>WA-SNIPER-V1</span>
          </div>
          <span className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/30">RPC:</span>
            <span className={metrics.rpcStatus === 'HEALTHY' ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.rpcStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">LATENCY:</span>
            <span className="text-white">{metrics.wsLatencyMs}ms</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/30">STATUS:</span>
            {isConnected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                ARMED
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                DISCONNECTED
              </span>
            )}
          </div>
          <span className="w-px h-3 bg-white/10" />
          <span className="text-white/50">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'UNKNOWN_SEC'}</span>
        </div>
      </header>

      {/* ── MAIN TERMINAL GRID (CSS GRID EXACT SPECS) ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_1fr] grid-rows-[auto_1fr] h-[calc(100vh-40px)] gap-px bg-white/5 p-px">
        
        {/* Module 1: RADAR FEED (Left, Takes up most vertical space) */}
        <div className="bg-[#050505] row-span-2 flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
            <span className="flex items-center gap-2"><Activity size={12} /> RADAR_STREAM // MEMPOOL_CAPTURE</span>
            <span>REALTIME_WSS</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
              <RadarFeed />
          </div>
        </div>

        {/* Module 2: SNIPER BRAIN / FILTERS (Top Right) */}
        <div className="bg-[#0a0a0a] flex flex-col border-b border-white/5 relative">
          <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#e0ff00]/60">
            <Crosshair size={12} /> TACTICAL_PARAMETERS
          </div>
          <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
              <SniperBrain />
          </div>
        </div>

        {/* Module 3: EXECUTION DOCK (Bottom Right) */}
        <div className="bg-[#080808] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500/60">
            <Zap size={12} /> LETHAL_EXECUTION
          </div>
          <div className="flex-1 p-4 overflow-y-auto no-scrollbar flex flex-col justify-end">
              <ExecutionDock />
          </div>
        </div>

      </main>
     </div>
    </ContextMenu>
  );
}
