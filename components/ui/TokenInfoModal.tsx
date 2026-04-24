"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight, ExternalLink, TrendingUp, Layers, BarChart3, ShieldCheck } from 'lucide-react';

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
  // For new-pairs tokens
  priceChange?: { m5: number; h1: number; h6: number; h24: number };
  liquidity?: number;
  mcap?: number;
  fdv?: number;
  dex?: string;
  pairCreatedAt?: number;
}

interface TokenInfoModalProps {
  token: TokenInfoPayload | null;
  currency: 'USD' | 'EUR';
  eurRate: number;
  onClose: () => void;
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmtPrice(n: number, currency: 'USD' | 'EUR', rate: number): string {
  const v = n * (currency === 'EUR' ? rate : 1);
  const sym = currency === 'EUR' ? '€' : '$';
  if (!v || isNaN(v)) return `${sym}—`;
  if (v >= 1000) return `${sym}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (v >= 1)    return `${sym}${v.toFixed(4)}`;
  if (v >= 0.01) return `${sym}${v.toFixed(6)}`;
  return `${sym}${v.toFixed(8)}`;
}

function fmtLarge(n: number, currency: 'USD' | 'EUR', rate: number): string {
  const v = n * (currency === 'EUR' ? rate : 1);
  const sym = currency === 'EUR' ? '€' : '$';
  if (!v || isNaN(v)) return `${sym}—`;
  if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${sym}${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${sym}${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3)  return `${sym}${(v / 1e3).toFixed(1)}K`;
  return `${sym}${v.toFixed(2)}`;
}

function pctColor(v: number): string {
  return v >= 0 ? '#00C076' : '#FF3B30';
}

function pctFmt(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

// ── Stat cell ──────────────────────────────────────────────────────────────────
function StatCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 border border-[#E8E8E8] bg-[#FAFAFA] rounded">
      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#888]">{label}</span>
      <span className="text-[13px] font-black font-mono" style={{ color: valueColor || '#050505' }}>{value}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function TokenInfoModal({ token, currency, eurRate, onClose }: TokenInfoModalProps) {
  if (!token) return null;

  const isUp = token.pct >= 0;
  const explorerBase: Record<string, string> = {
    ethereum: 'https://etherscan.io/token',
    bsc:      'https://bscscan.com/token',
    polygon:  'https://polygonscan.com/token',
    arbitrum: 'https://arbiscan.io/token',
    avalanche:'https://snowscan.xyz/token',
    solana:   'https://solscan.io',
    bitcoin:  'https://mempool.space',
  };
  const explorerUrl = explorerBase[token.network] || 'https://etherscan.io';

  return (
    <AnimatePresence>
      <motion.div
        key="token-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="token-panel"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md relative"
          style={{
            background: '#FAF9F6',
            border: '1.5px solid #0A0A0A',
            borderRadius: 0,
            boxShadow: '4px 4px 0px #0A0A0A',
            color: '#0A0A0A',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0"
                style={{ background: token.netColor }}
              >
                {token.symbol[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-black tracking-tight">{token.symbol}</span>
                  <span
                    className="text-[8px] px-1.5 py-0.5 font-black uppercase border rounded-sm"
                    style={{ color: token.netColor, borderColor: token.netColor + '55', background: token.netColor + '11' }}
                  >
                    {token.network}
                  </span>
                  {token.getblockVerified && (
                    <span className="flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 font-black uppercase rounded-sm bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30">
                      <ShieldCheck size={9} /> ON-CHAIN
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#888] font-medium">{token.name}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] hover:border-[#0A0A0A] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Price hero ── */}
          <div className="px-6 py-5 border-b border-[#E0E0E0]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888] mb-1">Current Price</p>
                <p className="text-[28px] font-black font-mono leading-none">
                  {fmtPrice(token.price, currency, eurRate)}
                </p>
                {token.onChainPrice && token.onChainPrice > 0 && (
                  <p className="text-[9px] font-mono text-[#888] mt-1">
                    On-chain: {fmtPrice(token.onChainPrice, currency, eurRate)}
                  </p>
                )}
              </div>
              <div
                className="flex items-center gap-1 px-3 py-2 border"
                style={{ color: pctColor(token.pct), borderColor: pctColor(token.pct) + '33', background: pctColor(token.pct) + '0D' }}
              >
                {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span className="text-[13px] font-black font-mono">{pctFmt(token.pct)}</span>
                <span className="text-[8px] uppercase tracking-widest font-black opacity-60 ml-0.5">24H</span>
              </div>
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="px-6 py-4 border-b border-[#E0E0E0]">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] mb-3">Market Telemetry</p>
            <div className="grid grid-cols-2 gap-2">
              <StatCell label="24H Volume" value={fmtLarge(token.volume, currency, eurRate)} />
              {token.mcap && token.mcap > 0
                ? <StatCell label="Market Cap" value={fmtLarge(token.mcap, currency, eurRate)} />
                : <StatCell label="Network" value={token.network.toUpperCase()} />
              }
              {token.liquidity && token.liquidity > 0
                ? <StatCell label="Liquidity" value={fmtLarge(token.liquidity, currency, eurRate)} />
                : <StatCell label="Type" value={token.dex ? 'DEX PAIR' : 'PERP'} />
              }
              {token.fdv && token.fdv > 0
                ? <StatCell label="FDV" value={fmtLarge(token.fdv, currency, eurRate)} />
                : <StatCell label="Change Direction" value={isUp ? '▲ BULLISH' : '▼ BEARISH'} valueColor={pctColor(token.pct)} />
              }
            </div>
          </div>

          {/* ── Price Changes (if available from new-pairs data) ── */}
          {token.priceChange && (
            <div className="px-6 py-4 border-b border-[#E0E0E0]">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] mb-3">
                <TrendingUp size={9} className="inline mr-1" /> Price Change Timeline
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '5M',  val: token.priceChange.m5 },
                  { label: '1H',  val: token.priceChange.h1 },
                  { label: '6H',  val: token.priceChange.h6 },
                  { label: '24H', val: token.priceChange.h24 },
                ].map(({ label, val }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-2 border border-[#E8E8E8] rounded">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[#888]">{label}</span>
                    <span className="text-[11px] font-black font-mono" style={{ color: pctColor(val) }}>
                      {pctFmt(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEX info ── */}
          {token.dex && (
            <div className="px-6 py-3 border-b border-[#E0E0E0] flex items-center gap-2">
              <Layers size={11} className="text-[#888]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#888]">Exchange:</span>
              <span className="text-[10px] font-black">{token.dex}</span>
              {token.pairCreatedAt && (
                <>
                  <span className="text-[#E0E0E0] mx-1">|</span>
                  <BarChart3 size={11} className="text-[#888]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#888]">Listed:</span>
                  <span className="text-[10px] font-black">
                    {new Date(token.pairCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          )}

          {/* ── Footer: Explorer Link ── */}
          <div className="px-6 py-4 flex items-center justify-between">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#888] hover:text-[#0A0A0A] transition-colors"
            >
              <ExternalLink size={11} />
              View on Explorer
            </a>
            <span className="text-[8px] font-mono text-[#888] uppercase tracking-widest">
              Live · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
