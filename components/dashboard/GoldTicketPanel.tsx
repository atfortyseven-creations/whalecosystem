"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useAccount, useConnect, useSignMessage,
  useReadContract, useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import {
  Zap, Users, Lock, ExternalLink,
  Clock, CheckCircle2, Flame, PenTool, ShieldCheck, ArrowRight
} from 'lucide-react';
import { WhaleLogo } from '@/components/shared/WhaleLogo';

// ── Contract ──────────────────────────────────────────────────────────────────
const CONTRACT = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a' as const;
const OPTIMISM_CHAIN_ID = 10;
const MAX_SUPPLY = 200;

const ABI = [
  { inputs: [], name: 'mint', outputs: [], stateMutability: 'payable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }, { internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'maxSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'mintPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const truncAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtEth = (wei: bigint) => (Number(wei) / 1e18).toFixed(4);
const pct = (a: number, b: number) => Math.min(100, Math.round((a / b) * 100));

// ── Sub-components ────────────────────────────────────────────────────────────

function SupplyBar({ minted, max }: { minted: number; max: number }) {
  const fill = pct(minted, max);
  const remaining = max - minted;
  const isAlmostFull = remaining <= 20;
  const urgencyColor = isAlmostFull ? '#FF9500' : '#D4AF37';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-4xl font-black font-mono text-[#050505] tracking-tighter leading-none">
            {minted}
          </span>
          <span className="text-sm font-black font-mono text-[#888888] ml-2">/ {max}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Remaining Slots</p>
          <p className="text-2xl font-black font-mono tracking-tighter text-[#D4AF37]">
            {remaining}
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-black/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: urgencyColor }}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 w-24"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          animate={{ left: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
        <span className="text-[#D4AF37]">{fill}% INSTITUTIONAL CAP REACHED</span>
        {isAlmostFull && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-[#FF9500]"
          >
            <Flame size={12} /> CRITICAL SCARCITY
          </motion.span>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 px-6 py-5 rounded-3xl border ${accent ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(212,175,55,0.05)]' : 'bg-white border-black/[0.06] shadow-xl'}`}>
      <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-base font-black font-mono tracking-tighter ${accent ? 'text-[#D4AF37]' : 'text-black'}`}>{value}</p>
    </div>
  );
}

function SignaturePad({ onSignature, disabled }: { onSignature: (d: string) => void; disabled: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const stop = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (hasDrawn && canvasRef.current) onSignature(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex items-center justify-between">
         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Manual Endorsement</label>
         {hasDrawn && !disabled && (
           <button onClick={() => {
             const ctx = canvasRef.current?.getContext('2d');
             ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
             setHasDrawn(false);
             onSignature("");
           }} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3B30] hover:scale-105 transition-all">Reset Pad</button>
         )}
      </div>

      <div className={`relative w-full h-[180px] rounded-[2rem] overflow-hidden border-2 border-dashed transition-all ${hasDrawn ? 'border-[#D4AF37] bg-white shadow-2xl' : 'border-black/10 bg-black/5'}`}>
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerLeave={stop} />
        {!hasDrawn && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <PenTool size={32} className="text-black mb-3" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Sign Cryptographic Endorsement</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalLedger({ feed }: { feed: any[] }) {
  return (
      <div className="bg-white border border-black/[0.08] rounded-[3rem] overflow-hidden mt-12 shadow-2xl">
         <div className="px-10 py-8 border-b border-black/[0.04] bg-black/5 flex items-center justify-between">
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">IMMUTABLE GENESIS LEDGER</span>
             <span className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">Optimism Mainnet</span>
         </div>
         <div className="grid text-[10px] font-black text-black/30 uppercase tracking-[0.2em] bg-white border-b border-black/[0.04]"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
              <div className="px-10 py-5">Verified Sovereign</div>
              <div className="px-10 py-5">Temporal Entry</div>
              <div className="px-10 py-5 text-right">Cryptographic Seal</div>
         </div>
         <div className="divide-y divide-black/[0.04]">
            {feed?.map((f: any, i: number) => {
                let displaySig = "";
                try {
                  const parsed = JSON.parse(f.signatureData);
                  displaySig = parsed.signature || f.signatureData;
                } catch { displaySig = f.signatureData; }
                
                return (
                    <div key={i} className="grid items-center hover:bg-black/[0.02] transition-colors" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
                        <div className="px-10 py-6 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-[#00C076] shadow-[0_0_8px_rgba(0,192,118,0.4)]" />
                             <span className="text-sm font-black font-mono text-black">{truncAddr(f.userAddress)}</span>
                        </div>
                        <div className="px-10 py-6 text-[10px] font-black font-mono text-black/40 uppercase">
                             {new Date(f.claimedAt).toLocaleTimeString()}
                        </div>
                         <div className="px-10 py-2 flex justify-end">
                              {displaySig?.startsWith('data:image') && (
                                 <img src={displaySig} className="h-10 opacity-70 mix-blend-multiply grayscale hover:grayscale-0 transition-all" alt="Sig" />
                              )}
                         </div>
                    </div>
                );
            })}
         </div>
      </div>
  );
}

export function GoldTicketPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();
  const { signMessage, isSuccess: isConfirmed, reset: resetTx } = useSignMessage();
  const [dbStats, setDbStats] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string>("");

  const fetchStats = useCallback(async () => {
    try {
      const q = address ? `?address=${address}` : '';
      const res = await fetch(`/api/golden-ticket/claim${q}`);
      const json = await res.json();
      setDbStats(json);
    } catch {}
  }, [address]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    if (isConfirmed && address) {
      const exec = async () => {
        toast.loading('Encoding Institutional Identity...');
        await fetch('/api/golden-ticket/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, signatureData: JSON.stringify({ signature: signatureData, timestamp: new Date().toISOString() }) })
        });
        toast.success('Access Granted ✓');
        fetchStats();
      };
      exec();
    }
  }, [isConfirmed, address, signatureData, fetchStats]);

  const hasTicket = dbStats?.ticket || false;

  return (
    <div className="w-full h-full overflow-y-auto msv-hide-scrollbar flex flex-col items-center">
        <div className="w-full max-w-6xl py-12 px-6 space-y-12 shrink-0">
      
      {/* ── HERO ── */}
      <div className="relative bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl overflow-hidden p-10 md:p-14 shadow-sm">
         
         <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-[#050505] shadow-sm" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Institutional Auth Layer</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-[#050505] uppercase tracking-tighter leading-tight mb-8 border-b border-[#E5E5E5] pb-6">
                  TICKET <span className="text-[#888888]">MINTING</span>
               </h1>
               <p className="text-sm text-[#888888] font-bold leading-relaxed mb-10 max-w-xl font-sans">
                  The Sovereign Ticket mechanism is the ultimate echelon of institutional tracking. It provides permanent, encrypted access to the core mempool engine and the largest capital flow signatures across the ledger.
               </p>
               <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-2.5 bg-[#050505] text-[#FFFFFF] rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                     GENESIS STATUS: ACTIVE
                  </div>
                  <div className="px-6 py-3 border border-black/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-black/40">
                     OPTIMISM SETTLEMENT
                  </div>
               </div>
            </div>

            <div className="bg-black/5 border border-black/[0.04] p-12 rounded-[3rem] space-y-10 shadow-inner">
               <div className="text-center space-y-2">
                  <motion.div key={dbStats?.totalClaimed} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black font-mono text-black leading-none tracking-tighter">
                     {dbStats?.totalClaimed || '000'}
                  </motion.div>
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-black/20">Genesis Endorsements Issued</p>
               </div>
               <SupplyBar minted={dbStats?.totalClaimed || 0} max={MAX_SUPPLY} />
            </div>
         </div>
      </div>

      {/* ── INTERACTIVE MINT SECTION ── */}
      {!hasTicket && (
        <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-10 shadow-sm h-fit">
                <h3 className="text-xl font-black uppercase tracking-widest mb-8 text-[#050505]">Endorsement Protocol</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-6 p-5 bg-[#FAF9F6] rounded-xl group hover:bg-[#050505] transition-all cursor-pointer border border-[#E5E5E5] hover:border-[#050505]">
                        <div className="w-10 h-10 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg flex items-center justify-center font-black text-sm text-[#050505]">1</div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] group-hover:text-[#888888]">Identity Binding</span>
                            <span className="text-xs font-black uppercase text-[#050505] group-hover:text-[#FFFFFF]">Connect Verified Wallet</span>
                        </div>
                        <ArrowRight className="ml-auto text-[#888888] group-hover:text-[#FFFFFF] transition-all" />
                    </div>
                    <div className="flex items-center gap-6 p-5 bg-[#FAF9F6] rounded-xl group hover:bg-[#050505] transition-all cursor-pointer border border-[#E5E5E5] hover:border-[#050505]">
                        <div className="w-10 h-10 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg flex items-center justify-center font-black text-sm text-[#050505]">2</div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] group-hover:text-[#888888]">Manual Endorsement</span>
                            <span className="text-xs font-black uppercase text-[#050505] group-hover:text-[#FFFFFF]">Sign the Sovereign Pad</span>
                        </div>
                        <ArrowRight className="ml-auto text-[#888888] group-hover:text-[#FFFFFF] transition-all" />
                    </div>
                    <div className="flex items-center gap-6 p-5 bg-[#FAF9F6] rounded-xl group hover:bg-[#050505] transition-all cursor-pointer border border-[#E5E5E5] hover:border-[#050505]">
                        <div className="w-10 h-10 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg flex items-center justify-center font-black text-sm text-[#050505]">3</div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] group-hover:text-[#888888]">Network Entry</span>
                            <span className="text-xs font-black uppercase text-[#050505] group-hover:text-[#FFFFFF]">Mint Permanent Access</span>
                        </div>
                        <ArrowRight className="ml-auto text-[#888888] group-hover:text-[#FFFFFF] transition-all" />
                    </div>
                </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-10 shadow-sm">
                <h3 className="text-xl font-black uppercase tracking-widest mb-4 text-center text-[#050505]">Claim Access</h3>
                <SignaturePad onSignature={setSignatureData} disabled={hasTicket} />
                
                <button 
                  onClick={() => {
                    if (!isConnected) connect({ connector: injected() });
                    else if (signatureData.length < 50) toast.error("Signature required on pad");
                    else signMessage({ message: `WHALE ALERT NETWORK GOLD ACCESS: ${address}` });
                  }}
                  className="w-full mt-10 py-5 bg-[#050505] border border-[#050505] hover:bg-[#FAF9F6] hover:text-[#050505] text-[#FFFFFF] rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all"
                >
                  {isConnected ? 'AUTHORIZE MINT' : 'CONNECT WALLET'}
                </button>
            </div>
        </div>
      )}

      {/* ── ALREADY HAS TICKET ── */}
      {hasTicket && (
        <div className="grid md:grid-cols-2 gap-8">
            <StatChip label="MEMBER SERIAL" value={dbStats.ticket.serialCode} accent />
            <StatChip label="IDENTIFICATION" value={truncAddr(address!)} />
            <StatChip label="ENTRY POINT" value="Optimism L2" />
            <StatChip label="STATUS" value="VERIFIED SOVEREIGN" />
        </div>
      )}

      <GlobalLedger feed={dbStats?.feed || []} />
        </div>
    </div>
  );
}
