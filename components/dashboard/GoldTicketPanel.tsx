"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useAccount, useConnect, useWriteContract,
  useWaitForTransactionReceipt, useReadContract, useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import {
  Zap, Users, Lock, ExternalLink,
  Clock, CheckCircle2, Flame, PenTool
} from 'lucide-react';

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
    <div className="w-full space-y-3">
      {/* Numbers */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-4xl font-black font-mono text-[#050505] tracking-tighter leading-none">
            {minted}
          </span>
          <span className="text-lg font-black font-mono text-[#888888] ml-1">/ {max}</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Remaining</p>
          <p
            className="text-2xl font-black font-mono tracking-tighter"
            style={{ color: urgencyColor }}
          >
            {remaining}
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${urgencyColor}99, ${urgencyColor})` }}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-y-0 w-12 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
          animate={{ left: [`${fill - 5}%`, `${fill + 2}%`, `${fill - 5}%`] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
        <span style={{ color: urgencyColor }} className="font-black">{fill}% CLAIMED</span>
        {isAlmostFull && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center gap-1 text-[#FF9500] font-black"
          >
            <Flame size={10} /> ALMOST FULL
          </motion.span>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 px-5 py-4 rounded-2xl border ${accent ? 'bg-[#D4AF37]/5 border-[#D4AF37]/25' : 'bg-white border-[#E5E5E5]'}`}>
      <p className="text-[8px] font-black text-[#888888] uppercase tracking-[0.22em]">{label}</p>
      <p className={`text-sm font-black font-mono tracking-tight ${accent ? 'text-[#B8962E]' : 'text-[#050505]'}`}>{value}</p>
    </div>
  );
}

function SignaturePad({ onSignature, disabled }: { onSignature: (d: string) => void; disabled: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
      };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
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
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const stop = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (hasDrawn && canvasRef.current) {
        onSignature(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignature("");
  };

  return (
    <div className="flex flex-col gap-2 mt-4 select-none">
        <label className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Authorization Signature</label>
        <div className="relative w-full h-[90px] border border-[#E5E5E5] rounded bg-white overflow-hidden">
             <canvas 
                ref={canvasRef}
                width={300} 
                height={90} 
                className="w-full h-full cursor-crosshair touch-none"
                onPointerDown={start}
                onPointerMove={draw}
                onPointerUp={stop}
                onPointerLeave={stop}
             />
             {!hasDrawn && !disabled && (
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] text-[#DDDDDD] uppercase font-mono tracking-widest">
                    Sign inside box
                 </div>
             )}
             {hasDrawn && !disabled && (
                 <button onClick={clear} className="absolute top-2 right-2 text-[8px] uppercase tracking-widest bg-[#F5F5F5] px-2 py-1 flex items-center gap-1 rounded text-[#888888] hover:text-[#050505] transition-colors">
                    Clear
                 </button>
             )}
        </div>
    </div>
  )
}

function LivePulse() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <span className="text-[10px] uppercase font-black tracking-widest text-[#00C076]">LIVE</span>
    </div>
  );
}

// ── MAIN PANEL ────────────────────────────────────────────────────────────────
export function GoldTicketPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { connect }      = useConnect();
  const [dbStats, setDbStats] = useState<{ totalClaimed: number; remaining: number; ticket?: any; feed?: any[] } | null>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => setIsMounted(true), []);

  const hasValidSignature = signatureData.length > 50;

  const fetchDbStats = useCallback(async () => {
    try {
      const q = address ? `?address=${address}` : '';
      const res = await fetch(`/api/golden-ticket/claim${q}`);
      if (res.ok) {
        const json = await res.json();
        setDbStats({ totalClaimed: json.totalClaimed, remaining: json.remaining, ticket: json.ticket, feed: json.feed });
      }
    } catch { /* silent */ }
  }, [address]);

  useEffect(() => {
    fetchDbStats();
    const id = setInterval(fetchDbStats, 3000); // hyper-realtime
    return () => clearInterval(id);
  }, [fetchDbStats]);

  // ── On-chain reads ───────────────────────────────────────────────────────────
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'balanceOf',
    args: address ? [address, 1n] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { data: supplyData } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'totalSupply',
    args: [1n],
    query: { refetchInterval: 10_000 },
  });

  const { data: maxSupplyData } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'maxSupply',
    args: [1n],
    query: { refetchInterval: 30_000 },
  });

  const { data: mintPriceData } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'mintPrice',
    query: { staleTime: 60_000 },
  });

  const hasTicket   = Boolean(balanceData && BigInt(balanceData as any) > 0n);
  const chainMinted = supplyData    ? Number(supplyData)    : null;
  const chainMax    = maxSupplyData ? Number(maxSupplyData) : null;
  const mintPrice: bigint = mintPriceData ? BigInt(mintPriceData as any) : 0n;

  // Prefer on-chain supply; fall back to DB counter
  const displayMinted   = chainMinted   ?? dbStats?.totalClaimed ?? 0;
  const displayMax      = chainMax      ?? MAX_SUPPLY;
  const displayRemain   = displayMax - displayMinted;
  const isWrongNetwork  = isConnected && chainId !== OPTIMISM_CHAIN_ID;

  // ── On-chain write ───────────────────────────────────────────────────────────
  const {
    writeContract, data: txHash,
    isPending: isTxPending, isError: isTxError, error: txError, reset: resetTx,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed && address) {
      const execClaim = async () => {
          try {
            const tid = toast.loading('Securing geographic telemetry...');
            let geoRes: any = {};
            try {
              const geoReq = await fetch('https://ipapi.co/json/');
              geoRes = await geoReq.json();
            } catch (e) {
              console.warn('Geolocation failed', e);
            }

            const telepack = {
              signature: signatureData,
              ip: geoRes.ip || '0.0.0.0',
              country: geoRes.country_name || 'Classified',
              planet: 'Earth / E.A.R.T.H',
              timestamp: new Date().toISOString()
            };

            await fetch('/api/golden-ticket/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, signatureData: JSON.stringify(telepack) })
            });
            toast.success('Access Granted ✓', { id: tid });
            refetchBalance();
            fetchDbStats();
          } catch (e) {}
      };
      execClaim();
    }
  }, [isConfirmed, address, signatureData, refetchBalance, fetchDbStats]);

  useEffect(() => {
    if (isTxError && txError) {
      const msg = (txError as any)?.shortMessage ?? txError?.message ?? 'Rejected';
      toast.error(msg.slice(0, 90));
      resetTx();
    }
  }, [isTxError, txError, resetTx]);

  const handleConnect = () => connect({ connector: injected() });

  const handleMint = () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return; }
    if (isWrongNetwork && switchChain) { switchChain({ chainId: OPTIMISM_CHAIN_ID }); return; }
    if (hasTicket) { toast.info('This wallet already holds a Whale Gold Ticket.'); return; }
    try {
      writeContract({
        address: CONTRACT,
        abi: ABI,
        functionName: 'mint',
        args: [],
        ...(mintPrice > 0n ? { value: mintPrice } : {})
      });
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to build transaction');
    }
  };

  // ── PRE-HYDRATION FALLBACK ───────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="w-full flex justify-center items-center py-20 min-h-[400px]">
         <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── ALREADY HOLDS TICKET ─────────────────────────────────────────────────────
  if (hasTicket || isConfirmed) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 py-8">
        {/* Verified Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-[#D4AF37]/8 border border-[#D4AF37]/25 rounded-2xl px-8 py-5"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-[#D4AF37]" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">Identity Verified On-Chain</p>
              <p className="text-[9px] font-mono text-[#888888] mt-0.5">
                {address ? truncAddr(address) : 'Connected'} · Optimism
              </p>
            </div>
          </div>
          <a
            href={`https://optimistic.etherscan.io/address/${CONTRACT}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#888888] hover:text-[#050505] transition-colors"
          >
            View Contract <ExternalLink size={11} />
          </a>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatChip label="Serial Designation" value={dbStats?.ticket?.serialCode || "GENESIS-0000"} accent />
          <StatChip label="Sequence Index" value={`#${dbStats?.ticket?.ticketNumber || '...'}`} />
          <StatChip label="Timestamp" value={dbStats?.ticket?.claimedAt ? new Date(dbStats.ticket.claimedAt).toLocaleDateString() : "Live"} />
          <StatChip label="Settlement Layer" value="Optimism" />
        </div>

        {dbStats?.ticket?.signatureData && (
          <div className="w-full flex flex-col md:flex-row gap-6 p-8 border border-[#E5E5E5] bg-[#FAF9F6] rounded-2xl">
            {(() => {
              let parsed: any = null;
              try { 
                const raw = JSON.parse(dbStats.ticket.signatureData);
                // JSON.parse('null') returns null — guard explicitly
                if (raw && typeof raw === 'object') parsed = raw;
              } catch(e) { /* not json */ }
              // Fallback: treat the whole string as a raw PNG dataURL
              if (!parsed) {
                parsed = { signature: dbStats.ticket.signatureData, planet: 'E.A.R.T.H', country: 'Classified', ip: '0.0.0.0' };
              }
              const finalSig = parsed.signature || dbStats.ticket.signatureData;

              return (
                <>
                  <div className="flex-1 space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#888888] pb-2 border-b border-[#E5E5E5]">Sovereign Telemetry Log</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><p className="text-[8px] text-[#888888] font-black uppercase tracking-widest">Planetary Node</p><p className="text-[11px] font-mono font-black text-[#050505]">{parsed.planet}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-[#888888] font-black uppercase tracking-widest">Geolocation</p><p className="text-[11px] font-mono font-black text-[#050505]">{parsed.country}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-[#888888] font-black uppercase tracking-widest">IP Address</p><p className="text-[11px] font-mono font-black text-[#050505]">{parsed.ip}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-[#888888] font-black uppercase tracking-widest">Secured Address</p><p className="text-[11px] font-mono font-black text-[#050505]">{address ? truncAddr(address) : '...'}</p></div>
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border border-[#E5E5E5] bg-white rounded-xl shadow-inner">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888888] mb-4">Cryptographic Signature</span>
                      <img src={finalSig} className="max-w-[200px] h-auto opacity-80 mix-blend-multiply pointer-events-none" alt="Signature" />
                      <div className="w-32 border-b border-[#050505]/20 mt-2" />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Supply Bar */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#888888]">Genesis Collection · Mint Progress</p>
            <LivePulse />
          </div>
          <SupplyBar minted={displayMinted} max={displayMax} />
        </div>

        {/* Contract Info */}
        <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Smart Contract · Optimism Mainnet</p>
            <p className="text-[11px] font-mono text-[#050505] mt-1">{CONTRACT}</p>
          </div>
          <a
            href={`https://optimistic.etherscan.io/address/${CONTRACT}#readContract`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#050505] hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            Read Contract <ExternalLink size={12} />
          </a>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-[#050505] text-white rounded text-[#050505] text-xs font-black uppercase tracking-[0.25em] hover:bg-black/90 transition-all active:scale-[0.98]"
        >
          Initialize Terminal
        </button>
      </div>
    );
  }

  // ── MINTING IN PROGRESS ──────────────────────────────────────────────────────
  if (isTxPending || isConfirming) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute -inset-2 rounded-full border-2 border-dashed border-[#D4AF37]/20"
          />
          <div className="w-20 h-20 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#050505]">
            {isTxPending ? 'Confirm in Wallet' : 'Broadcasting to Optimism…'}
          </h3>
          <p className="text-[11px] text-[#888888]">
            {isTxPending
              ? 'Approve the transaction in your wallet. Do not close this tab.'
              : 'Transaction submitted. Awaiting L2 block confirmation.'}
          </p>
          {txHash && (
            <a
              href={`https://optimistic.etherscan.io/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#D4AF37] hover:underline mt-2"
            >
              {truncAddr(String(txHash))} <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN LANDING ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-8 max-w-5xl mx-auto py-8">

      {/* ── Hero ── */}
      <div className="relative bg-[#050505] rounded-[2.5rem] overflow-hidden p-10 md:p-14 shadow-2xl">
        {/* Ambient gold */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 65%)' }} />

        {/* Live badge spacing placeholder */}
        <div className="flex justify-end mb-8">
          <a
            href={`https://optimistic.etherscan.io/address/${CONTRACT}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-mono text-white/20 hover:text-white/50 transition-colors"
          >
            {CONTRACT.slice(0, 10)}…{CONTRACT.slice(-8)} <ExternalLink size={9} />
          </a>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: info */}
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">
              Golden Access
            </h1>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              A permanent, non-transferable cryptographic identity on Optimism.
              Strictly limited to one per address. Global supply constrained to <span className="text-[#D4AF37] font-bold">200 units</span>.
            </p>

            {mintPrice > 0n && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
                <Zap size={12} className="text-[#D4AF37]" />
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                  Mint Price: {fmtEth(mintPrice)} ETH
                </span>
              </div>
            )}
          </div>

          {/* Right: live supply counter */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-8 space-y-6">

            {/* Counter */}
            <div className="text-center space-y-1">
              <motion.p
                key={displayMinted}
                initial={{ opacity: 0.4, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl font-black font-mono text-[#D4AF37] tracking-tighter leading-none"
              >
                {displayMinted}
              </motion.p>
              <p className="text-[11px] font-mono text-white/30">of {displayMax} minted</p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #D4AF3799, #D4AF37)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(displayMinted, displayMax)}%` }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-white/20">
                <span>0</span>
                <span className="text-[#D4AF37]/50 font-black">{pct(displayMinted, displayMax)}% CLAIMED</span>
                <span>{displayMax}</span>
              </div>
            </div>

            {/* Remaining slots urgency */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
              <Clock size={11} className="text-white/20" />
              <span className="text-[9px] font-mono text-white/30">
                <span className="text-white/70 font-black">{displayRemain}</span> slots remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Traits & Properties ── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* What you get */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#888888] mb-6">What This Ticket Grants</p>
          <ul className="space-y-5">
            {[
              {
                n: '01',
                title: 'Permanent On-Chain Access',
                desc: 'Your membership is permanently encoded in the Optimism L2 blockchain. Unlike traditional subscriptions, this access never expires, cannot be revoked, and requires no renewal fees — ever.',
                tag: 'Non-Expiring',
              },
              {
                n: '02',
                title: 'Whale Intelligence Suite',
                desc: 'Unlock real-time tracking of on-chain whale movements across BTC, ETH, BASE, and BSC. Includes institutional alpha signals, large-cap flow data, and cross-chain activity feeds.',
                tag: 'Full Access',
              },
              {
                n: '03',
                title: 'Genesis Badge',
                desc: 'Holders of this Genesis ticket carry a verifiable on-chain identity that distinguishes them from all future membership tiers. Genesis status is immutable once minted.',
                tag: 'Exclusive',
              },
              {
                n: '04',
                title: 'One Ticket Per Wallet',
                desc: 'The smart contract enforces a strict one-ticket-per-address rule. This NFT is soulbound to your wallet — it cannot be transferred, resold, or duplicated, making your genesis identity unique.',
                tag: 'Soulbound',
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 pb-5 border-b border-[#F5F5F5] last:border-0 last:pb-0">
                <span className="text-[9px] font-black font-mono text-[#CCCCCC] mt-0.5 shrink-0 w-5">{item.n}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] font-black text-[#050505] uppercase tracking-wide">{item.title}</p>
                    <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#B8962E] border border-[#D4AF37]/20 shrink-0">{item.tag}</span>
                  </div>
                  <p className="text-[10px] text-[#888888] leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* NFT properties + live supply bar */}
        <div className="space-y-4">
          {/* Live supply bar card */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#888888]">Mint Progress · Live</p>
              <LivePulse />
            </div>
            <SupplyBar minted={displayMinted} max={displayMax} />
          </div>

          {/* Token Properties */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#888888] mb-4">NFT Properties</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'Standard', v: 'ERC-1155' },
                { k: 'Network', v: 'Optimism L2' },
                { k: 'Collection', v: 'Genesis' },
                { k: 'Max Supply', v: String(displayMax) },
                { k: 'Transferable', v: 'No' },
                { k: 'Burnable', v: 'No' },
              ].map(({ k, v }) => (
                <div key={k} className="bg-[#FAF9F6] rounded-xl px-3 py-2.5 border border-[#F0F0F0]">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#888888]">{k}</p>
                  <p className="text-[11px] font-black text-[#050505] mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Claim Steps ── */}
      <div className="grid md:grid-cols-3 gap-5">
        {[
          {
            n: '01', title: 'Connect Wallet',
            desc: 'Connect via MetaMask, Rabby, or any injected Web3 wallet on Optimism.',
            status: isConnected && !isWrongNetwork ? 'DONE' : isConnected && isWrongNetwork ? 'SWITCH' : 'PENDING',
            action: !isConnected
              ? <button onClick={handleConnect} className="mt-4 w-full py-3 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1a1a] transition-all">Connect Wallet</button>
              : isWrongNetwork
              ? <button onClick={() => switchChain?.({ chainId: OPTIMISM_CHAIN_ID })} className="mt-4 w-full py-3 bg-[#FF9500] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">Switch to Optimism</button>
              : null,
          },
          {
            n: '02', title: 'Mint Your Ticket',
            desc: mintPrice > 0n
              ? `Pay ${fmtEth(mintPrice)} ETH on Optimism L2 to mint your soulbound NFT.`
              : 'Mint your Whale Gold Ticket NFT. Pay gas only on Optimism L2.',
            status: hasTicket ? 'DONE' : isConnected && !isWrongNetwork ? 'READY' : 'WAITING',
            action: isConnected && !isWrongNetwork && !hasTicket
              ? (
                 <div className="mt-4 w-full">
                     <SignaturePad onSignature={setSignatureData} disabled={isTxPending || isConfirming} />
                     <button 
                         onClick={handleMint} 
                         disabled={!hasValidSignature || isTxPending || isConfirming}
                         className={`mt-4 w-full py-3 font-black uppercase tracking-widest text-[10px] text-[#050505] rounded shadow-sm transition-all focus:outline-none ${!hasValidSignature || isTxPending ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100 hover:opacity-90 shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98]'}`}
                         style={{ background: 'linear-gradient(135deg, #D4AF37, #C5A017)' }}
                     >
                         {mintPrice > 0n ? `Mint Access · ${fmtEth(mintPrice)} ETH` : 'Initialize Minting Sequence'}
                     </button>
                 </div>
              )
              : null,
          },
          {
            n: '03', title: 'Access Activated',
            desc: 'Your ticket is verified on-chain. Instant access to all Whale Alert Network institutional tools.',
            status: hasTicket ? 'DONE' : 'LOCKED',
            action: null,
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`p-7 rounded-3xl border transition-all ${s.status === 'DONE' ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : s.status === 'READY' ? 'bg-white border-[#050505] shadow-lg shadow-black/5' : 'bg-white border-[#E5E5E5]'}`}
          >
            <div className="flex items-center justify-between mb-5">
              <span className={`text-[11px] font-black font-mono ${s.status === 'DONE' ? 'text-[#D4AF37]' : s.status === 'READY' ? 'text-[#050505]' : 'text-[#CCCCCC]'}`}>{s.n}</span>
              <span className={`text-[8px] px-2 py-0.5 rounded border font-black uppercase tracking-widest ${
                s.status === 'DONE' ? 'bg-[#D4AF37] text-white border-transparent' :
                s.status === 'READY' ? 'bg-[#050505] text-white border-transparent' :
                s.status === 'SWITCH' ? 'bg-[#FF9500] text-white border-transparent' :
                'bg-[#FAF9F6] text-[#888888] border-[#E5E5E5]'
              }`}>
                {s.status}
              </span>
            </div>
            <h3 className="text-base font-black text-[#050505] uppercase tracking-tight mb-2">{s.title}</h3>
            <p className="text-[11px] text-[#888888] leading-relaxed">{s.desc}</p>
            {s.action}
          </div>
        ))}
      </div>

      {/* ── Contract footer ── */}
      <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Verified Smart Contract · Optimism Mainnet</p>
          <p className="text-[10px] font-mono text-[#050505]">{CONTRACT}</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`https://optimistic.etherscan.io/address/${CONTRACT}#readContract`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#888888] hover:text-[#050505] transition-colors"
          >
            Read Contract <ExternalLink size={10} />
          </a>
          <a
            href={`https://optimistic.etherscan.io/address/${CONTRACT}#writeContract`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#888888] hover:text-[#050505] transition-colors"
          >
            Write Contract <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* ── Global Mint Ledger ── */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden mt-8 shadow-sm">
         <div className="px-8 py-6 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">Global Genesis Ledger</span>
             <LivePulse />
         </div>
         <div className="grid text-[9px] font-black text-[#888888] uppercase tracking-[0.2em] bg-white border-b border-[#F0F0F0]"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
              <div className="px-8 py-4">Secured Address</div>
              <div className="px-8 py-4">Timestamp</div>
              <div className="px-8 py-4 text-right">Signature</div>
         </div>
         <div className="divide-y divide-[#F0F0F0]">
            {!dbStats?.feed?.length && (
                <div className="p-8 text-center text-[10px] font-mono text-[#888888]">Awaiting Genesis Mints...</div>
            )}
            {dbStats?.feed?.map((f: any, i: number) => {
                if (!f) return null;
                let parsed: any = null;
                try {
                   const raw = JSON.parse(f.signatureData);
                   // JSON.parse('null') returns null — guard explicitly
                   if (raw && typeof raw === 'object') parsed = raw;
                } catch(e) { /* not json, treat as raw dataurl */ }
                if (!parsed) parsed = { signature: f.signatureData ?? '' };
                const displaySig: string = parsed.signature || f.signatureData || '';

                return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid items-center hover:bg-[#FAF9F6] transition-colors" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
                        <div className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-[#00C076]" />
                                <span className="text-[11px] font-mono font-bold text-[#050505]">{truncAddr(f.userAddress || '')}</span>
                             </div>
                        </div>
                        <div className="px-8 py-5 text-[10px] font-mono text-[#888888]">
                             {f.claimedAt ? new Date(f.claimedAt).toLocaleString() : '—'}
                        </div>
                        <div className="px-8 py-2 flex justify-end">
                             {displaySig ? (
                                <img src={displaySig} className="h-8 max-w-[100px] object-contain opacity-80 mix-blend-multiply pointer-events-none" alt="Signature" />
                             ) : (
                                <span className="text-[9px] uppercase font-black text-[#888888]">No Sig</span>
                             )}
                        </div>
                    </motion.div>
                );
            })}
         </div>
      </div>
    </div>
  );
}
