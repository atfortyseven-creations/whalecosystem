"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ShieldAlert, Zap, Lock, Crosshair, AlertTriangle, Fingerprint, Activity, Ban } from 'lucide-react';
import { useSniperStore } from '@/store/useSniperStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ExecutionDock() {
  const { isConnected, address } = useAccount();
  const filters = useSniperStore((state) => state.filters);
  const currentPrice = useSniperStore((state) => state.currentPrice);
  const addExecutedTrade = useSniperStore((state) => state.addExecutedTrade);
  
  const [isArmed, setIsArmed] = useState(false);
  
  const { data: hash, isPending, sendTransaction, error: txError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Feed confirmed transactions to the Tactical History store
  useEffect(() => {
    if (isConfirmed && hash) {
      addExecutedTrade(hash, 0, currentPrice); // Recording 0 amount as it's a test tx, but recording the exact price tick it fired at
    }
  }, [isConfirmed, hash, addExecutedTrade]);

  const handleLethalExecution = async () => {
    if (!isConnected || !address) {
      toast.error('Cannot execute: No identity linked.');
      return;
    }
    
    // Safety check - requires active armed state
    if (!isArmed) return;

    try {
      // PROVE IT WORKS: We execute a 0 ETH transaction to OURSELVES to trigger MetaMask/Wallet popup
      // This guarantees the frontend is interacting perfectly with real Web3 state without losing funds.
      sendTransaction({
        to: address,
        value: parseEther('0'), 
      });
      setIsArmed(false); // Disarm immediately after firing
    } catch (e: any) {
      toast.error(`Execution failed: ${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full relative">
      
      {/* ── PRICE TICKER ── */}
      <div className="flex flex-col gap-1 items-end z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#e0ff00]/50">
          ORACLE // BINANCE_WSS
        </span>
        <div className="text-4xl lg:text-5xl font-mono text-white tracking-tighter flex items-baseline gap-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <span className="text-white/20 text-2xl">$</span>
          {currentPrice > 0 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---.--'}
        </div>
      </div>

      <div className="flex-1" />

      {/* ── EXECUTION STATS ── */}
      <div className="space-y-3 bg-[#0a0a0a] border border-white/5 p-4 rounded-sm z-10 relative overflow-hidden">
         {isPending || isConfirming ? (
             <div className="absolute inset-0 bg-[#e0ff00]/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-3 text-[#e0ff00] font-black uppercase tracking-widest text-xs">
                     <Activity size={16} className="animate-spin" /> 
                     {isPending ? 'AWAITING WALLET SIGNATURE...' : 'BROADCASTING TO MEMPOOL...'}
                 </div>
                 {hash && <span className="text-[9px] font-mono mt-2 text-[#e0ff00]/60">{hash.slice(0, 10)}...{hash.slice(-8)}</span>}
             </div>
         ) : isConfirmed ? (
             <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                     EXECUTION CONFIRMED
                 </div>
                 <button onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')} className="text-[9px] font-mono mt-2 underline text-emerald-400/60 hover:text-emerald-400">View on Explorer</button>
             </div>
         ) : null}

         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Crosshair size={12}/> AUTO-EXECUTION</span>
           <span className={filters.autoExecute ? 'text-rose-500' : 'text-white/20'}>
             {filters.autoExecute ? 'LETHAL' : 'DISABLED'}
           </span>
         </div>
         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Lock size={12}/> SLIPPAGE LIMIT</span>
           <span className="text-emerald-400">{filters.slippageTolerance.toFixed(1)}%</span>
         </div>
         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40">
           <span className="flex items-center gap-2"><Zap size={12}/> MAX GAS (GWEI)</span>
           <span className="text-cyan-400">{filters.gasLimitGwei}</span>
         </div>
      </div>

      {txError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 text-center justify-center">
              <Ban size={12} /> {(txError as any).shortMessage || 'TX REJECTED DENTRO DEL PROMPT'}
          </div>
      )}

      {/* ── EXECUTION DEPLOYMENT ZONE ── */}
      {!isConnected ? (
        <div className="w-full py-5 bg-white/5 border border-white/10 rounded-sm text-center text-white/20 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
          <ShieldAlert size={16} /> WALLET REQUIRED
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <button 
                onClick={() => setIsArmed(!isArmed)}
                disabled={isPending || isConfirming}
                className={`py-5 px-6 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${
                    isArmed 
                     ? 'bg-rose-500/20 text-rose-500 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]' 
                     : 'bg-black text-white/40 border-white/10 hover:border-white/30 hover:text-white/80'
                }`}
            >
                <Fingerprint size={16} className={isArmed ? 'animate-pulse' : ''} />
                {isArmed ? 'ARMED' : 'ARM'}
            </button>
            <button 
                onClick={handleLethalExecution}
                disabled={!isArmed || isPending || isConfirming}
                className={`h-full px-8 relative group overflow-hidden rounded-sm transition-all border ${
                    isArmed && !isPending && !isConfirming
                     ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 cursor-pointer hover:bg-rose-600 hover:text-white hover:border-rose-600'
                     : 'bg-black border-white/5 text-white/10 cursor-not-allowed'
                }`}
            >
                <div className="relative flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em]">
                    <AlertTriangle size={16} />
                    LETHAL FIRE
                </div>
            </button>
        </div>
      )}

    </div>
  );
}
