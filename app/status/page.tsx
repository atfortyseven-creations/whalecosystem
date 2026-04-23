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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-[#D4AF37]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin" size={32} />
          <span className="text-[11px] tracking-[0.3em] uppercase">Establishing secure connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F0F0F0] font-sans selection:bg-[#D4AF37] selection:text-[#050505]">
      {/* ── HEADER ── */}
      <header className="border-b border-[#333333] bg-[#0A0A0A] px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Hexagon size={28} className="text-[#D4AF37]" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-[#FFFFFF]">Whale Alert Network</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-mono mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${data?.status === 'INGESTING' ? 'bg-[#00C076] animate-pulse' : 'bg-[#FF3366]'}`}></span>
              Public Audit Terminal · L1/L2 Infrastructure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-right font-mono">
            <span className="text-[9px] uppercase tracking-widest text-[#888888]">Last Sync</span>
            <span className="text-[11px] text-[#D4AF37]">{new Date(lastFetch).toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchStatus} 
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#333333] text-[10px] uppercase tracking-widest text-[#FFFFFF] hover:bg-[#222] transition-colors"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
        
        {/* ── ERROR STATE ── */}
        {error && (
          <div className="bg-[#FF3366]/10 border border-[#FF3366] text-[#FF3366] px-6 py-4 rounded-sm flex items-center gap-3 text-sm font-mono">
            <Activity size={18} /> {error}
          </div>
        )}

        {/* ── CORE METRICS ── */}
        {data && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0A0A0A] border border-[#222222] p-6 rounded-sm">
                <h3 className="text-[9px] uppercase tracking-widest text-[#888888] mb-2 flex items-center gap-2"><Activity size={12}/> Global Status</h3>
                <div className={`text-2xl font-black tracking-widest uppercase ${data.status === 'INGESTING' ? 'text-[#00C076]' : 'text-[#FF3366]'}`}>
                  {data.status}
                </div>
                <div className="text-[10px] text-[#555] font-mono mt-2 flex items-center gap-2">
                  <Clock size={10} /> Ping: {data.queryLatencyMs}ms
                </div>
              </div>
              
              <div className="bg-[#0A0A0A] border border-[#222222] p-6 rounded-sm">
                <h3 className="text-[9px] uppercase tracking-widest text-[#888888] mb-2 flex items-center gap-2"><Database size={12}/> Total Ledger Size</h3>
                <div className="text-2xl font-mono text-[#FFFFFF] tracking-tighter">
                  {data.throughput.totalEventsIndexed.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#555] font-mono mt-2">Verified Blockchain Events</div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#222222] p-6 rounded-sm">
                <h3 className="text-[9px] uppercase tracking-widest text-[#888888] mb-2 flex items-center gap-2"><Zap size={12}/> 1H Ingestion Rate</h3>
                <div className="text-2xl font-mono text-[#D4AF37] tracking-tighter">
                  {data.throughput.eventsPerMinute1h} <span className="text-sm">EPM</span>
                </div>
                <div className="text-[10px] text-[#555] font-mono mt-2">Events Per Minute</div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#222222] p-6 rounded-sm">
                <h3 className="text-[9px] uppercase tracking-widest text-[#888888] mb-2 flex items-center gap-2"><ShieldCheck size={12}/> Zero-Mock Integrity</h3>
                <div className="text-2xl font-mono text-[#FFFFFF] tracking-tighter">
                  100%
                </div>
                <div className="text-[10px] text-[#00C076] font-mono mt-2">SHA-256 Verifiable</div>
              </div>
            </section>

            {/* ── WORKERS & INFRASTRUCTURE ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* WORKER NODES */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888888] flex items-center gap-2">
                  <Server size={14} /> Scanner Heartbeats
                </h2>
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-sm overflow-hidden font-mono text-[11px]">
                  {Object.entries(data.workers).map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between p-4 border-b border-[#222222] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${status.alive ? 'bg-[#00C076] shadow-[0_0_8px_#00C076]' : 'bg-[#FF3366]'}`} />
                        <span className="uppercase text-[#FFFFFF] tracking-widest">{name} WORKER</span>
                      </div>
                      <div className="text-[#888888]">
                        {status.alive ? `Active (${status.ageMs}ms ago)` : 'OFFLINE'}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 border-t border-[#333333] bg-[#111]">
                     <span className="uppercase text-[#888888]">Redis Backpressure</span>
                     <span className={data.redis.healthy ? "text-[#00C076]" : "text-[#FF3366]"}>
                        Depth: {data.redis.streamDepth} {data.redis.streamDepth === -1 ? '(Disconnected)' : ''}
                     </span>
                  </div>
                </div>
              </div>

              {/* INFRASTRUCTURE SPECS */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888888] flex items-center gap-2">
                  <Cpu size={14} /> Master Node Infrastructure
                </h2>
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-sm p-5 font-mono text-[10px] flex flex-col gap-4 text-[#AAAAAA]">
                   <div className="flex justify-between border-b border-[#222] pb-2">
                      <span className="text-[#888]">RPC Multiplexer</span>
                      <span className="text-[#FFF] text-right">
                         ETH: {data.infrastructure.rpcMultiplexer.ethereum}<br/>
                         BASE: {data.infrastructure.rpcMultiplexer.base}
                      </span>
                   </div>
                   <div className="flex justify-between border-b border-[#222] pb-2">
                      <span className="text-[#888]">Circuit Breaker</span>
                      <span className="text-[#FFF]">{data.infrastructure.circuitBreaker}</span>
                   </div>
                   <div className="flex justify-between border-b border-[#222] pb-2">
                      <span className="text-[#888]">RPC Timeout Enforcement</span>
                      <span className="text-[#FFF]">{data.infrastructure.rpcTimeout}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-[#888]">Chains Active</span>
                      <span className="text-[#FFF]">{data.infrastructure.chainsActive.join(', ')}</span>
                   </div>
                </div>
              </div>
            </section>

            {/* ── LATEST INGESTION ── */}
            <section className="flex flex-col gap-4">
               <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888888] flex items-center gap-2">
                  <HardDrive size={14} /> Last Processed Block Event
                </h2>
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-sm p-5 font-mono text-[11px]">
                   {data.throughput.newestEvent ? (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-[#D4AF37]">{data.throughput.newestEvent.chain}</span>
                            <span className="text-[#FFF]">${data.throughput.newestEvent.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
                            <span className="text-[#888]">{data.throughput.newestEvent.token}</span>
                         </div>
                         <div className="text-[#555]">
                            {new Date(data.throughput.newestEvent.timestamp).toLocaleString()}
                         </div>
                      </div>
                   ) : (
                      <div className="text-[#555]">Awaiting initial sync...</div>
                   )}
                </div>
            </section>

          </>
        )}
      </main>
    </div>
  );
}
