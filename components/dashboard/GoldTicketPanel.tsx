"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useAccount, useConnect, useSendTransaction,
  useWaitForTransactionReceipt, useReadContract, useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { encodeFunctionData } from 'viem';
import {
  ShieldCheck, Zap, Users, Lock, ExternalLink,
  Clock, Star, CheckCircle2, Flame,
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

function LivePulse() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2 h-2 rounded-full bg-[#00C076]"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <span className="text-[9px] font-black uppercase tracking-widest text-[#00C076]">Live On-Chain</span>
    </div>
  );
}

// ── MAIN PANEL ────────────────────────────────────────────────────────────────
export function GoldTicketPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { connect }      = useConnect();
  const { switchChain }  = useSwitchChain();

  // ── DB-level counter (polling every 8s) ─────────────────────────────────────
  const [dbStats, setDbStats] = useState<{ totalClaimed: number; remaining: number; ticket?: any } | null>(null);
  const fetchDbStats = useCallback(async () => {
    try {
      const q = address ? `?address=${address}` : '';
      const res = await fetch(`/api/golden-ticket/claim${q}`);
      if (res.ok) {
        const json = await res.json();
        setDbStats({ totalClaimed: json.totalClaimed, remaining: json.remaining, ticket: json.ticket });
      }
    } catch { /* silent — on-chain fallback shown */ }
  }, [address]);

  useEffect(() => {
    fetchDbStats();
    const id = setInterval(fetchDbStats, 8000);
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
    sendTransaction, data: txHash,
    isPending: isTxPending, isError: isTxError, error: txError, reset: resetTx,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Whale Gold Ticket minted ✓');
      refetchBalance();
      fetchDbStats();
    }
  }, [isConfirmed, refetchBalance, fetchDbStats]);

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
      sendTransaction({
        to: CONTRACT,
        data: encodeFunctionData({ abi: ABI, functionName: 'mint', args: [] }),
        value: mintPrice > 0n ? mintPrice : 0n,
      });
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to build transaction');
    }
  };

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
              <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">Whale Gold Ticket · Verified On-Chain</p>
              <p className="text-[9px] font-mono text-[#888888] mt-0.5">
                {address ? truncAddr(address) : 'Connected'} · Optimism L2
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
          <StatChip label="Serial Code" value={dbStats?.ticket?.serialCode || "GENESIS-0000"} accent />
          <StatChip label="Mint Sequence" value={`#${dbStats?.ticket?.ticketNumber || '...'}`} />
          <StatChip label="Verification Date" value={dbStats?.ticket?.claimedAt ? new Date(dbStats.ticket.claimedAt).toLocaleDateString() : "Live"} />
          <StatChip label="Network Layer" value="Optimism L2" />
        </div>

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
          className="w-full py-4 bg-[#050505] text-white rounded-xl text-xs font-black uppercase tracking-[0.25em] hover:bg-[#1a1a1a] transition-all active:scale-[0.98]"
        >
          Return to Dashboard
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

        {/* Live badge */}
        <div className="flex items-center justify-between mb-8">
          <LivePulse />
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
              Whale<br />Gold Ticket
            </h1>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              A permanent, non-transferable membership NFT on Optimism L2.
              Each address may hold <span className="text-white/80 font-bold">exactly one</span> Whale Gold Ticket.
              Genesis collection limited to <span className="text-[#D4AF37] font-bold">200 units</span> total.
            </p>

            {mintPrice > 0n ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
                <Zap size={12} className="text-[#D4AF37]" />
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                  Mint Price: {fmtEth(mintPrice)} ETH
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00C076]/30 bg-[#00C076]/5">
                <Zap size={12} className="text-[#00C076]" />
                <span className="text-[10px] font-black text-[#00C076] uppercase tracking-widest">
                  Free Mint · Pay Gas Only
                </span>
              </div>
            )}
          </div>

          {/* Right: live supply counter */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-white/30" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                Genesis Supply · Real-Time
              </span>
            </div>

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
          <ul className="space-y-4">
            {[
              { icon: <ShieldCheck size={14} />, title: 'Permanent On-Chain Access', desc: 'Your membership is encoded in the Optimism L2 blockchain. No subscription, no renewal.' },
              { icon: <Zap size={14} />, title: 'Whale Intelligence Suite', desc: 'Full access to real-time whale movement tracking, alpha signals, and institutional data feeds.' },
              { icon: <Star size={14} />, title: 'Genesis Badge', desc: 'Exclusive Genesis holder status — distinguishes early members from future tiers.' },
              { icon: <Lock size={14} />, title: 'One Ticket Per Wallet', desc: 'Smart contract enforces strict 1-per-address. Non-transferable genesis identity.' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center shrink-0 text-[#D4AF37]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#050505] uppercase tracking-wide">{item.title}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5 leading-relaxed">{item.desc}</p>
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
              ? <button onClick={handleMint} className="mt-4 w-full py-3 font-black uppercase tracking-widest text-[10px] text-[#050505] rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20 hover:opacity-80" style={{ background: 'linear-gradient(135deg, #D4AF37, #a07d1a)' }}>
                  {mintPrice > 0n ? `Mint · ${fmtEth(mintPrice)} ETH` : 'Mint Now'}
                </button>
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
    </div>
  );
}
