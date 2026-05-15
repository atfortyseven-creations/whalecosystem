"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, ExternalLink, Activity, Layers, Clock, Globe,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Database
} from 'lucide-react';

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

// ── Indexation Data Row ────────────────────────────────────────────────────────
function DataRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/5 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{label}</span>
      <span className="text-[13px] font-mono font-black" style={{ color: color || 'inherit' }}>{value}</span>
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
          className="fixed inset-0 flex items-center justify-center p-4 z-[99999] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="tok-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl bg-white dark:bg-[#0A0A0A] text-black dark:text-white border border-black/10 dark:border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-black text-white shadow-sm"
                  style={{ backgroundColor: token.netColor }}>
                  {token.symbol[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[22px] font-black tracking-tight">{token.symbol}</span>
                    <span className="text-[10px] px-2.5 py-0.5 font-bold uppercase rounded-full border bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-black/10 dark:border-white/10">
                      {token.network}
                    </span>
                  </div>
                  <span className="text-[13px] text-neutral-500 font-medium">{token.name}</span>
                </div>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                <X size={20} className="text-neutral-500" />
              </button>
            </div>

            {/* ── PRICE SECTION ── */}
            <div className="px-8 py-8 border-b border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-[#111]/50">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5"><Globe size={12}/> Live Oracle Price</p>
                  <p className="text-[40px] font-black font-mono leading-none tracking-tighter">
                    {fmtP(token.price, currency, eurRate)}
                  </p>
                </div>
                <div 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[16px] font-mono shadow-sm"
                  style={{ color: pctC(token.pct), backgroundColor: `${pctC(token.pct)}15` }}
                >
                  {token.pct >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                  {pctF(token.pct)}
                  <span className="text-[10px] opacity-70 font-black uppercase ml-1">24H</span>
                </div>
              </div>

              {token.onChainPrice && token.onChainPrice > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-black border border-black/5 dark:border-white/5">
                  <Activity size={12} className="text-[#00C076]" />
                  <span className="text-[11px] font-mono text-neutral-500">On-Chain Source: <span className="font-bold text-black dark:text-white">{fmtP(token.onChainPrice, currency, eurRate)}</span></span>
                </div>
              )}
            </div>

            {/* ── COMPLETE INDEXATION (REAL DATA) ── */}
            <div className="px-8 py-6">
                <div className="mb-6 flex items-center gap-2">
                    <Database size={16} className="text-neutral-500" />
                    <h3 className="text-[14px] font-black uppercase tracking-widest">Complete Indexation</h3>
                </div>

                <div className="bg-neutral-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl px-6 py-2">
                    <DataRow label="24H Volume" value={fmtL(token.volume, currency, eurRate)} />
                    <DataRow label="Market Cap" value={token.mcap ? fmtL(token.mcap, currency, eurRate) : '—'} />
                    <DataRow label="Fully Diluted Val" value={token.fdv ? fmtL(token.fdv, currency, eurRate) : '—'} />
                    <DataRow label="Liquidity Pool" value={token.liquidity ? fmtL(token.liquidity, currency, eurRate) : '—'} />
                    {token.getblockVerified && (
                        <DataRow 
                            label="On-Chain State" 
                            value={<span className="flex items-center gap-1.5 text-[#00C076]"><ShieldCheck size={14}/> Verified</span>} 
                        />
                    )}
                </div>
            </div>

            {/* ── DEX INFO ── */}
            {token.dex && (
              <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-4 bg-neutral-50/50 dark:bg-[#111]/50">
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-neutral-500" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">DEX:</span>
                    <span className="text-[12px] font-bold">{token.dex}</span>
                </div>
                {token.pairCreatedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <Clock size={14} className="text-neutral-500 ml-2" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Listed:</span>
                    <span className="text-[12px] font-bold">
                      {new Date(token.pairCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── FOOTER ── */}
            <div className="px-8 py-6 flex items-center justify-between border-t border-black/10 dark:border-white/10">
              <a href={explorerBase[token.network] || 'https://etherscan.io'}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                <ExternalLink size={14} /> View on Block Explorer
              </a>
              <div className="flex items-center gap-2.5 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse shadow-[0_0_8px_rgba(0,192,118,0.5)]" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
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
