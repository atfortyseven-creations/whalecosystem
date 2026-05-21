"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, ArrowRight, Database, Clock } from 'lucide-react';
import { formatEther } from 'viem';

export default function HumanityLedger() {
  const [data, setData] = useState<{ blocks: Record<string, unknown>[]; stats: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async (isManual = false) => {
    if (!data || isManual) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/humanity-ledger');
      const json = await res.json();
      if (json && json.ok) {
        setData({
          blocks: Array.isArray(json.blocks) ? json.blocks : [],
          stats: json.stats || {},
        });
      } else {
        setError('Error loading data from the local indexer.');
      }
    } catch {
      setError('Network error connecting to the indexer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds for maximum MAU efficiency
    const interval = setInterval(() => fetchData(false), 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (timestamp: unknown) => {
    try {
      if (!timestamp) return 'N/A';
      const seconds = Number(timestamp);
      if (isNaN(seconds)) return 'N/A';
      return new Date(seconds * 1000).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTxValue = (val: unknown) => {
    try {
      if (val === undefined || val === null) return '0.0000';
      return Number(formatEther(BigInt(String(val)))).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const filteredBlocks = data?.blocks?.filter((block: Record<string, unknown>) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    if (
      String(block.id   || '').toLowerCase().includes(q) ||
      String(block.hash  || '').toLowerCase().includes(q) ||
      String(block.miner || '').toLowerCase().includes(q)
    ) return true;
    return (Array.isArray(block.transactions) ? block.transactions : []).some((tx: unknown) => {
      if (!tx || typeof tx !== 'object') return false;
      const t = tx as Record<string, unknown>;
      return (
        String(t.from || '').toLowerCase().includes(q) ||
        String(t.to   || '').toLowerCase().includes(q) ||
        String(t.hash || '').toLowerCase().includes(q)
      );
    });
  }) || [];

  return (
    // ── OUTER WRAPPER ──────────────────────────────────────────────────────
    // bg logo pushed far right via backgroundPosition so it doesn't compete
    // with the main panel which is pinned to the left side of its container.
    <div className="w-full h-full min-h-0 flex flex-col items-start justify-start p-4 md:p-8 text-black font-sans overflow-y-auto no-scrollbar relative bg-white">
      {/* ── BACKGROUND LOGOS — Centered in the white space on the right, fixed at top ─────────────── */}
      <div className="fixed top-0 right-0 bottom-0 left-[780px] hidden lg:flex items-start justify-center pt-12 pointer-events-none z-0">
        <img 
          src="/aztec_x_whale_partnership.svg" 
          alt="Partnership Logos" 
          className="w-full max-w-[520px] px-8 opacity-90 mix-blend-multiply" 
        />
      </div>

      {/* ── MAIN PANEL — left-aligned, deliberately narrower ─────────────── */}
      <div className="w-full max-w-[780px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 flex flex-col transition-all duration-500 z-10 ml-0">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="w-full flex-shrink-0 border-b border-slate-200/60 pb-5 mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                Humanity Ledger
              </h1>
              <span className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Aztec Network × Whale Alert Network — Live Indexer
              </span>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-sm shrink-0"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <p className="mt-4 text-slate-500 font-medium text-sm leading-relaxed max-w-xl">
            A real-time database of all blockchain transactions. Stored locally and cleared every
            11 hours 59 minutes to ensure optimal speed and storage efficiency.
          </p>
        </div>

        {/* ── STATS ROW ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          <div className="p-5 md:p-6 bg-white/50 backdrop-blur-md border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:bg-white/70 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Blocks Stored</span>
              <span className="text-3xl font-black tracking-tight text-slate-950">
                {Number(data?.stats?.totalBlocks ?? 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/20">
              <Database size={20} className="text-slate-700" />
            </div>
          </div>

          <div className="p-5 md:p-6 bg-white/50 backdrop-blur-md border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:bg-white/70 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Transactions Stored</span>
              <span className="text-3xl font-black tracking-tight text-slate-950">
                {Number(data?.stats?.totalTransactions ?? 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/20">
              <Clock size={20} className="text-slate-700" />
            </div>
          </div>
        </div>

        {/* ── SEARCH ─────────────────────────────────────────────────────── */}
        <div className="w-full mb-7 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search block number or transaction hash…"
            className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white/90 transition-all text-sm font-medium shadow-sm placeholder:text-slate-400"
          />
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <div className="w-full flex-1">
          {error && (
            <div className="p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-xl mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          {!data && loading && (
            <div className="py-20 text-center text-slate-400 font-mono text-xs tracking-widest uppercase animate-pulse">
              Loading ledger data…
            </div>
          )}

          {data && filteredBlocks.length === 0 && !loading && (
            <div className="py-14 text-center">
              <Database size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-mono text-xs tracking-wider uppercase">
                {searchQuery ? 'No matching records found.' : 'No blocks indexed yet. The scanner will populate this view automatically.'}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {filteredBlocks.map((block: Record<string, unknown>) => (
              <div
                key={String(block.hash || block.id || Math.random())}
                className="bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Block Header */}
                <div className="bg-slate-50/60 px-5 py-3.5 border-b border-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-slate-800">
                      Block #{String(block.id || 'N/A')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {formatDate(block.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Validator</span>
                      <span className="font-mono bg-white/70 px-2 py-0.5 rounded border border-slate-200/30 text-[11px] text-slate-700">
                        {block.miner
                          ? `${String(block.miner).slice(0, 8)}…${String(block.miner).slice(-6)}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Transactions</span>
                      <span className="bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200/30 text-[11px] text-slate-700 font-black">
                        {String(block.txCount || '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="divide-y divide-slate-100/60">
                  {(Array.isArray(block.transactions) ? block.transactions : []).map((tx: unknown) => {
                    if (!tx || typeof tx !== 'object') return null;
                    const txObj = tx as Record<string, unknown>;
                    return (
                      <div
                        key={String(txObj.hash || Math.random())}
                        className="p-4 px-5 hover:bg-white/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex flex-col w-full sm:w-1/2 gap-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] w-8">From</span>
                            <span className="font-mono text-slate-700 truncate">{String(txObj.from || 'N/A')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] w-8">To</span>
                            <ArrowRight size={11} className="text-slate-300 shrink-0" />
                            <span className="font-mono text-slate-700 truncate">{String(txObj.to || 'N/A')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end w-full sm:w-auto">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Value Transferred
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatTxValue(txObj.value)} ETH
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {(!Array.isArray(block.transactions) || block.transactions.length === 0) && (
                    <div className="p-5 text-center text-xs text-slate-400 font-medium font-mono">
                      No high-value transactions recorded in this block.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
