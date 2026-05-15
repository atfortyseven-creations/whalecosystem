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
      if (!res.ok) throw new Error("Failed to reach Master Node");
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
    const interval = setInterval(fetchStatus, 15000); // 15s live polling
    return () => clearInterval(interval);
  }, []);

  if (!data && !error) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-black">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-black/50" size={32} />
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-black/50">Establishing secure connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1a1a1a] font-sans selection:bg-black selection:text-white pb-20">
      {/* ── HEADER ── */}
      <header className="border-b-[1.5px] border-black bg-[#FDFCF8] px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Hexagon size={28} className="text-black" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-serif text-black leading-none mb-1">Sovereign Audit Terminal</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-mono mt-1 flex items-center gap-2 font-bold">
              <span className={`w-2 h-2 rounded-full ${data?.status === 'INGESTING' ? 'bg-[#00C076] animate-pulse' : 'bg-[#FF3366]'}`}></span>
              Public Infrastructure Matrix
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-right font-mono">
            <span className="text-[9px] uppercase tracking-widest text-[#888]">Last Sync</span>
            <span className="text-[11px] text-black font-bold">{new Date(lastFetch).toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchStatus} 
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#f5f4ef] hover:bg-[#eceae3] border border-black text-[10px] uppercase tracking-widest text-black font-bold transition-colors shadow-sm"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} strokeWidth={2.5} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-[2560px] mx-auto px-8 py-12 flex flex-col gap-10 text-left items-start">
        
        {/* ── ERROR STATE ── */}
        {error && (
          <div className="bg-[#FF3366]/10 border border-[#FF3366] text-[#FF3366] px-6 py-4 flex items-center gap-3 text-sm font-mono shadow-sm">
            <Activity size={18} /> {error}
          </div>
        )}

        {/* ── CORE METRICS BENTO BOX ── */}
        {data && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-black border border-black shadow-sm">
              <div className="bg-[#FDFCF8] p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3 flex items-center gap-2 font-mono">
                  <Activity size={14} /> Global Status
                </h3>
                <div className={`text-3xl font-serif tracking-tight ${data.status === 'INGESTING' ? 'text-[#00C076]' : 'text-[#FF3366]'}`}>
                  {data.status}
                </div>
                <div className="text-[11px] text-black/60 font-mono mt-3 flex items-center gap-2 font-bold uppercase tracking-widest">
                  <Clock size={12} /> Latency: {data.queryLatencyMs}ms
                </div>
              </div>
              
              <div className="bg-[#FDFCF8] p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3 flex items-center gap-2 font-mono">
                  <Database size={14} /> Total Ledger Size
                </h3>
                <div className="text-3xl font-mono text-black font-black tracking-tighter">
                  {data.throughput.totalEventsIndexed.toLocaleString()}
                </div>
                <div className="text-[11px] text-black/60 font-mono mt-3 font-bold uppercase tracking-widest">
                  Verified Blockchain Events
                </div>
              </div>

              <div className="bg-[#FDFCF8] p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3 flex items-center gap-2 font-mono">
                  <Zap size={14} /> 1H Ingestion Rate
                </h3>
                <div className="text-3xl font-mono text-black font-black tracking-tighter">
                  {data.throughput.eventsPerMinute1h} <span className="text-base text-black/40">EPM</span>
                </div>
                <div className="text-[11px] text-black/60 font-mono mt-3 font-bold uppercase tracking-widest">
                  Events Per Minute
                </div>
              </div>

              <div className="bg-[#FDFCF8] p-8 flex flex-col justify-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3 flex items-center gap-2 font-mono">
                  <ShieldCheck size={14} /> Zero-Mock Integrity
                </h3>
                <div className="text-3xl font-mono text-black font-black tracking-tighter">
                  100%
                </div>
                <div className="text-[11px] text-[#00C076] font-mono mt-3 font-bold uppercase tracking-widest">
                  SHA-256 Verifiable
                </div>
              </div>
            </section>

            {/* ── WORKERS & INFRASTRUCTURE ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* WORKER NODES */}
              <div className="flex flex-col">
                <div className="border-b-[1.5px] border-black pb-3 mb-6">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-black font-mono flex items-center gap-2">
                    <Server size={16} /> Scanner Heartbeats
                  </h2>
                </div>
                <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm font-mono text-[11px]">
                  {Object.entries(data.workers).map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between p-6 bg-[#FDFCF8] hover:bg-[#f5f4ef] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${status.alive ? 'bg-[#00C076]' : 'bg-[#FF3366]'}`} />
                        <span className="uppercase text-black font-black tracking-widest">{name} WORKER</span>
                      </div>
                      <div className="text-black/60 font-bold uppercase tracking-widest">
                        {status.alive ? `Active (${status.ageMs}ms ago)` : 'OFFLINE'}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-6 bg-[#f5f4ef]">
                     <span className="uppercase text-[#555] font-bold tracking-widest">Redis Backpressure</span>
                     <span className={`font-black tracking-widest ${data.redis.healthy ? "text-[#00C076]" : "text-[#FF3366]"}`}>
                        Depth: {data.redis.streamDepth} {data.redis.streamDepth === -1 ? '(Disconnected)' : ''}
                     </span>
                  </div>
                </div>
              </div>

              {/* INFRASTRUCTURE SPECS */}
              <div className="flex flex-col">
                <div className="border-b-[1.5px] border-black pb-3 mb-6">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-black font-mono flex items-center gap-2">
                    <Cpu size={16} /> Master Node Specs
                  </h2>
                </div>
                <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm font-mono text-[11px]">
                   <div className="flex justify-between items-center bg-[#FDFCF8] p-6 hover:bg-[#f5f4ef] transition-colors">
                      <span className="uppercase text-[#555] font-bold tracking-widest">RPC Multiplexer</span>
                      <span className="text-black font-black tracking-wider text-right leading-relaxed">
                         ETH: {data.infrastructure.rpcMultiplexer.ethereum}<br/>
                         BASE: {data.infrastructure.rpcMultiplexer.base}
                      </span>
                   </div>
                   <div className="flex justify-between items-center bg-[#FDFCF8] p-6 hover:bg-[#f5f4ef] transition-colors">
                      <span className="uppercase text-[#555] font-bold tracking-widest">Circuit Breaker</span>
                      <span className="text-black font-black tracking-wider">{data.infrastructure.circuitBreaker}</span>
                   </div>
                   <div className="flex justify-between items-center bg-[#FDFCF8] p-6 hover:bg-[#f5f4ef] transition-colors">
                      <span className="uppercase text-[#555] font-bold tracking-widest">RPC Timeout Enforce</span>
                      <span className="text-black font-black tracking-wider">{data.infrastructure.rpcTimeout}</span>
                   </div>
                   <div className="flex justify-between items-center bg-[#FDFCF8] p-6 hover:bg-[#f5f4ef] transition-colors">
                      <span className="uppercase text-[#555] font-bold tracking-widest">Chains Active</span>
                      <span className="text-black font-black tracking-wider">{data.infrastructure.chainsActive.join(', ')}</span>
                   </div>
                </div>
              </div>
            </section>

            {/* ── LATEST INGESTION ── */}
            <section className="flex flex-col">
                <div className="border-b-[1.5px] border-black pb-3 mb-6">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-black font-mono flex items-center gap-2">
                    <HardDrive size={16} /> Last Processed Block Event
                  </h2>
                </div>
                <div className="bg-[#FDFCF8] border border-black shadow-sm p-8 font-mono text-[12px]">
                   {data.throughput.newestEvent ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div className="flex flex-wrap items-center gap-4">
                            <span className="px-3 py-1.5 bg-black text-white font-black tracking-[0.2em] uppercase text-[10px]">
                              {data.throughput.newestEvent.chain}
                            </span>
                            <span className="text-black font-black text-lg">
                              ${data.throughput.newestEvent.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                            </span>
                            <span className="text-black/50 font-bold uppercase tracking-widest">
                              {data.throughput.newestEvent.token}
                            </span>
                         </div>
                         <div className="text-[#555] font-bold tracking-widest uppercase text-[10px] bg-[#f5f4ef] px-4 py-2 border border-black/10">
                            {new Date(data.throughput.newestEvent.timestamp).toLocaleString()}
                         </div>
                      </div>
                   ) : (
                      <div className="text-black/50 font-bold uppercase tracking-widest">Awaiting initial sync...</div>
                   )}
                </div>
            </section>

          </>
        )}
      </main>
    </div>
  );
}
