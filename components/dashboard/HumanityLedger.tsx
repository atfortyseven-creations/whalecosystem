"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Network, Shield, Cpu, Database, Globe, Search, RefreshCw, Zap, Eye, Activity, CheckCircle2 } from 'lucide-react';
import { AZTEC_ROADMAP, AztecRoadmapItem } from '@/lib/content/aztecRoadmapData';

// Simulated operational status per phase
function getSimulatedStatus(id: number) {
  if (id <= 10) return { label: 'Verified', color: 'text-green-600', bg: 'bg-green-50' };
  if (id <= 20) return { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (id <= 35) return { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'Planned', color: 'text-slate-400', bg: 'bg-slate-100' };
}

const PhaseIcon = ({ phase }: { phase: number }) => {
  switch (phase) {
    case 1: return <Cpu size={16} className="text-emerald-500" />;
    case 2: return <Eye size={16} className="text-blue-500" />;
    case 3: return <Shield size={16} className="text-amber-500" />;
    case 4: return <Activity size={16} className="text-purple-500" />;
    case 5: return <Globe size={16} className="text-indigo-500" />;
    default: return <Network size={16} />;
  }
};

export default function HumanityLedger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhase, setActivePhase] = useState<number | 'ALL'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const phases = [
    { id: 1, name: "Cryptographic Architecture" },
    { id: 2, name: "Privacy & Identity" },
    { id: 3, name: "Institutional Security" },
    { id: 4, name: "Analytics & Tools" },
    { id: 5, name: "Aztec Ecosystem" }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const filteredRoadmap = useMemo(() => {
    return AZTEC_ROADMAP.filter(item => {
      const matchesPhase = activePhase === 'ALL' || item.phase === activePhase;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.solution.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPhase && matchesSearch;
    });
  }, [activePhase, searchQuery]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-8 bg-white dark:bg-[#0A0A0A] overflow-y-auto no-scrollbar font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="w-full max-w-[1200px] mx-auto mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <Zap size={16} className="text-white dark:text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Protocol Architecture</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            50-point technical specification for the Aztec Network integration. Five implementation phases covering cryptographic infrastructure, privacy, security, analytics, and ecosystem development.
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="w-full max-w-[1200px] mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Phase Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActivePhase('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activePhase === 'ALL' 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                : 'text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All Phases
          </button>
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activePhase === p.id 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                  : 'text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <PhaseIcon phase={p.id} />
              Phase {p.id}
            </button>
          ))}
        </div>

        {/* Search & Sync */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search architecture..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin text-black dark:text-white" : "text-slate-500 dark:text-slate-400"} />
          </button>
        </div>
      </div>

      {/* ROADMAP GRID */}
      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredRoadmap.map((item) => {
          const status = getSimulatedStatus(item.id);
          return (
            <div 
              key={item.id} 
              className="group bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl hover:border-black/20 dark:hover:border-white/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black font-mono text-slate-800 dark:text-slate-200">
                    {item.id}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                    Phase {item.phase}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                  {item.id <= 20 && <CheckCircle2 size={10} />}
                  {status.label}
                </div>
              </div>

              <h3 className="text-base font-bold leading-tight mb-4 text-slate-900 dark:text-white relative z-10">
                {item.title}
              </h3>

              <div className="flex flex-col gap-3 flex-1 relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Technical Problem</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {item.problem}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Architecture Solution</span>
                  <p className="text-xs text-slate-800 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    {item.solution}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 relative z-10 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Database size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-tight">
                    <strong className="text-slate-700 dark:text-slate-300 font-sans uppercase text-[9px] tracking-wider block mb-0.5">Deliverable</strong>
                    {item.deliverable}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-tight">
                    <strong className="text-slate-700 dark:text-slate-300 font-sans uppercase text-[9px] tracking-wider block mb-0.5">System Integrity</strong>
                    {item.integrity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
