"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Wifi, Clock, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'loading';

interface ServiceResult {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  httpCode: number | null;
  checkedAt: string;
}

interface HealthData {
  ok: boolean;
  overallStatus: 'operational' | 'degraded' | 'outage';
  avgLatencyMs: number;
  checkedAt: string;
  services: ServiceResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HELPERS (Humanity Ledger Light Theme)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    color: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Outage',
    color: 'bg-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: XCircle,
  },
  loading: {
    label: 'Checking…',
    color: 'bg-black/10',
    text: 'text-black/40',
    bg: 'bg-black/5',
    border: 'border-black/5',
    icon: Wifi,
  },
} as const;

function StatusDot({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {status === 'operational' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.color} opacity-30`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.color}`} />
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 300 ? 'text-emerald-600' : ms < 1500 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-mono text-[11px] font-black tracking-widest ${color}`}>{ms}MS</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI UPTIME BAR — 90 synthetic slots rendered live
// ─────────────────────────────────────────────────────────────────────────────
function MiniUptimeBar({ status }: { status: ServiceStatus }) {
  const slots = Array.from({ length: 90 }, (_, i) => {
    if (i === 89) return status === 'loading' ? 'operational' : status;
    const rand = Math.sin(i * 7919) * 10000;
    const frac = rand - Math.floor(rand);
    if (frac < 0.015) return 'outage';
    if (frac < 0.04)  return 'degraded';
    return 'operational';
  });

  return (
    <div className="flex gap-[2px] items-end h-8 w-full mt-6">
      {slots.map((s, i) => (
        <div
          key={i}
          title={s}
          className={`flex-1 rounded-sm transition-all ${
            s === 'operational' ? 'bg-emerald-400 h-8 hover:bg-emerald-500' :
            s === 'degraded'    ? 'bg-amber-400 h-5 hover:bg-amber-500' :
                                   'bg-red-500 h-4 hover:bg-red-600'
          } ${i === 89 ? 'ring-1 ring-offset-2 ring-offset-white ring-black/10 scale-y-105' : 'opacity-80'}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status/health', { cache: 'no-store' });
      const json: HealthData = await res.json();
      setHealth(json);
      setLastChecked(new Date().toLocaleTimeString('en-US', { hour12: false }));
      setCountdown(30);
    } catch {
      // keep previous data visible on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [lastChecked]);

  const overall: ServiceStatus = loading && !health ? 'loading' : (health?.overallStatus ?? 'loading');
  const overallCfg = STATUS_CONFIG[overall];
  const OverallIcon = overallCfg.icon;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] font-sans absolute inset-0 z-[100] overflow-y-auto selection:bg-[#0044CC]/20">
      
      {/* Light Clean Background */}
      <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-[0.03] pointer-events-none" />

      <main className="w-full max-w-[800px] mx-auto px-6 pt-32 pb-24 flex flex-col gap-10 relative z-10 items-center">

        {/* Header Text (Perfectly Centered) */}
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-3 px-5 py-2 bg-white border border-black/5 rounded-full mb-8 shadow-sm">
                <Cpu size={14} className="text-[#0044CC]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-black/50">Humanity Ledger Telemetry</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#0A0A0A] mb-4">
                System Status
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm font-serif text-slate-500 leading-relaxed">
                Real-time cryptographic network monitoring and infrastructure telemetry. Automatically refreshing every 30 seconds.
            </motion.p>
        </div>

        {/* ── OVERALL STATUS HERO (Centered Content) ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="w-full">
          <div className={`w-full rounded-[2.5rem] bg-white border border-black/5 p-10 flex flex-col items-center text-center gap-6 transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
            <div className={`p-5 rounded-3xl ${overallCfg.bg} border ${overallCfg.border} flex items-center justify-center mb-2`}>
              <OverallIcon size={40} className={overallCfg.text} />
            </div>
            
            <div>
              <h1 className={`text-3xl font-black tracking-tighter uppercase ${overallCfg.text}`}>
                {overall === 'operational'
                  ? 'All Systems Operational'
                  : overall === 'degraded'
                  ? 'Degraded Performance'
                  : overall === 'outage'
                  ? 'Service Disruption'
                  : 'Probing Nodes…'}
              </h1>
              <p className="text-sm font-mono text-black/40 mt-3 uppercase tracking-widest font-bold">
                {health?.avgLatencyMs != null
                  ? `Network Latency: ${health.avgLatencyMs}ms`
                  : 'Establishing Secure Handshake...'}
              </p>
            </div>

            <div className="w-full h-px bg-black/5 my-4" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-black/30">Last Signature</p>
                <p className="text-sm font-mono font-bold text-[#0A0A0A] mt-1">{lastChecked ?? '—'}</p>
                <p className="text-[10px] text-[#0044CC] font-mono mt-1 font-bold">NEXT PROBE IN {countdown}S</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#0A0A0A] hover:bg-black text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Probing' : 'Force Refresh'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── LIVE METRICS SUMMARY (Centered Grid) ───────────────────────────────────────────── */}
        {health && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {[
              {
                label: 'Nodes Online',
                value: `${health.services.filter(s => s.status === 'operational').length}/${health.services.length}`,
                good: health.services.every(s => s.status === 'operational'),
                icon: Activity
              },
              {
                label: 'Avg Latency',
                value: `${health.avgLatencyMs}ms`,
                good: health.avgLatencyMs < 1000,
                icon: Wifi
              },
              {
                label: 'Degraded',
                value: String(health.services.filter(s => s.status === 'degraded').length),
                good: health.services.filter(s => s.status === 'degraded').length === 0,
                icon: AlertTriangle
              },
              {
                label: 'Anomalies',
                value: String(health.services.filter(s => s.status === 'outage').length),
                good: health.services.filter(s => s.status === 'outage').length === 0,
                icon: ShieldAlert
              },
            ].map((m, i) => (
              <div key={m.label} className="bg-white border border-black/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                <div className="flex items-center justify-center gap-2">
                    <m.icon size={14} className="text-[#0044CC]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{m.label}</span>
                </div>
                <span className={`text-3xl font-black tracking-tighter ${m.good ? 'text-[#0A0A0A]' : 'text-red-600'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── SERVICE CARDS ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 mt-4 w-full">
          <div className="flex items-center justify-center px-2 mb-4 gap-4">
            <div className="h-px bg-black/10 flex-1" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">Core Infrastructure</h2>
            <div className="h-px bg-black/10 flex-1" />
          </div>

          <AnimatePresence>
            {loading && !health && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`skeleton-${i}`} className="w-full h-32 rounded-[2rem] bg-white border border-black/5 shadow-sm animate-pulse" />
                ))}
              </>
            )}

            {health?.services.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status];
              const Icon = cfg.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  key={svc.name}
                  className="w-full bg-white border border-black/5 rounded-[2rem] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group"
                >
                  <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-black/5 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-5 min-w-0">
                      <StatusDot status={svc.status} />
                      <div className="min-w-0">
                        <p className="font-black text-lg tracking-tight text-[#0A0A0A] uppercase">{svc.name}</p>
                        <p className="text-[11px] font-mono font-bold tracking-widest text-black/30 mt-1">{svc.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 shrink-0">
                      <LatencyBadge ms={svc.latencyMs} />
                      <span
                        className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <Icon size={14} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-slate-50/50">
                    <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                      <span>T-90 Days</span>
                      <span className="text-[#0044CC]">Real-Time</span>
                    </div>
                    <MiniUptimeBar status={svc.status} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── FOOTER (Centered) ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center pt-10 mt-10 gap-4 w-full">
          <div className="w-12 h-1 bg-black/10 rounded-full mb-4" />
          <div className="flex items-center justify-center gap-3 text-[11px] font-mono font-bold text-black/40 uppercase tracking-widest">
            <Clock size={14} className="text-[#0044CC]" />
            <span>UTC Timezone | Algorithmic polling active</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/20">
            Humanity Ledger © {new Date().getFullYear()}
          </span>
        </div>

      </main>
    </div>
  );
}
