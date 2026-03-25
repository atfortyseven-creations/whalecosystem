"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Globe, ShieldCheck, Layers, 
  User, Search, ChevronLeft, ChevronRight, RotateCcw, Fingerprint, 
  Terminal, ShieldAlert, Cpu, Database
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';

interface Tab {
  id: number;
  title: string;
  url: string;
  status: 'idle' | 'loading' | 'secure' | 'error';
  favicon?: string;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [isCwiCollapsed, setIsCwiCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 0, title: 'Network Hub', url: 'aztek://hub', status: 'secure' }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addTab = () => {
    const nextId = tabs.length > 0 ? Math.max(...tabs.map((item: Tab) => item.id)) + 1 : 0;
    setTabs([...tabs, { 
      id: nextId, 
      title: 'New Identity', 
      url: 'about:blank',
      status: 'idle'
    }]);
    setActiveTab(nextId);
  };

  const removeTab = (id: number) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t: Tab) => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
       const remainingTab = newTabs[0];
       if (remainingTab) setActiveTab(remainingTab.id);
    }
  };

  if (!mounted) return <LegendaryLoader title="CWI Substrate" subtitle="Initializing SirDeggen Edition..." />;

  const activeTabData = tabs.find((t: Tab) => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] w-full overflow-hidden text-[var(--aztec-ink)] font-aztec-mono selection:bg-[var(--aztec-orchid)]/30">
      
      {/* ── SIRDEGGEN EDITION: BROWSER CHROME ── */}
      <div className="flex items-center gap-1 bg-black/40 px-2 pt-2 border-b border-white/5 overflow-x-auto no-scrollbar backdrop-blur-3xl">
        {tabs.map((tab: Tab) => (
          <motion.div 
            layout
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-3 px-6 py-2.5 rounded-t-2xl cursor-pointer transition-all duration-300 min-w-[160px] max-w-[240px] truncate ${
              activeTab === tab.id 
              ? 'bg-[var(--aztec-parchment)]/10 border-t border-x border-white/10 text-white shadow-[0_-5px_20px_-5px_rgba(209,37,199,0.2)]' 
              : 'hover:bg-white/5 text-white/40'
            }`}
          >
            {tab.status === 'secure' ? (
              <ShieldCheck size={12} className="text-[var(--aztec-chartreuse)]" />
            ) : (
              <Globe size={12} className="opacity-40" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest truncate">{tab.title}</span>
            <button 
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); removeTab(tab.id); }} 
              className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-all"
            >
              <X size={10} />
            </button>
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--aztec-orchid)]" />
            )}
          </motion.div>
        ))}
        <button 
          onClick={addTab}
          className="p-3 text-white/40 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* ── COSMIC ADDRESS BAR ── */}
      <div className="flex items-center gap-4 px-6 py-4 bg-black/60 border-b border-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-5 text-white/30">
          <ChevronLeft size={18} className="hover:text-white cursor-pointer" />
          <ChevronRight size={18} className="hover:text-white cursor-pointer" />
          <RotateCcw size={18} className="hover:text-white cursor-pointer" />
        </div>

        <div className="flex items-center gap-3 px-6 py-2.5 flex-1 bg-black/40 rounded-[1.5rem] border border-white/10 group focus-within:border-[var(--aztec-orchid)]/50 transition-all shadow-inner">
          <Globe size={14} className="text-[var(--aztec-chartreuse)]" />
          <input 
            type="text" 
            value={activeTabData.url}
            readOnly
            className="bg-transparent border-none outline-none text-[11px] text-white/70 w-full font-aztec-mono uppercase tracking-[0.2em]"
          />
          {activeTabData.status === 'secure' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--aztec-chartreuse)]/10 rounded-full border border-[var(--aztec-chartreuse)]/20">
              <ShieldCheck size={10} className="text-[var(--aztec-chartreuse)]" />
              <span className="text-[8px] font-black text-[var(--aztec-chartreuse)] tracking-widest">SECURE</span>
            </div>
          )}
        </div>

        {/* CWI IDENTITY STATUS (SIRDEGGEN EDITION) */}
        <motion.div 
          onClick={() => setIsCwiCollapsed(!isCwiCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-4 px-5 py-2.5 bg-[var(--aztec-orchid)]/10 border border-[var(--aztec-orchid)]/20 rounded-full cursor-pointer hover:bg-[var(--aztec-orchid)]/20 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Fingerprint size={16} className="text-[var(--aztec-orchid)] animate-pulse" />
          <div className="flex flex-col items-start leading-none relative z-10">
            <span className="text-[8px] font-black text-[var(--aztec-orchid)] uppercase tracking-[0.3em]">CWI IDENTITY</span>
            <span className="text-[10px] text-white/60 font-aztec-mono">
              {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'ORPHAN_MODE'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── MAIN BROWSER VIEWPORT ── */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* SIDEBAR: NAVIGATION & PERMISSIONS */}
        <AnimatePresence>
          {!isCwiCollapsed && (
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-black/40 border-r border-white/10 backdrop-blur-3xl p-8 flex flex-col gap-10 overflow-y-auto z-10"
            >
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-[var(--aztec-chartreuse)] uppercase tracking-[0.4em] mb-4">Core Substrate</h3>
                <nav className="flex flex-col gap-3">
                  {[
                    { icon: Terminal, label: 'Execution Engine', active: true },
                    { icon: Database, label: 'Ledger Archival', active: false },
                    { icon: ShieldAlert, label: 'Permissions Matrix', active: false },
                    { icon: Cpu, label: 'Crypto Accelerator', active: false }
                  ].map((item, i) => (
                    <button key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.active ? 'bg-[var(--aztec-chartreuse)]/10 border-[var(--aztec-chartreuse)]/30 text-[var(--aztec-chartreuse)]' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}>
                      <item.icon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-auto p-6 bg-[var(--aztec-orchid)]/5 border border-[var(--aztec-orchid)]/10 rounded-[2rem] text-center">
                <Layers className="mx-auto text-[var(--aztec-orchid)] mb-4" size={24} />
                <p className="text-[9px] font-black text-[var(--aztec-orchid)] uppercase tracking-[0.2em] leading-relaxed">
                  SirDeggen Edition v1.42<br/>
                  <span className="opacity-50 text-[8px]">Aztek Network Certified</span>
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* DYNAMIC CONTENT AREA (8K RENDERED) */}
        <main className="flex-1 overflow-y-auto p-12 relative">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* NETWORK HUB HOME */}
            {activeTabData.url === 'aztek://hub' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                  <div>
                    <h1 className="text-6xl font-aztec-serif font-black text-white uppercase tracking-tighter mb-2">Network <span className="text-[var(--aztec-chartreuse)]">Hub</span></h1>
                    <p className="text-sm font-aztec-mono text-white/40 uppercase tracking-[0.3em]">Universal CWI identity synchronization active.</p>
                  </div>
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center p-4">
                    <img src="/models/update/gradient-pink-diamond-balls-assortment (2).png" className="w-full h-full object-contain" alt="Identity" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { label: 'Total Value Locked', value: '$842.1M', change: '+12.4%', icon: ShieldCheck },
                    { label: 'Identity Clusters', value: '4,281', change: '84 Active', icon: Fingerprint },
                    { label: 'Ledger Latency', value: '0.42ms', change: 'Optimized', icon: RotateCcw }
                  ].map((stat, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl group hover:border-[var(--aztec-orchid)]/30 transition-all">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-white/40 group-hover:text-[var(--aztec-orchid)] transition-colors">
                        <stat.icon size={24} />
                      </div>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{stat.label}</h4>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
                        <span className="text-[10px] font-black text-[var(--aztec-chartreuse)] uppercase">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INSTITUTIONAL PORTFOLIO LIST (8K RENDER) */}
                <div className="space-y-6">
                  <h2 className="text-[12px] font-black text-white uppercase tracking-[0.5em] mb-8">Institutional Asset Ledger</h2>
                  <div className="bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="px-10 py-6 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Asset</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Substrate</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Identity</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { asset: 'BitCoin SV', ticker: 'BSV', network: 'Mainnet', id: 'm/0\'/0\'', value: '2,481.50 BSV' },
                          { asset: 'Aztek Gold', ticker: 'AZG', network: 'Substrate', id: 'm/44\'/1\'', value: '14,000 AZG' },
                          { asset: 'Whale Core', ticker: 'WHC', network: 'Governance', id: 'm/16\'/5\'', value: '1.00 WHC' }
                        ].map((row, i) => (
                          <tr key={i} className="group hover:bg-white/5 transition-colors cursor-pointer">
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-white uppercase tracking-widest">{row.asset}</span>
                                  <span className="text-[9px] text-white/30 font-aztec-mono uppercase">{row.ticker}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <span className="text-[10px] font-black text-[var(--aztec-chartreuse)] uppercase tracking-widest">{row.network}</span>
                            </td>
                            <td className="px-10 py-8 text-white/40 text-[10px] font-aztec-mono">{row.id}</td>
                            <td className="px-10 py-8 text-white font-black text-[12px] tracking-tighter">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Terminal size={48} className="text-white/10 mb-8 animate-pulse" />
                <h2 className="text-2xl font-black text-white/20 uppercase tracking-[0.5em]">Establishing Zero-Trust Handshake...</h2>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
