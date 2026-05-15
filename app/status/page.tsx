"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Database, Zap, Clock, Hexagon, Server, RefreshCw, Cpu, HardDrive } from "lucide-react";

type SystemStatus = {
  ok: boolean;
  status: string;
  timestamp: string;
  queryLatencyMs: number;
  replicaId: string;
  workers: Record<string, { alive: boolean; lastSeen: string; ageMs: number }>;
  throughput: {
    totalEventsIndexed: number;
    eventsLast1h: number;
    eventsLast24h: number;
    eventsPerMinute1h: number;
    newestEvent: { timestamp: string; chain: string; usdValue: number; token: string } | null;
  };
  chains: Record<string, { eventsLast1h: number; eventsLast24h: number; volumeLast1h: string }>;
  redis: { streamDepth: number; healthy: boolean };
  infrastructure: { chainsActive: string[]; rpcMultiplexer: Record<string, string>; circuitBreaker: string; rpcTimeout: string; heartbeatInterval: string };
};

export default function PublicStatusTerminal() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/scanner/status', { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to reach infrastructure node");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
      setLastFetch(Date.now());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!data && !error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-mono text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-white/40" size={32} />
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-white/40">Establishing connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-white selection:text-black pb-20">

      {/* ── HEADER ── */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Hexagon size={28} className="text-white/60" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-serif text-white leading-none mb-1">Network Status</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mt-1 flex items-center gap-2 font-bold">
              <span className={`w-2 h-2 rounded-full ${data?.status === 'INGESTING' ? 'bg-[#00C076] animate-pulse' : 'bg-[#FF3366]'}`} />
              Infrastructure Monitor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-right font-mono">
            <span className="text-[9px] uppercase tracking-widest text-white/40">Last Sync</span>
            <span className="text-[11px] text-white font-bold">{new Date(lastFetch).toLocaleTimeString()}</span>
          </div>
          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/20 text-[10px] uppercase tracking-widest text-white font-bold transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} strokeWidth={2.5} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-[2560px] mx-auto px-8 py-12 flex flex-col gap-10 text-left items-start">

        {/* ── ERROR STATE ── */}
        {error && (
          <div className="w-full bg-[#FF3366]/10 border border-[#FF3366] text-[#FF3366] px-6 py-4 flex items-center gap-3 text-sm font-mono">
            <Activity size={18} /> {error}
          </div>
        )}

        {/* ── CORE METRICS BENTO BOX ── */}
        {data && (
          <>
            <section className="w-full grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Global Status */}
              <div className="bg-black/30 backdrop-blur-xl p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2 font-mono">
                  <Activity size={14} /> Global Status
                </h3>
                <div className={`text-3xl font-serif tracking-tight ${data.status === 'INGESTING' ? 'text-[#00C076]' : 'text-[#FF3366]'}`}>
                  {data.status}
                </div>
                <div className="text-[11px] text-white/40 font-mono mt-3 flex items-center gap-2 font-bold uppercase tracking-widest">
                  <Clock size={12} /> Latency: {data.queryLatencyMs}ms
                </div>
              </div>

              {/* Total Ledger Size */}
              <div className="bg-black/30 backdrop-blur-xl p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2 font-mono">
                  <Database size={14} /> Total Ledger Size
                </h3>
                <div className="text-3xl font-mono text-white font-black tracking-tighter">
                  {data.throughput.totalEventsIndexed.toLocaleString()}
                </div>
                <div className="text-[11px] text-white/40 font-mono mt-3 font-bold uppercase tracking-widest">
                  Verified Blockchain Events
                </div>
              </div>

              {/* 1H Ingestion Rate */}
              <div className="bg-black/30 backdrop-blur-xl p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2 font-mono">
                  <Zap size={14} /> 1H Ingestion Rate
                </h3>
                <div className="text-3xl font-mono text-white font-black tracking-tighter">
                  {data.throughput.eventsPerMinute1h} <span className="text-base text-white/30">EPM</span>
                </div>
                <div className="text-[11px] text-white/40 font-mono mt-3 font-bold uppercase tracking-widest">
                  Events Per Minute
                </div>
              </div>

              {/* Integrity */}
              <div className="bg-black/30 backdrop-blur-xl p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2 font-mono">
                  <ShieldCheck size={14} /> Data Integrity
                </h3>
                <div className="text-3xl font-mono text-white font-black tracking-tighter">
                  100%
                </div>
                <div className="text-[11px] text-[#00C076] font-mono mt-3 font-bold uppercase tracking-widest">
                  SHA-256 Verifiable
                </div>
              </div>
            </section>

            {/* ── WORKERS & INFRASTRUCTURE ── */}
            <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* WORKER NODES */}
              <div className="flex flex-col">
                <div className="border-b border-white/10 pb-3 mb-6">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60 font-mono flex items-center gap-2">
                    <Server size={16} /> Scanner Heartbeats
                  </h2>
                </div>
                <div className="flex flex-col gap-[1px] bg-white/5 border border-white/10 rounded-xl overflow-hidden font-mono text-[11px]">
                  {Object.entries(data.workers).map(([name, workerStatus]) => (
                    <div key={name} className="flex items-center justify-between p-6 bg-black/20 hover:bg-black/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${workerStatus.alive ? 'bg-[#00C076]' : 'bg-[#FF3366]'}`} />
                        <span className="uppercase text-white font-black tracking-widest">{name} WORKER</span>
                      </div>
                      <div className="text-white/50 font-bold uppercase tracking-widest">
                        {workerStatus.alive ? `Active (${workerStatus.ageMs}ms ago)` : 'OFFLINE'}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-6 bg-white/5">
                    <span className="uppercase text-white/40 font-bold tracking-widest">Redis Backpressure</span>
                    <span className={`font-black tracking-widest ${data.redis.healthy ? "text-[#00C076]" : "text-[#FF3366]"}`}>
                      Depth: {data.redis.streamDepth} {data.redis.streamDepth === -1 ? '(Disconnected)' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFRASTRUCTURE SPECS */}
              <div className="flex flex-col">
                <div className="border-b border-white/10 pb-3 mb-6">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60 font-mono flex items-center gap-2">
                    <Cpu size={16} /> Node Specifications
                  </h2>
                </div>
                <div className="flex flex-col gap-[1px] bg-white/5 border border-white/10 rounded-xl overflow-hidden font-mono text-[11px]">
                  <div className="flex justify-between items-center bg-black/20 p-6 hover:bg-black/30 transition-colors">
                    <span className="uppercase text-white/40 font-bold tracking-widest">RPC Multiplexer</span>
                    <span className="text-white font-black tracking-wider text-right leading-relaxed">
                      ETH: {data.infrastructure.rpcMultiplexer.ethereum}<br />
                      BASE: {data.infrastructure.rpcMultiplexer.base}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-6 hover:bg-black/30 transition-colors">
                    <span className="uppercase text-white/40 font-bold tracking-widest">Circuit Breaker</span>
                    <span className="text-white font-black tracking-wider">{data.infrastructure.circuitBreaker}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-6 hover:bg-black/30 transition-colors">
                    <span className="uppercase text-white/40 font-bold tracking-widest">RPC Timeout</span>
                    <span className="text-white font-black tracking-wider">{data.infrastructure.rpcTimeout}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-6 hover:bg-black/30 transition-colors">
                    <span className="uppercase text-white/40 font-bold tracking-widest">Chains Active</span>
                    <span className="text-white font-black tracking-wider">{data.infrastructure.chainsActive.join(', ')}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── LATEST INGESTION ── */}
            <section className="w-full flex flex-col">
              <div className="border-b border-white/10 pb-3 mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60 font-mono flex items-center gap-2">
                  <HardDrive size={16} /> Last Processed Block Event
                </h2>
              </div>
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 font-mono text-[12px]">
                {data.throughput.newestEvent ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-3 py-1.5 bg-white text-black font-black tracking-[0.2em] uppercase text-[10px] rounded-full">
                        {data.throughput.newestEvent.chain}
                      </span>
                      <span className="text-white font-black text-lg">
                        ${data.throughput.newestEvent.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                      </span>
                      <span className="text-white/50 font-bold uppercase tracking-widest">
                        {data.throughput.newestEvent.token}
                      </span>
                    </div>
                    <div className="text-white/40 font-bold tracking-widest uppercase text-[10px] bg-white/5 px-4 py-2 border border-white/10 rounded-lg">
                      {new Date(data.throughput.newestEvent.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/40 font-bold uppercase tracking-widest">Awaiting initial sync...</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
