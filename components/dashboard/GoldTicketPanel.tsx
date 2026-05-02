"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useConnect, useSignMessage,
  useReadContract, useSwitchChain, useAccount,
} from 'wagmi';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { injected } from 'wagmi/connectors';
import {
  Zap, Users, Lock, ExternalLink,
  Clock, CheckCircle2, Flame, PenTool, ShieldCheck, ArrowRight
} from 'lucide-react';
import { WhaleLogo } from '@/components/shared/WhaleLogo';
import { useRouter } from 'next/navigation';

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

function SignaturePad({ onSignature, disabled, onMint, mintLabel }: { 
  onSignature: (d: string) => void; 
  disabled: boolean;
  onMint: () => void;
  mintLabel: string;
}) {
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
    if (!hasDrawn || !canvasRef.current) return;
    // Export to a small fixed-resolution JPEG to stay well under the 10KB API limit.
    // High-DPR canvases (Retina/mobile) produce 50-150KB PNGs which the server rejects.
    const src = canvasRef.current;
    const thumb = document.createElement('canvas');
    thumb.width  = 320;
    thumb.height = 80;
    const tCtx = thumb.getContext('2d');
    if (tCtx) tCtx.drawImage(src, 0, 0, 320, 80);
    onSignature(thumb.toDataURL('image/jpeg', 0.4));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header row: label + black AUTHORIZE MINT button */}
      <div className="flex items-center justify-between gap-3">
         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 shrink-0">Manual Endorsement</label>
         <div className="flex items-center gap-2">
           {hasDrawn && !disabled && (
             <button onClick={() => {
               const ctx = canvasRef.current?.getContext('2d');
               ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
               setHasDrawn(false);
               onSignature("");
             }} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3B30] hover:scale-105 transition-all whitespace-nowrap">Reset</button>
           )}
           <button
             onClick={onMint}
             disabled={disabled}
             className="px-4 py-2 bg-[#050505] border border-[#050505] hover:bg-[#FAF9F6] hover:text-[#050505] text-[#FFFFFF] rounded-xl font-black uppercase tracking-[0.15em] text-[9px] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
           >
             {mintLabel}
           </button>
         </div>
      </div>

      {/* Canvas */}
      <div className={`relative w-full h-[160px] rounded-[2rem] overflow-hidden border-2 border-dashed transition-all ${hasDrawn ? 'border-[#D4AF37] bg-white shadow-2xl' : 'border-black/10 bg-black/5'}`}>
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerLeave={stop} />
        {!hasDrawn && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <PenTool size={28} className="text-black mb-2" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sign to Unlock Mint</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalLedger({ feed }: { feed: any[] }) {
  return (
      <div className="w-full h-full bg-white flex flex-col">
         <div className="px-6 py-4 border-b border-black/[0.04] bg-[#FAF9F6] shrink-0 flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">IMMUTABLE GENESIS LEDGER</span>
             <span className="text-[8px] font-black text-black/40 uppercase tracking-[0.3em]">Optimism Mainnet</span>
         </div>
         <div className="grid text-[9px] font-black text-black/30 uppercase tracking-[0.2em] bg-white border-b border-black/[0.04] shrink-0"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
              <div className="px-6 py-3">Sovereign Entity</div>
              <div className="px-6 py-3">Identity / Tier</div>
              <div className="px-6 py-3">Temporal Entry</div>
              <div className="px-6 py-3 text-right">Cryptographic Seal</div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/[0.04]">
            {feed?.length === 0 && (
                <div className="p-8 text-center text-xs font-black text-black/20 uppercase tracking-[0.2em]">
                    Awaiting first Genesis signature...
                </div>
            )}
            {feed?.map((f: any, i: number) => {
                let displaySig = "";
                try {
                  const parsed = JSON.parse(f.signatureData);
                  displaySig = parsed.signature || f.signatureData;
                } catch { displaySig = f.signatureData; }
                
                return (
                    <div key={i} className="grid items-center hover:bg-black/[0.02] transition-colors" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
                        <div className="px-6 py-4 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] shadow-[0_0_8px_rgba(0,192,118,0.4)]" />
                                 <span className="text-xs font-black font-mono text-black">{f.userAddress.slice(0,8)}...{f.userAddress.slice(-6)}</span>
                             </div>
                             {f.twitterHandle && (
                                <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.1em]">@{f.twitterHandle}</span>
                             )}
                        </div>
                        <div className="px-6 py-4 flex flex-col justify-center gap-1">
                             <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.1em]">{f.serialCode || 'GENESIS'}</span>
                             <span className="text-[8px] font-black text-black/40 uppercase tracking-[0.2em]">{f.tier || 'TIER 1'}</span>
                        </div>
                        <div className="px-6 py-4 text-[10px] font-black font-mono text-black/60 uppercase">
                             {new Date(f.claimedAt).toLocaleTimeString()}
                        </div>
                         <div className="px-6 py-2 flex justify-end">
                              {displaySig?.startsWith('data:image') ? (
                                 <div className="bg-[#FAF9F6] border border-black/5 rounded-lg px-3 py-1 shadow-sm">
                                     <img src={displaySig} className="h-10 opacity-80 mix-blend-multiply hover:opacity-100 hover:scale-110 transition-all duration-300" alt="Sig" />
                                 </div>
                              ) : (
                                 <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">NO SEAL</span>
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
  const { address, isConnected, chainId, isSovereignHandshake } = useSovereignAccount();
  const { isConnected: isWagmiConnected } = useAccount(); // Real wagmi connector state
  const router = useRouter();
  const { switchChain } = useSwitchChain();
  const { signMessage, isPending: isSigning } = useSignMessage();
  const [dbStats, setDbStats] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);

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

  const handleMint = useCallback(async () => {
    if (!isConnected) { router.push('/connect'); return; }

    // If user has only a cookie/QR session, they have no wagmi connector → cannot sign
    if (!isWagmiConnected) {
      toast.error('Wallet connection required for signing', {
        description: 'Your current session cannot sign transactions. Click to connect a Web3 wallet (MetaMask, WalletConnect, or Google Auth).',
        duration: 6000,
      });
      router.push('/connect');
      return;
    }

    if (signatureData.length < 50) {
      toast.error('Draw your signature on the pad first');
      return;
    }
    if (isMinting || isSigning) return;

    setIsMinting(true);
    const toastId = toast.loading('Awaiting wallet signature...');

    signMessage(
      { message: `WHALE ALERT NETWORK GOLD ACCESS: ${address}` },
      {
        onSuccess: async (cryptoSignature: string) => {
          toast.dismiss(toastId);
          const t2 = toast.loading('Encoding Institutional Identity...');
          try {
            const res = await fetch('/api/golden-ticket/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: address,
                cryptoSignature,
                signatureData: JSON.stringify({ signature: signatureData, timestamp: new Date().toISOString() })
              })
            });
            toast.dismiss(t2);
            const json = await res.json();
            if (res.ok) {
              toast.success('Access Granted — Welcome to the Genesis Ledger ✓');
              fetchStats();
            } else if (res.status === 409) {
              toast.info('You already hold a Genesis Ticket.');
              fetchStats();
            } else {
              toast.error(`Mint failed: ${json.error || 'Unknown server error'}`);
            }
          } catch (e) {
            toast.dismiss(t2);
            toast.error('Server error saving your ticket. Try again.');
          } finally {
            setIsMinting(false);
          }
        },
        onError: (err: any) => {
          toast.dismiss(toastId);
          toast.error(`Signature failed: ${err?.shortMessage || err?.message || 'User rejected or wallet error'}`);
          setIsMinting(false);
        }
      }
    );
  }, [isConnected, signatureData, isMinting, isSigning, address, signMessage, router, fetchStats]);

  const hasTicket = dbStats?.ticket || false;

  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      
      {/* ── HERO & INTERACTION (BENTO GRID) ── */}
      <div className="grid lg:grid-cols-2 gap-4 shrink-0">
          
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl flex flex-col justify-center p-6 shadow-sm">
               <div className="shrink-0 pt-2 pb-6 border-b border-[#E5E5E5] w-full bg-white flex flex-col gap-0.5 mb-4">
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#050505]">
                        Entity Registry
                    </h1>
                    <p className="text-[10px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] leading-tight">
                        Clearance verification and institutional asset minting.
                    </p>
                </div>
               <div className="bg-[#FAF9F6] border border-black/[0.04] p-6 rounded-2xl space-y-6">
                  <SupplyBar minted={dbStats?.totalClaimed || 0} max={MAX_SUPPLY} />
               </div>
          </div>

          {!hasTicket ? (
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#050505]">Claim Access</h3>
                   <span className="text-[9px] text-[#888888] uppercase">Verification</span>
                </div>
                 <div className="flex-1">
                    <SignaturePad 
                      onSignature={setSignatureData} 
                      disabled={hasTicket}
                      onMint={handleMint}
                      mintLabel={
                        isMinting || isSigning ? 'SIGNING...' :
                        !isConnected || !isWagmiConnected ? 'CONNECT WALLET' : 'AUTHORIZE MINT'
                      }
                    />
                 </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-sm grid grid-cols-2 gap-4">
               <StatChip label="MEMBER SERIAL" value={dbStats.ticket.serialCode} accent />
               <StatChip label="IDENTIFICATION" value={truncAddr(address!)} />
               <StatChip label="ENTRY POINT" value="Optimism L2" />
               <StatChip label="STATUS" value="VERIFIED SOVEREIGN" />
            </div>
          )}
      </div>

      {/* ── GLOBAL LEDGER ── */}
      <div className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl min-h-0 shadow-sm overflow-hidden flex flex-col">
         <GlobalLedger feed={dbStats?.feed || []} />
      </div>

    </div>
  );
}
