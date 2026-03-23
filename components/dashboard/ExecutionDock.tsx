"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ShieldAlert, Zap, Lock, Crosshair, AlertTriangle, Fingerprint, Activity, Ban } from 'lucide-react';
import { useSniperStore } from '@/store/useSniperStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Optional: Add default native ETH address and target token (e.g. USDC on ETH Mainnet)
const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEqEeeEEEeeeeEeeeeeeeEEeE";
const TARGET_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export default function ExecutionDock() {
  const { isConnected, address } = useAccount();
  const filters = useSniperStore((state) => state.filters);
  const currentPrice = useSniperStore((state) => state.currentPrice);
  const addExecutedTrade = useSniperStore((state) => state.addExecutedTrade);
  const isArmed = useSniperStore((state) => state.isArmed);
  const setArmed = useSniperStore((state) => state.setArmed);
  
  const { data: hash, isPending, sendTransaction, error: txError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Feed confirmed transactions to the Tactical History store
  useEffect(() => {
    if (isConfirmed && hash) {
      addExecutedTrade(hash, 0, currentPrice); // Recording 0 amount as it's a test tx, but recording the exact price tick it fired at
    }
  }, [isConfirmed, hash, addExecutedTrade]);

  const [isQuoting, setIsQuoting] = useState(false);

  const handleLethalExecution = async () => {
    if (!isConnected || !address) {
      toast.error('Cannot execute: No identity linked.');
      return;
    }
    
    if (!isArmed) return;

    try {
      setIsQuoting(true);
      // REAL WEB3 INTERACTION: Fetching a real swap quote from 0x Protocol 
      // Swapping 0.001 ETH to USDC as a baseline sniper action
      const sellAmount = parseEther('0.001').toString(); 
      
      const response = await fetch(
        `https://api.0x.org/swap/v1/quote?sellToken=${NATIVE_ETH}&buyToken=${TARGET_USDC}&sellAmount=${sellAmount}&takerAddress=${address}&slippagePercentage=${filters.slippageTolerance / 100}`,
        {
          headers: {
            '0x-api-key': 'd10eefd5-bd84-4861-bb38-4e36dc6fa8e9' // Demo/Public key for 0x
          }
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.validationErrors?.[0]?.reason || err.reason || "Failed to fetch DEX routing.");
      }

      const quote = await response.json();

      setIsQuoting(false);
      
      // Execute the genuine DEX swap transaction
      sendTransaction({
        to: quote.to,
        data: quote.data,
        value: BigInt(quote.value), 
      });
      
      setArmed(false);
    } catch (e: any) {
      setIsQuoting(false);
      setArmed(false);
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
         {isQuoting || isPending || isConfirming ? (
             <div className="absolute inset-0 bg-[#e0ff00]/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-3 text-[#e0ff00] font-black uppercase tracking-widest text-xs">
                     <Activity size={16} className="animate-spin" /> 
                     {isQuoting ? 'ROUTING DEX LIQUIDITY...' : isPending ? 'AWAITING WALLET SIGNATURE...' : 'BROADCASTING TO MEMPOOL...'}
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
                onClick={() => setArmed(!isArmed)}
                disabled={isPending || isConfirming}
                className={`py-5 px-6 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${
                    isArmed 
                     ? 'bg-rose-500/10 text-rose-500 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)] ring-1 ring-rose-500/50' 
                     : 'bg-[#050505] text-white/40 border-white/10 hover:border-[#e0ff00]/40 hover:text-[#e0ff00] hover:shadow-[0_0_15px_rgba(224,255,0,0.1)]'
                }`}
            >
                <Fingerprint size={16} className={isArmed ? 'animate-pulse' : ''} />
                {isArmed ? 'ARMED' : 'ARM'}
            </button>
            <button 
                onClick={handleLethalExecution}
                disabled={!isArmed || isQuoting || isPending || isConfirming}
                className={`h-full px-8 relative group overflow-hidden rounded-sm transition-all border ${
                    isArmed && !isQuoting && !isPending && !isConfirming
                     ? 'bg-[#050505] border-rose-500/50 text-rose-500 cursor-crosshair hover:bg-rose-500/20 hover:text-white hover:border-rose-500 hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]'
                     : 'bg-[#050505] border-white/5 text-white/10 cursor-not-allowed'
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
