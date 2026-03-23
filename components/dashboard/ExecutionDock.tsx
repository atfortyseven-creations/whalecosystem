"use client";

import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSniperStore } from '@/store/useSniperStore';
import { ShieldAlert, Zap, Lock, Crosshair } from 'lucide-react';

export default function ExecutionDock() {
  const { isConnected } = useAccount();
  const filters = useSniperStore((state) => state.filters);
  const currentPrice = useSniperStore((state) => state.currentPrice);
  const setPrice = useSniperStore((state) => state.setPrice);

  // 1. CONNECT BINANCE HFT STREAM DIRECTLY TO ZUSTAND
  // This bypasses React re-renders for the entire component tree, 
  // only updating the specific text node connected to the Zustand selector.
  useEffect(() => {
    let ws: WebSocket;
    let fallbackInterval: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price = parseFloat(data.p);
          if (!isNaN(price)) {
            // Update zero-render Zustand store
            setPrice(price, 12); // Mock 12ms latency for Binance
          }
        } catch (e) {
          // Silent catch for HFT
        }
      };

      ws.onerror = () => {
        // Silent reconnect in real environment
      };
      
      ws.onclose = () => {
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearInterval(fallbackInterval);
    };
  }, [setPrice]);

  return (
    <div className="flex flex-col gap-6 w-full h-full relative">
      
      {/* ── LIVE PRICE FEED (Zero Render from Context) ── */}
      <div className="flex flex-col gap-1 items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#e0ff00]/50">
          ORACLE // BINANCE_WSS
        </span>
        <div className="text-4xl lg:text-5xl font-mono text-white tracking-tighter flex items-baseline gap-2">
          <span className="text-white/20 text-2xl">$</span>
          {currentPrice > 0 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---.--'}
        </div>
      </div>

      <div className="flex-1" />

      {/* ── EXECUTION CONFIRMATIONS ── */}
      <div className="space-y-3 bg-[#0a0a0a] border border-white/5 p-4 rounded-sm">
         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Crosshair size={12}/> AUTO-EXECUTION</span>
           <span className={filters.autoExecute ? 'text-rose-500' : 'text-white/20'}>
             {filters.autoExecute ? 'LETHAL' : 'DISABLED'}
           </span>
         </div>
         
         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Lock size={12}/> SLIPPAGE PROTECTION</span>
           <span className="text-emerald-400">{filters.slippageTolerance.toFixed(1)}%</span>
         </div>

         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Zap size={12}/> MAX GAS THRESHOLD</span>
           <span className="text-cyan-400">{filters.gasLimitGwei} GWEI</span>
         </div>
      </div>

      {/* ── KILL SWITCH / EXECUTE BUTTON ── */}
      {!isConnected ? (
        <button 
          disabled
          className="w-full py-5 bg-white/5 border border-white/10 rounded-sm text-center text-white/20 text-[11px] font-black uppercase tracking-[0.2em] cursor-not-allowed flex items-center justify-center gap-3"
        >
          <ShieldAlert size={16} /> WALLET DISCONNECTED
        </button>
      ) : (
        <button 
          className="w-full relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <div className="relative w-full py-5 bg-rose-500/10 border border-rose-500/30 rounded-sm text-center text-rose-500 group-hover:text-white text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-3">
             <Zap size={16} className="animate-pulse" />
             FORCE MANUAL DEPLOYMENT
          </div>
        </button>
      )}

    </div>
  );
}
