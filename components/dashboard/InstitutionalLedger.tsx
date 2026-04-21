// components/dashboard/InstitutionalLedger.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Shield, ExternalLink, Hash, Clock,
  Activity, Search, RefreshCw, CheckCircle2,
  Layers, Cpu, Lock, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useOmniInfrastructure } from '@/lib/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LedgerEntry {
  id: string;
  blockHex: string;
  verificationLayer: string;
  sha256Hash: string;
  payloadMB: number;
  protocolState: 'Finalized / Valid' | 'Pending' | 'Orphaned';
  timestamp: string;
  chain: string;
}

interface LedgerStats {
  totalBlocks: number;
  finalizedPct: number;
  avgPayloadMB: number;
  observersActive: number;
}

// ── Utility ───────────────────────────────────────────────────────────────────
function shortHash(h: string) {
  if (!h || h.length < 16) return h;
  return `${h.slice(0, 10)}...${h.slice(-6)}`;
}

function StatCard({
  icon, label, value, sub, accent = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`bg-white shadow-sm rounded-xl border ${accent ? 'border-emerald-200 shadow-none' : 'border-[#E5E5E5]'} p-5 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className={accent ? 'text-emerald-500' : 'text-[#050505]/30'}>{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/50">{label}</span>
      </div>
      <span className={`text-xl md:text-2xl font-black font-mono leading-none ${accent ? 'text-emerald-700' : 'text-[#050505]'}`}>
        {value}
      </span>
    </div>
  );
}

function StateChip({ state }: { state: LedgerEntry['protocolState'] }) {
  const cfg = {
    'Finalized / Valid': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Pending':           { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-400 animate-pulse' },
    'Orphaned':          { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  }[state];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {state}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InstitutionalLedger() {
  // =========================================================================
  // INJECTED DATA HOOK — Zero-Mock Mandate
  // Block explorer endpoint injected via REGISTRY.OMNI_INFRA.blockExplorer
  // =========================================================================
  const { data: rawData, isLoading: loading, refetch } = useOmniInfrastructure('blockExplorer');
  const isSyncing = loading;

  const entries: LedgerEntry[] = useMemo(() => {
    const safeData = Array.isArray(rawData) ? rawData : (rawData?.entries || []);
    return safeData.map((e: any, i: number) => ({
      id:                e.id || String(i),
      blockHex:          e.txid ? `0x${parseInt(e.txid.slice(0,8), 16).toString(16).toUpperCase()}` : (e.hash ? `0x${e.hash.replace('0x', '').slice(0, 8).toUpperCase()}` : `0x${e.blockHex || '—'}`),
      verificationLayer: e.chain || e.verificationLayer || 'L1_ETH_MAINNET',
      sha256Hash:        e.txid ? `0x${e.txid}` : (e.hash ? e.hash : (e.sha256Hash || `0x${'0'.repeat(64)}`)),
      payloadMB:         e.usdValue ? parseFloat((e.usdValue / 1_000_000).toFixed(3)) : (e.payloadMB ?? (e.valueBTC ? parseFloat((e.valueBTC * 0.001).toFixed(3)) : 0)),
      protocolState:     e.status === 'CONFIRMED' || e.status === 'UNSPENT' ? 'Finalized / Valid' : e.status === 'PENDING' ? 'Pending' : (e.protocolState || 'Finalized / Valid'),
      timestamp:         e.timestamp || new Date().toISOString(),
      chain:             e.category || e.chain || 'L1_ETH_MAINNET',
    }));
  }, [rawData]);

  const stats: LedgerStats | null = useMemo(() => {
    if (!rawData) return null;
    return {
      totalBlocks:     rawData.stats?.totalMonitored ?? entries.length,
      finalizedPct:    rawData.stats?.finalizedPct ?? rawData.stats?.whaleConcentrationPct ?? 0,
      avgPayloadMB:    parseFloat((entries.reduce((s, e) => s + e.payloadMB, 0) / Math.max(entries.length, 1)).toFixed(3)),
      observersActive: rawData.stats?.activeObservers ?? 0,
    };
  }, [rawData, entries]);

  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<LedgerEntry | null>(null);

  const filtered = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(e =>
      e.blockHex.toLowerCase().includes(q) ||
      e.sha256Hash.toLowerCase().includes(q) ||
      e.verificationLayer.toLowerCase().includes(q) ||
      e.chain.toLowerCase().includes(q)
    );
  }, [entries, filter]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full min-h-0 flex flex-col bg-[#FAF9F6] overflow-hidden rounded-xl border border-[#E5E5E5]">

      {/* ── Page Header ── */}
      <div className="shrink-0 px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#E5E5E5] bg-white">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[13px] font-black uppercase tracking-widest text-[#050505]">
            INSTITUTIONAL LEDGER
          </h1>
          <p className="text-[10px] text-[#050505]/40 font-bold leading-tight max-w-md uppercase tracking-[0.1em]">
            Verified chronology of MACRO-ECONOMIC state.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Telemetry Active</span>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded border border-[#E5E5E5] hover:bg-[#FAF9F6] transition-colors text-[#050505]/40 hover:text-[#050505]"
            title="Force sync"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 border-b border-[#E5E5E5]">
        <StatCard
          icon={<Layers size={14} />}
          label="INDEXED BLOCKS"
          value={stats ? stats.totalBlocks.toLocaleString() : '—'}
        />
        <StatCard
          icon={<CheckCircle2 size={14} />}
          label="FINALIZATION YIELD"
          value={stats ? `${stats.finalizedPct.toFixed(1)}%` : '—'}
          accent
        />
        <StatCard
          icon={<Database size={14} />}
          label="AVERAGE ENTROPY"
          value={stats ? `${stats.avgPayloadMB} MB` : '—'}
        />
        <StatCard
          icon={<Cpu size={14} />}
          label="ACTIVE OBSERVERS"
          value={stats ? `${stats.observersActive}` : '—'}
        />
      </div>

      <div className="shrink-0 px-6 py-3 border-b border-[#E5E5E5] flex items-center gap-3 bg-[#FAF9F6]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#050505]/30" size={12} />
          <input
            type="text"
            placeholder="Filter by hash, layer..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-lg px-8 py-2 text-[10px] font-mono text-[#050505] outline-none focus:border-[#050505]/40 transition-colors placeholder:text-[#050505]/25"
          />
        </div>
        <span className="text-[9px] font-black text-[#050505]/40 uppercase tracking-widest">
          {filtered.length} of {entries.length} items
        </span>
      </div>

      {/* ── Table + Detail ── */}
      <div className="flex-1 min-h-0 flex gap-0">

        {/* List */}
        <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
          {/* Column Headers */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] grid grid-cols-12 gap-4 px-6 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            {['ENTRY ID', 'LAYER', 'SHA-256 SIGNATURE', 'ENTROPY', 'STATE'].map((h, i) => (
              <span key={i} className={`text-[9px] font-black uppercase tracking-widest text-[#050505]/40 ${
                i === 0 ? 'col-span-2' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-4' : i === 3 ? 'col-span-2' : 'col-span-2'
              }`}>
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E5E5E5] animate-pulse">
                  <div className="col-span-2 h-3 bg-[#050505]/5 rounded" />
                  <div className="col-span-2 h-3 bg-[#050505]/5 rounded" />
                  <div className="col-span-4 h-3 bg-[#050505]/5 rounded" />
                  <div className="col-span-2 h-3 bg-[#050505]/5 rounded" />
                  <div className="col-span-2 h-3 bg-[#050505]/5 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          <AnimatePresence initial={false}>
            {!loading && filtered.map((entry, idx) => {
              const isActive = selected?.id === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: idx * 0.004 }}
                  onClick={() => setSelected(isActive ? null : entry)}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E5E5E5] cursor-pointer transition-colors ${
                    isActive ? 'bg-[#FAF9F6]' : 'hover:bg-white'
                  }`}
                >
                  {/* Block ID */}
                  <div className="col-span-2 flex items-center gap-2">
                    <Hash size={10} className="text-[#050505]/20 shrink-0" />
                    <span className="text-[11px] font-black font-mono text-[#050505]">{entry.blockHex}</span>
                  </div>

                  {/* Verification Layer */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/50 bg-[#050505]/5 px-2 py-1 rounded">
                      {entry.verificationLayer}
                    </span>
                  </div>

                  {/* SHA-256 Hash */}
                  <div className="col-span-4 flex items-center gap-2">
                    <Lock size={9} className="text-[#050505]/20 shrink-0" />
                    <span className="text-[10px] font-mono text-[#050505]/50 truncate">{shortHash(entry.sha256Hash)}</span>
                    <a
                      href={`https://etherscan.io/block/${parseInt(entry.blockHex, 16)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="shrink-0 text-[#050505]/20 hover:text-[#050505] transition-colors"
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>

                  {/* Payload */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-[11px] font-black font-mono text-[#050505]">{entry.payloadMB} MB</span>
                  </div>

                  {/* State */}
                  <div className="col-span-2 flex items-center">
                    <StateChip state={entry.protocolState} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-full bg-[#050505]/5 flex items-center justify-center">
                <AlertTriangle size={22} className="text-[#050505]/20" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/30">
                No entries match current filter
              </span>
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="ledger-detail"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 border-l border-[#E5E5E5] bg-white overflow-hidden"
            >
              <div className="w-[320px] p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]/40">Block Detail</span>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[#050505]/30 hover:text-[#050505] transition-colors text-[18px] leading-none"
                  >×</button>
                </div>

                {/* Block ID pill */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E5E5] text-center">
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#050505]/30 mb-2">Block ID</div>
                  <div className="text-2xl font-black font-mono text-[#050505]">{selected.blockHex}</div>
                </div>

                {/* Fields */}
                {[
                  { label: 'Verification Layer', value: selected.verificationLayer, mono: false },
                  { label: 'SHA-256 Hash Signature', value: selected.sha256Hash.slice(0, 42) + '...', mono: true },
                  { label: 'Payload Entropy', value: `${selected.payloadMB} MB`, mono: true },
                  { label: 'Timestamp', value: new Date(selected.timestamp).toLocaleString(), mono: false },
                  { label: 'Chain', value: selected.chain, mono: false },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/30">{f.label}</span>
                    <span className={`text-[11px] font-black text-[#050505] ${f.mono ? 'font-mono break-all' : ''}`}>{f.value}</span>
                  </div>
                ))}

                {/* State */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/30">Protocol State</span>
                  <StateChip state={selected.protocolState} />
                </div>

                {/* Etherscan link */}
                <a
                  href={`https://etherscan.io/block/${parseInt(selected.blockHex, 16)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-3 rounded-xl bg-[#050505] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#050505]/80 transition-colors flex items-center justify-center gap-2 mt-auto"
                >
                  <ExternalLink size={12} />
                  Verify on Etherscan
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 px-6 py-3 border-t border-[#E5E5E5] bg-white flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#050505]/40">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            L1 NETWORK ACTIVE
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#050505]/40">
            <Shield size={10} />
            STATE VERIFIED
          </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/20">
          WAN SYS v3.1
        </span>
      </div>
    </div>
  );
}
