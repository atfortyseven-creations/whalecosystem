"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Plus, 
  X, 
  Globe, 
  ShieldCheck, 
  Layers, 
  ArrowRightLeft,
  Settings,
  User
} from 'lucide-react';

export default function PortfolioPage() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const { isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([{ id: 0, title: 'Network Hub', url: 'aztek://hub' }]);

  useEffect(() => setMounted(true), []);

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { id: newId, title: 'New Tab', url: 'about:blank' }]);
    setActiveTab(newId);
  };

  const removeTab = (id: number) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) setActiveTab(newTabs[0].id);
  };

  if (!mounted || !isLoaded) return <LegendaryLoader title="Synchronizing" subtitle="Encryption Protocol" />;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[var(--aztec-ink)] font-aztec-mono">
      {/* ── BROWSER CHROME: TABSTRIP ── */}
      <div className="flex items-center gap-1 bg-black/10 px-2 pt-2 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-t-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all border-x border-t ${
              activeTab === tab.id ? 'bg-white/10 border-white/10 text-white' : 'text-white/40 border-transparent hover:bg-white/5'
            }`}
          >
            <Layers size={12} className={activeTab === tab.id ? 'text-[#4ade80]' : ''} />
            <span className="truncate max-w-[120px]">{tab.title}</span>
            <X 
              size={12} 
              className="hover:text-white transition-colors" 
              onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }} 
            />
          </div>
        ))}
        <button onClick={addTab} className="p-2 text-white/40 hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>

      {/* ── BROWSER CHROME: ADDRESS BAR ── */}
      <div className="flex items-center gap-4 px-4 py-3 bg-black/5 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-1.5 flex-1 bg-black/20 rounded-lg border border-white/5">
          <Globe size={14} className="text-white/30" />
          <span className="text-xs text-white/60 truncate">{tabs.find(t => t.id === activeTab)?.url}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* CWI IDENTITY STATUS */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-md">
            <ShieldCheck size={14} className="text-[#4ade80]" />
            <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-tighter">CWI SECURED</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <User size={16} />
            <span className="text-[10px]">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'UNKNOWN'}</span>
          </div>
        </div>
      </div>

      {/* ── BROWSER VIEWPORT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 glass-aztek">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* ASSET DATA GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2 text-balance leading-tight">Institutional Balance</div>
              <div className="text-3xl font-bold text-white tracking-tighter">$1,248,592.42</div>
              <div className="text-[9px] text-[#4ade80] font-bold mt-1">+2.45% (24H)</div>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2 text-balance leading-tight">Protocol Exposure</div>
              <div className="text-3xl font-bold text-white tracking-tighter">14 UNITS</div>
              <div className="text-[9px] text-white/40 font-bold mt-1">CROSS-CHAIN SYNCED</div>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2 text-balance leading-tight">Network Health</div>
              <div className="text-3xl font-bold text-[#4ade80] tracking-tighter">EXCELLENT</div>
              <div className="text-[9px] text-[#4ade80] font-bold mt-1">LATENCY: 42MS</div>
            </div>
          </div>

          {/* EF-TRANSACTION LEDGER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <ArrowRightLeft size={18} className="text-white/60" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Extended Format Ledger</h2>
              </div>
              <span className="text-[10px] text-white/20 uppercase tracking-[0.4em]">Confirmed Layers</span>
            </div>
            
            <div className="space-y-px">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group grid grid-cols-4 items-center gap-4 px-4 py-5 bg-white/[0.02] hover:bg-white/[0.05] transition-all border-b border-white/5">
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs font-bold text-white/80 group-hover:text-[#4ade80] transition-colors truncate">0xbf5...9c7e</span>
                    <span className="text-[9px] text-white/20 uppercase tracking-widest">LAYER 1 BROADCAST</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">+0.428 ETH</span>
                    <span className="text-[9px] text-white/30 tracking-widest uppercase">CONSOLIDATED</span>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-white/40 font-bold uppercase tracking-widest">
                      BROADCASTED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

