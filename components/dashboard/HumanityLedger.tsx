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
    // Only show spinner on first load or when clicking Refresh manually
    if (!data || isManual) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch('/api/humanity-ledger');
      const json = await res.json();
      if (json && json.ok) {
        setData({ 
          blocks: Array.isArray(json.blocks) ? json.blocks : [], 
          stats: json.stats || {} 
        });
      } else {
        setError("Error loading data from the local indexer.");
      }
    } catch {
      setError("Network error connecting to the indexer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 12000); // silent background refresh every block time
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (timestamp: unknown) => {
    try {
      if (!timestamp) return "N/A";
      const seconds = Number(timestamp);
      if (isNaN(seconds)) return "N/A";
      return new Date(seconds * 1000).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  const formatTxValue = (val: unknown) => {
    try {
      if (val === undefined || val === null) return "0.0000";
      const bigIntValue = BigInt(String(val));
      return Number(formatEther(bigIntValue)).toFixed(4);
    } catch {
      return "0.0000";
    }
  };

  // Real-time client-side safe filtering for blocks and nested transactions
  const filteredBlocks = data?.blocks?.filter((block: Record<string, unknown>) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    
    const blockId = String(block.id || '').toLowerCase();
    const blockHash = String(block.hash || '').toLowerCase();
    const miner = String(block.miner || '').toLowerCase();
    
    if (blockId.includes(query) || blockHash.includes(query) || miner.includes(query)) {
      return true;
    }
    
    const txs = Array.isArray(block.transactions) ? block.transactions : [];
    return txs.some((tx: unknown) => {
      if (!tx || typeof tx !== 'object') return false;
      const txObj = tx as Record<string, unknown>;
      const from = String(txObj.from || '').toLowerCase();
      const to = String(txObj.to || '').toLowerCase();
      const hash = String(txObj.hash || '').toLowerCase();
      return from.includes(query) || to.includes(query) || hash.includes(query);
    });
  }) || [];

  return (
    <div 
      className="w-full h-full min-h-0 flex flex-col items-center justify-start p-6 md:p-12 lg:p-16 text-black font-sans overflow-y-auto no-scrollbar relative bg-[#FFFFFF]"
      style={{
        backgroundImage: "url('/aztec_x_whale_partnership.svg')",
        backgroundPosition: 'center',
        backgroundSize: 'min(900px, 85%)',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Semi-translucent Glassmorphism Container Card ("El Botón") */}
      <div className="w-full max-w-[1400px] bg-white/70 backdrop-blur-2xl border border-slate-200/50 rounded-[2.5rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.06)] p-8 md:p-12 lg:p-16 flex flex-col hover:bg-white/75 transition-all duration-500 z-10 mx-auto">
        
        {/* Header */}
        <div className="w-full flex-shrink-0 border-b border-slate-200/60 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-900">
                Humanity Ledger
              </h1>
              <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Aztec Network × Whale Alert Network Indexer
              </span>
            </div>
            <button 
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-slate-950 text-white rounded-xl font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
          <p className="mt-4 text-slate-500 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
            A real-time database of all blockchain transactions. Stored locally, cleared weekly to ensure optimal speed and storage efficiency.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:bg-white/50 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Blocks Stored</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">{Number(data?.stats?.totalBlocks || 0)}</span>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/20">
              <Database size={24} className="text-slate-800" />
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md border border-slate-200/40 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:bg-white/50 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Transactions Stored</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">{Number(data?.stats?.totalTransactions || 0)}</span>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/20">
              <Clock size={24} className="text-slate-800" />
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search block number or transaction hash..." 
            className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white/80 transition-all text-sm font-medium shadow-sm placeholder:text-slate-400"
          />
        </div>

        {/* Content */}
        <div className="w-full flex-1">
          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          {!data && loading && (
            <div className="py-20 text-center text-slate-400 font-mono text-xs tracking-widest uppercase">
              Loading ledger data...
            </div>
          )}

          {data && filteredBlocks.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-mono text-xs tracking-wider uppercase">
              No matching records found.
            </div>
          )}

          <div className="flex flex-col gap-6">
            {filteredBlocks.map((block: Record<string, unknown>) => (
              <div key={String(block.hash || block.id || Math.random())} className="bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                
                {/* Block Title/Meta Row */}
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-base font-bold tracking-tight text-slate-800">Block #{String(block.id || 'N/A')}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{formatDate(block.timestamp)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-1.5">Validator:</span> 
                      <span className="font-mono bg-white/60 px-2 py-0.5 rounded border border-slate-200/30 text-[11px] text-slate-700">
                        {block.miner ? `${String(block.miner).slice(0, 8)}...${String(block.miner).slice(-6)}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-1.5">Transactions:</span> 
                      <span className="bg-white/60 px-2.5 py-0.5 rounded-full border border-slate-200/30 text-[11px] text-slate-700 font-bold">
                        {String(block.txCount || '0')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Block Transactions List */}
                <div className="divide-y divide-slate-100/50">
                  {(Array.isArray(block.transactions) ? block.transactions : []).map((tx: unknown) => {
                    if (!tx || typeof tx !== 'object') return null;
                    const txObj = tx as Record<string, unknown>;
                    return (
                      <div key={String(txObj.hash || Math.random())} className="p-4 px-6 hover:bg-white/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col w-full sm:w-1/2 gap-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] w-10">From</span>
                            <span className="font-mono text-slate-700 truncate">{String(txObj.from || 'N/A')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] w-10">To</span>
                            <ArrowRight size={12} className="text-slate-300 shrink-0" />
                            <span className="font-mono text-slate-700 truncate">{String(txObj.to || 'N/A')}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end w-full sm:w-1/3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Value Transferred</span>
                          <span className="font-black text-slate-900 text-sm">{formatTxValue(txObj.value)} ETH</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!Array.isArray(block.transactions) || block.transactions.length === 0) && (
                    <div className="p-6 text-center text-xs text-slate-400 font-medium font-mono">
                      No high-value transactions found in this block.
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
