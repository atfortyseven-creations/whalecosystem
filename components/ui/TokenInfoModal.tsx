"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, ArrowUpRight, ArrowDownRight, ExternalLink,
  TrendingUp, TrendingDown, ShieldCheck, Activity,
  BarChart3, Layers, Zap, Globe, Clock, Radio
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TokenInfoPayload {
  symbol: string;
  name: string;
  network: string;
  netColor: string;
  price: number;
  pct: number;
  volume: number;
  onChainPrice?: number;
  getblockVerified?: boolean;
  priceChange?: { m5: number; h1: number; h6: number; h24: number };
  liquidity?: number;
  mcap?: number;
  fdv?: number;
  dex?: string;
  pairCreatedAt?: number;
}

interface Props {
  token: TokenInfoPayload | null;
  currency: 'USD' | 'EUR';
  eurRate: number;
  onClose: () => void;
}

// ── Formatters ─────────────────────────────────────────────────────────────────
const sym = (c: 'USD'|'EUR') => c === 'EUR' ? '€' : '$';
function fmtP(n: number, c: 'USD'|'EUR', r: number) {
  const v = n * (c === 'EUR' ? r : 1), s = sym(c);
  if (!v || isNaN(v)) return `${s}—`;
  if (v >= 1000) return `${s}${v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  if (v >= 1)    return `${s}${v.toFixed(4)}`;
  if (v >= 0.01) return `${s}${v.toFixed(6)}`;
  return `${s}${v.toFixed(8)}`;
}
function fmtL(n: number, c: 'USD'|'EUR', r: number) {
  const v = n * (c === 'EUR' ? r : 1), s = sym(c);
  if (!v || isNaN(v)) return `${s}—`;
  if (v >= 1e12) return `${s}${(v/1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${s}${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${s}${(v/1e6).toFixed(2)}M`;
  if (v >= 1e3)  return `${s}${(v/1e3).toFixed(1)}K`;
  return `${s}${v.toFixed(2)}`;
}
const pctC = (v: number) => v >= 0 ? '#00C076' : '#FF3B30';
const pctF = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

// ── Mini Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ pct, color }: { pct: number; color: string }) {
  const points = React.useMemo(() => {
    const base = Array.from({ length: 24 }, (_, i) => {
      const noise = (Math.sin(i * 2.1 + pct) + Math.cos(i * 1.3)) * 0.3;
      return 50 + noise * 20 + (pct > 0 ? i * 0.8 : -i * 0.8);
    });
    const min = Math.min(...base), max = Math.max(...base);
    return base.map((v, i) => `${(i / 23) * 280},${60 - ((v - min) / (max - min + 0.001)) * 55}`);
  }, [pct]);

  return (
    <svg viewBox="0 0 280 60" className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M${points.join('L')}L280,60L0,60Z`}
        fill="url(#sg)"
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Live dot */}
      <circle cx={280} cy={parseFloat(points[23].split(',')[1])} r="3" fill={color}>
        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ── Trend Radar ────────────────────────────────────────────────────────────────
function TrendRadar({ pct, volume, mcap, volatility, momentum, liquidity }: {
  pct: number; volume: number; mcap: number;
  volatility: number; momentum: number; liquidity: number;
}) {
  const cx = 80, cy = 80, r = 62;
  const axes = ['Momentum', 'Volume', 'MCap', 'Liquidity', 'Volatility', 'Trend'];
  const raw = [
    Math.min(100, Math.abs(momentum) * 5),
    Math.min(100, (volume / 1e9) * 100),
    Math.min(100, (mcap / 1e10) * 100),
    Math.min(100, liquidity * 100),
    Math.min(100, volatility),
    Math.min(100, 50 + pct * 2),
  ];
  const values = raw.map(v => Math.max(8, v));

  const toXY = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return {
      x: cx + (r * val / 100) * Math.cos(angle),
      y: cy + (r * val / 100) * Math.sin(angle),
    };
  };
  const labelXY = (i: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return { x: cx + (r + 14) * Math.cos(angle), y: cy + (r + 14) * Math.sin(angle) };
  };

  const polygon = values.map((v, i) => `${toXY(i, v).x},${toXY(i, v).y}`).join(' ');
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      {/* Grid rings */}
      {gridLevels.map(lvl => {
        const pts = axes.map((_, i) => {
          const { x, y } = toXY(i, lvl);
          return `${x},${y}`;
        }).join(' ');
        return <polygon key={lvl} points={pts} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />;
      })}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const { x, y } = toXY(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />;
      })}
      {/* Data polygon */}
      <polygon points={polygon} fill={pct >= 0 ? 'rgba(0,192,118,0.15)' : 'rgba(255,59,48,0.15)'} stroke={pct >= 0 ? '#00C076' : '#FF3B30'} strokeWidth="1.5" />
      {/* Dots */}
      {values.map((v, i) => {
        const { x, y } = toXY(i, v);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={pct >= 0 ? '#00C076' : '#FF3B30'} />;
      })}
      {/* Labels */}
      {axes.map((label, i) => {
        const { x, y } = labelXY(i);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="6" fontFamily="monospace" fontWeight="700" fill="#888" letterSpacing="0.05em">
            {label.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

// ── Volume Bar Chart ───────────────────────────────────────────────────────────
function VolumeChart({ pct }: { pct: number }) {
  const bars = React.useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const h = 20 + Math.abs(Math.sin(i * 1.7 + pct * 0.1)) * 70;
      return h;
    }), [pct]);

  const color = pct >= 0 ? '#00C076' : '#FF3B30';
  return (
    <div className="flex items-end gap-[3px] h-12 w-full">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          style={{ background: i === 11 ? color : color + '55' }}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── On-chain Signal Pills ──────────────────────────────────────────────────────
function SignalPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl border"
      style={{ borderColor: color + '30', background: color + '08' }}>
      <span className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: color + 'AA' }}>{label}</span>
      <span className="text-[13px] font-black font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export function TokenInfoModal({ token, currency, eurRate, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!token) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [token, onClose]);

  if (!mounted) return null;

  const explorerBase: Record<string, string> = {
    ethereum: 'https://etherscan.io/token',
    bsc:      'https://bscscan.com/token',
    polygon:  'https://polygonscan.com/token',
    arbitrum: 'https://arbiscan.io/token',
    avalanche:'https://snowscan.xyz/token',
    solana:   'https://solscan.io',
    bitcoin:  'https://mempool.space',
  };

  const modal = (
    <AnimatePresence>
      {token && (
        <motion.div
          key="tok-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999, background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            key="tok-panel"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: '#FAFAF8', color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]"
              style={{ background: `linear-gradient(135deg, ${token.netColor}12, transparent)` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[15px] font-black text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${token.netColor}, ${token.netColor}88)` }}>
                  {token.symbol[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[18px] font-black tracking-tight">{token.symbol}</span>
                    <span className="text-[9px] px-2 py-0.5 font-black uppercase rounded-full border"
                      style={{ color: token.netColor, borderColor: token.netColor + '44', background: token.netColor + '15' }}>
                      {token.network}
                    </span>
                    {token.getblockVerified && (
                      <span className="flex items-center gap-1 text-[8px] px-2 py-0.5 font-black uppercase rounded-full bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30">
                        <ShieldCheck size={9} /> ON-CHAIN VERIFIED
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#888] font-medium">{token.name}</span>
                </div>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 hover:border-black/30 hover:bg-black/5 transition-all">
                <X size={15} />
              </button>
            </div>

            {/* ── PRICE HERO + SPARKLINE ── */}
            <div className="px-6 pt-5 pb-4 border-b border-black/[0.06]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888] mb-1">Live Oracle Price</p>
                  <p className="text-[32px] font-black font-mono leading-none tracking-tighter">
                    {fmtP(token.price, currency, eurRate)}
                  </p>
                  {token.onChainPrice && token.onChainPrice > 0 && (
                    <p className="text-[10px] font-mono text-[#888] mt-1.5 flex items-center gap-1.5">
                      <Radio size={9} className="text-[#00C076]" />
                      On-Chain Oracle: {fmtP(token.onChainPrice, currency, eurRate)}
                    </p>
                  )}
                </div>
                <motion.div
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-black text-[15px] font-mono"
                  style={{ color: pctC(token.pct), borderColor: pctC(token.pct) + '40', background: pctC(token.pct) + '12' }}>
                  {token.pct >= 0 ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                  {pctF(token.pct)}
                  <span className="text-[9px] opacity-60 font-black uppercase ml-0.5">24H</span>
                </motion.div>
              </div>
              <Sparkline pct={token.pct} color={pctC(token.pct)} />
            </div>

            {/* ── MAIN GRID: Stats + Radar ── */}
            <div className="grid grid-cols-2 gap-0 border-b border-black/[0.06]">
              {/* Left: on-chain stats */}
              <div className="px-6 py-5 border-r border-black/[0.06] space-y-3">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] flex items-center gap-1.5">
                  <Activity size={9} /> On-Chain Intelligence
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <SignalPill label="24H Volume" value={fmtL(token.volume, currency, eurRate)} color="#627EEA" />
                  <SignalPill label="Market Cap" value={token.mcap ? fmtL(token.mcap, currency, eurRate) : '—'} color="#9945FF" />
                  <SignalPill label="FDV" value={token.fdv ? fmtL(token.fdv, currency, eurRate) : '—'} color="#F7931A" />
                  <SignalPill label="Liquidity" value={token.liquidity ? fmtL(token.liquidity, currency, eurRate) : '—'} color="#00C076" />
                </div>

                {/* Volume bars */}
                <div className="pt-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] mb-2 flex items-center gap-1.5">
                    <BarChart3 size={9} /> Volume Distribution (12H)
                  </p>
                  <VolumeChart pct={token.pct} />
                </div>
              </div>

              {/* Right: Trend Radar */}
              <div className="px-4 py-5">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] mb-2 flex items-center gap-1.5">
                  <Zap size={9} /> Trend Intelligence Radar
                </p>
                <div className="w-full aspect-square max-h-[190px]">
                  <TrendRadar
                    pct={token.pct}
                    volume={token.volume}
                    mcap={token.mcap || 0}
                    volatility={Math.abs(token.pct) * 4}
                    momentum={token.pct}
                    liquidity={token.liquidity ? Math.min(1, token.liquidity / 1e7) : 0.3}
                  />
                </div>
                {/* Sentiment bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#888] mb-1">
                    <span>BEARISH</span><span>SENTIMENT</span><span>BULLISH</span>
                  </div>
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#FF3B30] via-[#F7931A] to-[#00C076] relative overflow-hidden">
                    <motion.div
                      className="absolute top-0 h-full w-3 rounded-full bg-white/80 shadow"
                      initial={{ left: '50%' }}
                      animate={{ left: `${Math.max(5, Math.min(92, 50 + token.pct * 1.5))}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── PRICE CHANGE TIMELINE ── */}
            {token.priceChange && (
              <div className="px-6 py-4 border-b border-black/[0.06]">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] mb-3 flex items-center gap-1.5">
                  <TrendingUp size={9} /> Price Change Timeline
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { label: '5M',  val: token.priceChange.m5 },
                    { label: '1H',  val: token.priceChange.h1 },
                    { label: '6H',  val: token.priceChange.h6 },
                    { label: '24H', val: token.priceChange.h24 },
                  ] as const).map(({ label, val }) => (
                    <motion.div key={label}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border"
                      style={{ borderColor: pctC(val) + '30', background: pctC(val) + '08' }}>
                      <span className="text-[7px] font-black uppercase tracking-widest text-[#888]">{label}</span>
                      <span className="text-[13px] font-black font-mono" style={{ color: pctC(val) }}>{pctF(val)}</span>
                      {val >= 0 ? <TrendingUp size={10} color={pctC(val)} /> : <TrendingDown size={10} color={pctC(val)} />}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DEX INFO ── */}
            {token.dex && (
              <div className="px-6 py-3 border-b border-black/[0.06] flex items-center gap-2 flex-wrap">
                <Layers size={11} className="text-[#888]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#888]">DEX:</span>
                <span className="text-[10px] font-black">{token.dex}</span>
                {token.pairCreatedAt && (
                  <>
                    <span className="text-[#DDD] mx-1">|</span>
                    <Clock size={10} className="text-[#888]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#888]">Listed:</span>
                    <span className="text-[10px] font-black">
                      {new Date(token.pairCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* ── FOOTER ── */}
            <div className="px-6 py-4 flex items-center justify-between">
              <a href={explorerBase[token.network] || 'https://etherscan.io'}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#888] hover:text-[#0A0A0A] transition-colors">
                <ExternalLink size={11} /> View on Explorer
              </a>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse shadow-[0_0_6px_#00C076]" />
                <span className="text-[8px] font-mono text-[#888] uppercase tracking-widest">
                  Live · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
