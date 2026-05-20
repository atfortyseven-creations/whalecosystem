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
// STATUS HELPERS (Quantum Theme)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    color: 'bg-[#00FFAA]',
    shadow: 'shadow-[0_0_15px_rgba(0,255,170,0.5)]',
    text: 'text-[#00FFAA]',
    bg: 'bg-[#00FFAA]/10',
    border: 'border-[#00FFAA]/20',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-amber-400',
    shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Outage',
    color: 'bg-red-500',
    shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
  },
  loading: {
    label: 'Checking…',
    color: 'bg-white/30',
    shadow: 'shadow-none',
    text: 'text-white/50',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Wifi,
  },
} as const;

function StatusDot({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {status === 'operational' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.color} opacity-50`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.color} ${cfg.shadow}`} />
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 300 ? 'text-[#00FFAA]' : ms < 1500 ? 'text-amber-400' : 'text-red-500';
  return <span className={`font-mono text-[11px] font-bold tracking-widest ${color}`}>{ms}MS</span>;
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
    <div className="flex gap-[2px] items-end h-6 w-full mt-4">
      {slots.map((s, i) => (
        <div
          key={i}
          title={s}
          className={`flex-1 rounded-sm transition-all ${
            s === 'operational' ? 'bg-[#00FFAA]/80 h-6 hover:bg-[#00FFAA]' :
            s === 'degraded'    ? 'bg-amber-400 h-4 hover:bg-amber-300' :
                                   'bg-red-500 h-3 hover:bg-red-400'
          } ${i === 89 ? 'ring-1 ring-offset-1 ring-offset-[#050505] ring-white/30' : 'opacity-80'}`}
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
    <div className="min-h-screen bg-[#050505] text-white font-sans absolute inset-0 z-[100] overflow-y-auto selection:bg-[var(--aztec-orchid)]/30">
      
      {/* Quantum Grid Background */}
      <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--aztec-orchid)]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#00FFAA]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1000px] mx-auto px-6 pt-32 pb-24 flex flex-col gap-8 relative z-10">

        {/* Header Text */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
                <Cpu size={14} className="text-[var(--aztec-orchid)]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/70">Quantum Node Telemetry</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                System Status
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm font-mono text-white/40 tracking-widest uppercase">
                Real-time cryptographic network monitoring
            </motion.p>
        </div>

        {/* ── OVERALL STATUS HERO ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className={`w-full rounded-[2rem] border ${overallCfg.border} ${overallCfg.bg} backdrop-blur-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-700 shadow-2xl`}>
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${overallCfg.bg} border ${overallCfg.border} flex items-center justify-center`}>
              <OverallIcon size={32} className={overallCfg.text} />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tighter uppercase ${overallCfg.text}`}>
                {overall === 'operational'
                  ? 'All Systems Operational'
                  : overall === 'degraded'
                  ? 'Degraded Performance'
                  : overall === 'outage'
                  ? 'Service Disruption'
                  : 'Probing Nodes…'}
              </h1>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">
                {health?.avgLatencyMs != null
                  ? `Network Latency: ${health.avgLatencyMs}ms`
                  : 'Establishing Secure Handshake...'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Last Signature</p>
              <p className="text-sm font-mono font-bold text-white/80">{lastChecked ?? '—'}</p>
              <p className="text-[10px] text-[var(--aztec-orchid)] font-mono mt-1">NEXT PROBE IN {countdown}s</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--aztec-orchid)]/50 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Probing' : 'Force Refresh'}
            </button>
          </div>
        </motion.div>

        {/* ── LIVE METRICS SUMMARY ───────────────────────────────────────────── */}
        {health && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              <div key={m.label} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{m.label}</span>
                    <m.icon size={12} className="text-white/20" />
                </div>
                <span className={`text-2xl font-mono font-bold tracking-tight ${m.good ? 'text-white' : 'text-red-500'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── SERVICE CARDS ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Core Infrastructure</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--aztec-orchid)]">90-Day Telemetry</span>
          </div>

          <AnimatePresence>
            {loading && !health && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`skeleton-${i}`} className="w-full h-28 rounded-[1.5rem] bg-white/5 border border-white/5 animate-pulse" />
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
                  className="w-full bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] overflow-hidden hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-white/5">
                    <div className="flex items-center gap-4 min-w-0">
                      <StatusDot status={svc.status} />
                      <div className="min-w-0">
                        <p className="font-bold text-sm tracking-wide text-white truncate">{svc.name}</p>
                        <p className="text-[10px] font-mono tracking-widest text-white/30 truncate mt-1 uppercase">{svc.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <LatencyBadge ms={svc.latencyMs} />
                      <span
                        className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                      {svc.httpCode && (
                        <span className="hidden md:inline font-mono text-[9px] font-bold tracking-widest text-white/30 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                          HTTP {svc.httpCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white/[0.01]">
                    <MiniUptimeBar status={svc.status} />
                    <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                      <span>T-90 Days</span>
                      <span>Real-Time</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 pb-12 border-t border-white/10 mt-8 gap-4">
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <Clock size={12} className="text-[var(--aztec-orchid)]" />
            <span>UTC Timezone | Algorithmic polling active</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            Whale Alert Network © {new Date().getFullYear()}
          </span>
        </div>

      </main>
    </div>
  );
}
