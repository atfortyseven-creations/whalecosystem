"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConnect, useSignMessage, useReadContract, useSwitchChain, useAccount } from 'wagmi';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { injected } from 'wagmi/connectors';
import {
  Lock, ExternalLink, Activity, Network, Trophy, Focus,
  Clock, CheckCircle2, Flame, PenTool, ShieldCheck, X, ScanFace, FileSignature, Globe
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';

// ── Contract Params ───────────────────────────────────────────────────────────
const MAX_SUPPLY = 200;

// ── Helpers ───────────────────────────────────────────────────────────────────
const truncAddr = (a: string) => !a || a.length < 10 ? (a || '—') : `${a.slice(0, 6)}…${a.slice(-4)}`;
const pct = (a: number, b: number) => Math.min(100, Math.round((a / b) * 100));

// ── Sub-components: Institutional Aesthetic ───────────────────────────────────

function AllocationTelemetryBar({ minted, max }: { minted: number; max: number }) {
  const fill = pct(minted, max);
  const remaining = max - minted;
  const isAlmostFull = remaining <= 10;

  return (
    <div className="w-full space-y-5 px-1 relative z-10">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-[0.2em] mb-1">Issued Tickets</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-medium font-mono text-[#FAF9F6] tracking-tighter leading-none">
              {String(minted).padStart(3, '0')}
            </span>
            <span className="text-xl font-medium font-mono text-[#D4AF37]/50">/ {max}</span>
           </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-[0.2em] mb-1">Available Allocation</span>
          <span className="text-3xl font-medium font-mono tracking-tighter text-[#D4AF37]">
            {String(remaining).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="relative h-2 w-full bg-[#111111] overflow-hidden rounded-full border border-white/5">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
           className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay"
           animate={{ left: ['-100%', '100%'] }}
           transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
         />
      </div>

      <div className="flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] pt-1 pt-2">
        <span className="text-[#A0A0A0] flex items-center gap-2">
          <Activity size={12} className="text-[#D4AF37]" /> CAPACITY REACHED <span className="text-[#FAF9F6] font-mono font-medium">{fill}%</span>
        </span>
        {isAlmostFull ? (
          <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-2 text-[#FF3B30] font-bold">
             <Flame size={12} /> NEARING CAPACITY LIMIT
          </motion.span>
        ) : (
          <span className="flex items-center gap-2 text-[#D4AF37]/80">
            <Lock size={12} /> L2 PROVISIONING ACTIVE
          </span>
         )}
      </div>
    </div>
  );
}

function AcademicStatCard({ label, value, icon: Icon, isApex = false }: { label: string; value: string; icon: any; isApex?: boolean }) {
  return (
    <div className={`relative flex flex-col justify-between p-5 md:p-6 overflow-hidden border transition-all ${isApex ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30 shadow-none' : 'bg-white border-[#E5E5E5]'}`}>
        {isApex && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[50px] -z-10 rounded-full" />
        )}
        <div className="flex items-center justify-between mb-4 z-10">
           <p className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">{label}</p>
           <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isApex ? 'bg-[#D4AF37]/10' : 'bg-[#FAF9F6]'}`}>
              <Icon size={12} className={isApex ? 'text-[#D4AF37]' : 'text-[#A0A0A0]'} />
           </div>
        </div>
        <p className={`text-sm md:text-base lg:text-lg font-black font-mono tracking-tighter truncate z-10 ${isApex ? 'text-[#D4AF37]' : 'text-[#050505]'}`}>
            {value}
        </p>
    </div>
  );
}

function AuthorizationSignaturePad({ onSignature, disabled, onMint, mintLabel }: { 
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
    ctx.strokeStyle = '#000000'; // Black ink for clear visibility on white background
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 2;
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
    if (tCtx) {
      tCtx.fillStyle = '#FFFFFF';
      tCtx.fillRect(0, 0, 320, 80);
      tCtx.drawImage(src, 0, 0, 320, 80);
    }
    onSignature(thumb.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="flex flex-col gap-4 h-full relative z-10 w-full mb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase text-[#D4AF37] tracking-[0.2em] flex items-center gap-2">
               <FileSignature size={14} /> CRYPTOGRAPHIC AUTHORIZATION
             </label>
             <p className="text-[9px] text-[#A0A0A0] uppercase tracking-widest font-normal max-w-[280px]">
                 Provide internal signature authorization to proceed with issuance.
             </p>
         </div>
         <div className="flex items-center gap-3">
           {hasDrawn && !disabled && (
             <button onClick={() => {
               const ctx = canvasRef.current?.getContext('2d');
               ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
               setHasDrawn(false);
               onSignature("");
             }} className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 flex items-center gap-2 rounded-md">
               <X size={12} /> CLEAR
             </button>
           )}
           <button
             onClick={onMint}
             disabled={disabled}
             className="px-6 py-2 bg-[#D4AF37] text-black hover:bg-white transition-all font-bold uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap outline-none rounded-md"
           >
             {mintLabel}
           </button>
         </div>
      </div>

      <div className={`relative w-full h-[180px] bg-white rounded-xl overflow-hidden transition-all ${hasDrawn ? 'border border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border border-[#E5E5E5]'}`}>
        {/* Subtle academic grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none" onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerLeave={stop} />
        
        {!hasDrawn && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 z-0">
            <ScanFace size={28} className="text-[black] opacity-30 mb-3" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[black]/40">AWAITING SIGNATURE INPUT</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VerifiedLedger({ feed }: { feed: any[] }) {
  const displayFeed = feed || [];

  return (
      <div className="w-full h-full flex flex-col bg-[#FAF9F6] overflow-hidden">
         <div className="px-6 py-5 border-b border-[#E5E5E5] bg-white shrink-0 flex items-center justify-between z-10 relative">
             <div className="flex items-center gap-4">
                 <ShieldCheck size={16} className="text-[#D4AF37]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">VERIFIED LEDGER</span>
             </div>
             <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] bg-[#D4AF37]/10 px-3 py-1 rounded-[4px] border border-[#D4AF37]/20 flex items-center gap-2">
                 <Network size={12} /> NETWORK: OPTIMISM MAINNET
             </span>
         </div>
         {/* Formal Academic Header */}
         <div className="grid text-[9px] font-black text-[#888888] uppercase tracking-[0.15em] bg-white border-b border-[#E5E5E5] shrink-0"
              style={{ gridTemplateColumns: '80px 1.2fr 180px 180px 160px 1fr 200px' }}>
              <div className="px-6 py-4">INDEX</div>
              <div className="px-6 py-4">WALLET ADDRESS</div>
              <div className="px-6 py-4">TIER</div>
              <div className="px-6 py-4">L2 CLEARANCE</div>
              <div className="px-6 py-4 text-center">X VERIFICATION</div>
              <div className="px-6 py-4">TIMESTAMP</div>
              <div className="px-6 py-4 text-right">CRYPTOGRAPHIC SEAL</div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
            {displayFeed.length === 0 ? (
               <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                  <ShieldCheck size={32} className="text-[#E5E5E5] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">NO INSTITUTIONAL CLEARANCES ISSUED</p>
                  <p className="text-[9px] text-[#A0A0A0] mt-2 tracking-widest uppercase">Awaiting Genesis Ticket Allocations</p>
               </div>
            ) : (
                displayFeed.map((f: any, i: number) => {
                    let displaySig = "";
                    try {
                      const parsed = JSON.parse(f.signatureData);
                      displaySig = parsed.signature || f.signatureData;
                    } catch { displaySig = f.signatureData; }
                    
                    const tier = f.tier || 'GENESIS';
                    const colorHex = f.badgeColor === 'GOLD' ? '#D4AF37' : '#FFFFFF';
                    const hasTwtr = !!f.twitterHandle;
                    
                    // The fix for canvas rendering was deployed around 2026-04-24T09:49Z.
                    // Any JPEG signature generated before this is a black JPEG with gold lines.
                    // We invert it to match the pristine white aesthetic.
                    const isOldBlackJpeg = displaySig?.startsWith('data:image/jpeg') && f.claimedAt && new Date(f.claimedAt).getTime() < 1713955000000;
                    
                    return (
                        <div key={i} className="grid items-center hover:bg-[#FAF9F6] bg-white border-b border-[#F0F0F0] transition-colors" style={{ gridTemplateColumns: '80px 1.2fr 180px 180px 160px 1fr 200px' }}>
                            {/* Index */}
                            <div className="px-6 py-5 text-black font-black font-mono text-[11px]">
                                {String(i+1).padStart(3, '0')}
                            </div>
                            {/* Identity */}
                            <div className="px-6 py-5 flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex === '#FFFFFF' ? '#A0A0A0' : colorHex, boxShadow: `0 0 10px ${colorHex === '#FFFFFF' ? '#A0A0A0' : colorHex}80` }} />
                                 <span className="text-[13px] font-black font-mono text-black">{truncAddr(f.userAddress)}</span>
                            </div>
                            {/* Clearance */}
                            <div className="px-6 py-5">
                                 <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/30 whitespace-nowrap rounded-md shadow-sm">
                                     {tier} {(f.serialCode?.split('-').pop() || '0000').slice(-4)}
                                 </span>
                            </div>
                            {/* L2 Eligbility */}
                            <div className="px-6 py-5">
                                 <span className={`text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 ${f.networkLaunchEligible ? 'text-[#00C076]' : 'text-[#888888]'}`}>
                                     {f.networkLaunchEligible ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                                     {f.networkLaunchEligible ? 'WHITELISTED L2' : 'PENDING'}
                                 </span>
                            </div>
                            {/* X Intel */}
                            <div className="px-6 py-5 text-center">
                                {hasTwtr ? (
                                   <a href={`https://x.com/${f.twitterHandle}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#1DA1F2] hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                      @{f.twitterHandle} <ExternalLink size={12} />
                                   </a>
                                ) : (
                                   <span className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">—</span>
                                )}
                            </div>
                            {/* Temporal Ingestion */}
                            <div className="px-6 py-5 text-[11px] sm:text-[12px] font-black font-mono flex flex-col gap-0.5">
                                 <span className="text-black">{new Date(f.claimedAt).toLocaleDateString()}</span>
                                 <span className="text-[#888888]">{new Date(f.claimedAt).toISOString().split('T')[1].replace('Z', '')}</span>
                            </div>
                            {/* Signature */}
                             <div className="px-6 py-3 flex justify-end">
                                  {displaySig?.startsWith('data:image') ? (
                                     <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden w-[140px] h-[50px] flex items-center justify-center">
                                        <img 
                                          src={displaySig} 
                                          className="w-full h-full object-contain scale-[1.1] transition-transform duration-300" 
                                          style={isOldBlackJpeg ? { filter: 'invert(1) grayscale(1) contrast(1.5) brightness(1.2)' } : { mixBlendMode: 'darken' }} 
                                          alt="Signature" 
                                        />
                                     </div>
                                  ) : (
                                     <span className="font-mono text-[10px] font-black text-[#A0A0A0] bg-[#050505]/5 px-2 py-1 rounded">
                                         {displaySig && displaySig.length > 5 ? truncAddr(displaySig) : (displaySig || '—')}
                                     </span>
                                  )}
                             </div>
                        </div>
                    );
                })
            )}
         </div>
      </div>
  );
}

export function VossSupremacyPanel() {
  const { address, isConnected, isSovereignHandshake } = useSovereignAccount();
  const { isConnected: isWagmiConnected } = useAccount();
  const { openConnectModal } = useUIStore();
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
    if (!isConnected) { openConnectModal(); return; }
    if (!isWagmiConnected) {
      toast.error('Local web3 validation required', {
        description: 'Your current session is passive. Full connection required for ticket allocation.',
      });
      openConnectModal();
      return;
    }

    if (signatureData.length < 50) {
      toast.error('Incomplete Request', { description: 'Provide authorization signature.' });
      return;
    }

    if (isMinting || isSigning) return;
    setIsMinting(true);
    const toastId = toast.loading('Awaiting external wallet verification...', { style: { background: '#050505', color: '#D4AF37', border: '1px solid #D4AF3740' } });

    signMessage(
      { message: `WHALE ALERT NETWORK GOLD ACCESS: ${address}` },
      {
        onSuccess: async (cryptoSignature: string) => {
          toast.dismiss(toastId);
          const t2 = toast.loading('Processing ticket allocation...', { style: { background: '#050505', color: '#D4AF37', border: '1px solid #D4AF3740' } });
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
              toast.success('AUTHORIZATION GRANTED.', { description: 'Ticket allocation successful.', style: { background: '#050505', color: '#00C076', border: '1px solid #00C07640' } });
              fetchStats();
            } else if (res.status === 409) {
              toast.info('Request obsolete: Wallet already owns an allocated ticket.');
              fetchStats();
            } else {
              toast.error(`Allocation failure: ${json.error || 'Server rejected context'}`);
            }
          } catch (e) {
            toast.dismiss(t2);
            toast.error('Server sync failed. Please review your connection.');
          } finally {
            setIsMinting(false);
          }
        },
        onError: (err: any) => {
          toast.dismiss(toastId);
          toast.error(`Verification aborted: ${err?.shortMessage || err?.message}`);
          setIsMinting(false);
        }
      }
    );
  }, [isConnected, signatureData, isMinting, isSigning, address, signMessage, openConnectModal, fetchStats, isWagmiConnected]);

  const hasTicket = dbStats?.ticket || false;

  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-6 overflow-hidden bg-[#FAF9F6] text-[#050505] p-0 md:p-6 lg:p-8">
      
      {/* ── FORMAL HERO HEADER ── */}
      <div className="flex flex-col gap-2 shrink-0 z-10 px-4 md:px-0 mt-2">
         <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.1em] text-[#050505] flex items-center gap-3">
             <Trophy className="text-[#D4AF37]" size={28} />
             TICKET MINT
         </h1>
         <p className="text-[11px] text-[#A0A0A0] max-w-3xl font-black tracking-[0.05em] leading-relaxed">
             Institutional clearance portal. Provides strict cryptographic allocation and access verification for eligible network entities.
         </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 shrink-0 px-4 md:px-0">
          {/* OVERVIEW COMPONENT */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl flex flex-col justify-center p-6 lg:p-10 relative overflow-hidden group shadow-sm">
               {/* Minimal Academic Lines */}
               <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#050505]/5 to-transparent" />
               <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#050505]/5 to-transparent" />
               
               <div className="w-full mb-8">
                  <AllocationTelemetryBar minted={dbStats?.totalClaimed || 0} max={MAX_SUPPLY} />
               </div>
               
               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="border-t border-[#E5E5E5] pt-4 flex flex-col gap-1">
                     <span className="text-[10px] text-[#A0A0A0] uppercase tracking-[0.1em] font-black">Smart Contract</span>
                     <span className="text-[11px] font-mono font-black text-[#050505]">0x7883...7b4a</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-4 flex flex-col gap-1">
                     <span className="text-[10px] text-[#A0A0A0] uppercase tracking-[0.1em] font-black">Network Status</span>
                     <span className="text-[11px] font-mono font-black text-[#050505] flex items-center gap-2"> <span className="w-1.5 h-1.5 bg-[#00C076] rounded-full shadow-[0_0_8px_#00c076]"></span> ACTIVE</span>
                  </div>
               </div>
          </div>

          {/* ACTION/CLEARANCE COMPONENT */}
          {!hasTicket ? (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 lg:p-8 flex flex-col relative overflow-hidden group shadow-sm">
                <div className="flex-1 mt-2">
                    <AuthorizationSignaturePad 
                      onSignature={setSignatureData} 
                      disabled={hasTicket}
                      onMint={handleMint}
                      mintLabel={
                        isMinting || isSigning ? 'PROCESSING...' :
                        !isConnected || !isWagmiConnected ? 'CONNECTION REQUIRED' : 'INITIATE REQUEST'
                      }
                    />
                 </div>
                 <p className="text-[9px] text-[#A0A0A0] uppercase tracking-widest text-center mt-3 pt-3 border-t border-[#E5E5E5] font-black">By signing, I formally authorize the minting process within the protocol.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 lg:p-8 grid grid-cols-2 gap-px bg-[#E5E5E5] overflow-hidden relative shadow-sm">
               <AcademicStatCard label="SERIAL IDENTIFIER" value={dbStats.ticket.serialCode} icon={Lock} isApex />
               <AcademicStatCard label="WALLET ADDRESS" value={truncAddr(address!)} icon={ScanFace} />
               <AcademicStatCard label="NETWORK LAYER" value="Optimism L2" icon={Network} />
               <AcademicStatCard label="AUTHORIZATION STATUS" value="MINTED" icon={ShieldCheck} />
            </div>
          )}
      </div>

      {/* ── MASSIVE LEDGER GRID ── */}
      <div className="flex-1 bg-white border border-[#E5E5E5] overflow-hidden flex flex-col relative mx-4 md:mx-0 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[400px] mb-6">
         <VerifiedLedger feed={dbStats?.feed || []} />
      </div>

    </div>
  );
}
