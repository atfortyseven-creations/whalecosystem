"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Wifi, Clock, Activity, ShieldAlert, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// TYPES
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

// STATUS HELPERS
const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    color: 'bg-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Outage',
    color: 'bg-red-600',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: XCircle,
  },
  loading: {
    label: 'Checking...',
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
    <span className="relative flex h-3 w-3 shrink-0">
      {status === 'operational' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.color} opacity-30`} />
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.color}`} />
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 300 ? 'text-green-600' : ms < 1500 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-mono text-xs font-bold ${color}`}>{ms}ms</span>;
}

// MAIN PAGE
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
    <div className="min-h-screen bg-white text-black font-sans absolute inset-0 z-[100] overflow-y-auto selection:bg-black/10">
      
      <main className="w-full max-w-[800px] mx-auto px-6 pt-24 pb-24 flex flex-col gap-10 relative z-10 items-center">

        {/* Header Text */}
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-3 px-6 py-2 bg-white border border-black/10 rounded-full mb-8 shadow-sm">
                <Server size={14} className="text-black" />
                <span className="text-xs uppercase tracking-widest font-bold text-black/60">System Status</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-4">
                Service Overview
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-black/60 leading-relaxed">
                Real-time monitoring of our services and platform components. Information is strictly live and automatically updates every 30 seconds.
            </motion.p>
        </div>

        {/* OVERALL STATUS HERO */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="w-full">
          <div className={`w-full rounded-3xl bg-white border border-black/10 p-10 flex flex-col items-center text-center gap-6 transition-all duration-700 shadow-md`}>
            <div className={`p-6 rounded-full ${overallCfg.bg} border ${overallCfg.border} flex items-center justify-center mb-2`}>
              <OverallIcon size={48} className={overallCfg.text} />
            </div>
            
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${overallCfg.text} text-balance leading-tight`}>
                {overall === 'operational'
                  ? 'Whale Alert Network working perfectly.'
                  : overall === 'degraded'
                  ? 'Degraded Performance'
                  : overall === 'outage'
                  ? 'Service Outage Detected'
                  : 'Checking Services...'}
              </h1>
              <p className="text-sm font-mono text-black/50 mt-3 font-semibold">
                {health?.avgLatencyMs != null
                  ? `Average Network Latency: ${health.avgLatencyMs}ms`
                  : 'Connecting to servers...'}
              </p>
            </div>

            <div className="w-full h-px bg-black/5 my-4" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest font-bold text-black/40">Last Update</p>
                <p className="text-base font-mono font-bold text-black mt-1">{lastChecked ?? 'Pending'}</p>
                <p className="text-xs text-black/60 font-mono mt-1 font-bold">Refreshing in {countdown}s</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-black/80 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Updating' : 'Refresh Now'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* LIVE METRICS SUMMARY */}
        {health && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {[
              {
                label: 'Online',
                value: `${health.services.filter(s => s.status === 'operational').length}/${health.services.length}`,
                good: health.services.every(s => s.status === 'operational'),
                icon: Activity
              },
              {
                label: 'Latency',
                value: `${health.avgLatencyMs}ms`,
                good: health.avgLatencyMs < 1000,
                icon: Wifi
              },
              {
                label: 'Issues',
                value: String(health.services.filter(s => s.status === 'degraded').length),
                good: health.services.filter(s => s.status === 'degraded').length === 0,
                icon: AlertTriangle
              },
              {
                label: 'Outages',
                value: String(health.services.filter(s => s.status === 'outage').length),
                good: health.services.filter(s => s.status === 'outage').length === 0,
                icon: ShieldAlert
              },
            ].map((m, i) => (
              <div key={m.label} className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-center gap-2">
                    <m.icon size={16} className="text-black/50" />
                    <span className="text-xs font-bold uppercase tracking-widest text-black/50">{m.label}</span>
                </div>
                <span className={`text-3xl font-extrabold tracking-tight ${m.good ? 'text-black' : 'text-red-600'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* SERVICE CARDS */}
        <div className="flex flex-col gap-4 mt-6 w-full">
          <div className="flex items-center justify-center px-2 mb-4 gap-4">
            <div className="h-px bg-black/10 flex-1" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-black">Individual Components</h2>
            <div className="h-px bg-black/10 flex-1" />
          </div>

          <AnimatePresence>
            {loading && !health && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`skeleton-${i}`} className="w-full h-24 rounded-2xl bg-white border border-black/10 shadow-sm animate-pulse" />
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
                  className="w-full bg-white border border-black/10 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-5 min-w-0">
                      <StatusDot status={svc.status} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-lg tracking-tight text-black">{svc.name}</p>
                        <p className="text-xs font-mono font-medium text-black/50 mt-1">{svc.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 shrink-0">
                      <LatencyBadge ms={svc.latencyMs} />
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <Icon size={16} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center justify-center pt-10 mt-10 gap-4 w-full border-t border-black/5">
          <div className="flex items-center justify-center gap-3 text-xs font-mono font-medium text-black/50 uppercase tracking-widest">
            <Clock size={16} className="text-black/50" />
            <span>UTC Timezone | Real-time connection active</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-black/30">
            Copyright {new Date().getFullYear()} Humanity Ledger
          </span>
        </div>

      </main>
    </div>
  );
}
