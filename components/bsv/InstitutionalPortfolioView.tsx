"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowUpRight, ArrowDownLeft, 
  Scan, Fingerprint, Activity, Zap, 
  ChevronRight, Database, Cpu, Globe
} from 'lucide-react';
import { useCWI } from '@/lib/bsv/CWIContext';
import { InstitutionalHeader } from '../shared/InstitutionalHeader';

import { SendAssetModal } from './SendAssetModal';
import { ReceiveAssetModal } from './ReceiveAssetModal';
import { QrScannerModal } from './QrScannerModal';

import { UtxoManager } from '@/lib/bsv/UtxoManager';

/**
 * INSTITUTIONAL PORTFOLIO VIEW (SIRDEGGEN SUBSTRATE v4)
 * The Astronomically Complex Native UI for BSV Asset Management.
 */
export const InstitutionalPortfolioView = () => {
  const { identity, actions } = useCWI();
  const [activeTab, setActiveTab] = useState('assets');
  const [balance, setBalance] = useState('0.00000000'); 
  const [pulse, setPulse] = useState(false);
  const utxoManager = React.useMemo(() => new UtxoManager(), []);

  // Modal States
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState('');

  // Live Substrate Recovery
  useEffect(() => {
    const fetchProtocolData = async () => {
      if (identity) {
        const address = identity.getAddress();
        const utxos = await utxoManager.getUtxos(address);
        const satoshis = utxos.reduce((acc, u) => acc + u.value, 0);
        setBalance((satoshis / 100000000).toFixed(8));
      }
    };
    
    fetchProtocolData();
    const interval = setInterval(() => {
      setPulse(p => !p);
      fetchProtocolData();
    }, 10000);
    return () => clearInterval(interval);
  }, [identity, utxoManager]);

  const handleScan = (data: string) => {
    setScannedAddress(data);
    setIsSendOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden relative">
      {/* ── BACKGROUND ORCHESTRATION ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,255,43,0.05),transparent_50%)] pointer-events-none" />

      {/* ── TOP DECK: UNIVERSAL BALANCE ── */}
      <section className="px-12 pt-24 pb-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className={`w-1.5 h-1.5 rounded-full ${pulse ? 'bg-[var(--aztec-chartreuse)] shadow-[0_0_10px_var(--aztec-chartreuse)]' : 'bg-white/20'} transition-all duration-1000`} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">CWI Substrate Active</span>
          </div>

          <h1 className="text-8xl md:text-[10rem] font-aztec-serif font-black tracking-tighter leading-none">
            {balance}<span className="text-4xl md:text-6xl text-[var(--aztec-chartreuse)] ml-4">BSV</span>
          </h1>

          <div className="flex gap-8 mt-4 opacity-40">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest">USD Value</span>
              <span className="text-xs font-aztec-mono">$6.42</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest">Network Fee</span>
              <span className="text-xs font-aztec-mono">1 sat/byte</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ACTION NEXUS ── */}
      <section className="flex-1 px-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* CARD 1: ASSET RADAR */}
        <AssetCard 
          title="Asset Radar" 
          subtitle="Real-Time UTXO Matrix" 
          icon={Activity} 
          onClick={() => {}}
        >
          <div className="h-44 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 rounded-full border border-white/5 animate-ping opacity-20" />
               <div className="w-24 h-24 rounded-full border border-[var(--aztec-orchid)]/30 animate-pulse" />
               <div className="w-4 h-4 bg-[var(--aztec-chartreuse)] rounded-full shadow-[0_0_20px_var(--aztec-chartreuse)]" />
            </div>
            <p className="text-[10px] text-white/40 font-aztec-mono uppercase text-center mt-36">Mainnet Node Cluster: Online</p>
          </div>
        </AssetCard>

        {/* CARD 2: COMMAND CENTER */}
        <AssetCard 
          title="Command Center" 
          subtitle="Protocol Operations" 
          icon={Zap}
          highlight
        >
          <div className="grid grid-cols-2 gap-4 mt-6">
            <ActionButton icon={ArrowUpRight} label="Send" onClick={() => setIsSendOpen(true)} />
            <ActionButton icon={ArrowDownLeft} label="Receive" onClick={() => setIsReceiveOpen(true)} />
            <ActionButton icon={Scan} label="Scan" onClick={() => setIsScanOpen(true)} />
            <ActionButton icon={Fingerprint} label="Identity" onClick={() => {}} />
          </div>
        </AssetCard>

        {/* CARD 3: RECENT ACTIVITY */}
        <AssetCard 
          title="Protocol Log" 
          subtitle="Recent Handshakes" 
          icon={Database} 
        >
          <div className="space-y-4 mt-6">
            {actions.length === 0 ? (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[9px] text-white/30 italic">Protocol handshake empty...</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="h-full w-1/2 bg-[var(--aztec-chartreuse)]/20" />
                </div>
              </div>
            ) : (
              actions.slice(0, 4).map((act, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-[var(--aztec-orchid)] tracking-widest">{act.type}</span>
                    <span className="text-[10px] opacity-60 truncate w-32 font-aztec-mono">{act.id}</span>
                  </div>
                  <ChevronRight size={12} className="opacity-20" />
                </div>
              ))
            )}
          </div>
        </AssetCard>
      </section>

      {/* ── MODAL OVERLAYS ── */}
      <SendAssetModal 
        isOpen={isSendOpen} 
        onClose={() => { setIsSendOpen(false); setScannedAddress(''); }} 
        initialAddress={scannedAddress}
      />
      <ReceiveAssetModal 
        isOpen={isReceiveOpen} 
        onClose={() => setIsReceiveOpen(false)} 
      />
      <QrScannerModal 
        isOpen={isScanOpen} 
        onClose={() => setIsScanOpen(false)} 
        onScan={handleScan}
      />

      {/* ── FOOTER STATUS ── */}
      <footer className="px-12 py-8 flex justify-between items-center opacity-40">
        <div className="flex gap-4">
          <Globe size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Mainnet v1.42.0</span>
        </div>
        <div className="flex gap-2 items-center">
           <Cpu size={14} />
           <span className="text-[9px] font-black uppercase tracking-widest">Hardware-Accelerated Shield</span>
        </div>
      </footer>
    </div>
  );
};

const AssetCard = ({ title, subtitle, icon: Icon, children, highlight, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`p-8 rounded-[3rem] cursor-pointer border transition-all duration-500 overflow-hidden relative group
      ${highlight ? 'bg-white/10 border-white/20 shadow-2xl' : 'bg-white/[0.03] border-white/5 hover:bg-white/5'}
    `}
  >
    <div className="flex justify-between items-start mb-8">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--aztec-chartreuse)] mb-1 opacity-60">
          {subtitle}
        </span>
        <h3 className="text-xl font-aztec-serif font-black uppercase leading-tight tracking-tight">
          {title}
        </h3>
      </div>
      <Icon className={`opacity-40 group-hover:text-[var(--aztec-chartreuse)] group-hover:opacity-100 transition-colors duration-500`} size={24} />
    </div>
    {children}
  </motion.div>
);

const ActionButton = ({ icon: Icon, label }: any) => (
  <button className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-[var(--aztec-chartreuse)] hover:text-black transition-all group">
    <Icon size={20} className="mb-2 opacity-60 group-hover:opacity-100" />
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
