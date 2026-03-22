"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Terminal, Database, Sparkles, LayoutGrid, Flame, Shield, LockKeyhole, Plus, Settings2, ScanLine, Activity, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ContextMenu from '@/components/premium/ContextMenu';

import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useMarketStore } from '@/store/useMarketStore';
import { useGodView } from '@/hooks/useGodView';
import { PremiumToasts } from '@/components/premium/ToastManager';
import { useAccount } from 'wagmi';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';

import LiquidationHeatmap from '@/components/premium/LiquidationHeatmap';
import AztecPrivacyHub from '@/components/premium/AztecPrivacyHub';

type TabType = 'canvas' | 'variables' | 'logs' | 'heatmap' | 'privacy' | 'scanner';

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<TabType>('canvas');
  
  // Real Wagmi verification: user must have an active wallet connection.
  const { isConnected } = useAccount();
  const isPremium = isConnected;

  useGodView();
  useBinanceWebSocket('btcusdt');
  const currentPrice = useMarketStore(state => state.currentPrice);
  
  // Live Telemetry Stream
  const { unifiedWhaleFeed } = useWhaleFeed();

  const [projects, setProjects] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Live ZK Scanner State
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [isScannerPolling, setIsScannerPolling] = useState(false);
  const [scannerSuccess, setScannerSuccess] = useState(false);

  const tabs = [
    { id: 'canvas' as const, label: 'Ecosystem Canvas', icon: LayoutGrid },
    { id: 'variables' as const, label: 'Environment', icon: Database },
    { id: 'logs' as const, label: 'Live Telemetry', icon: Terminal },
    { id: 'scanner' as const, label: 'ZK Scanner API', icon: ScanLine },
    { id: 'heatmap' as const, label: 'Heatmap', icon: Flame },
    { id: 'privacy' as const, label: 'Aztec Shield', icon: Shield },
  ];

  const fetchProjects = async () => {
    try { const res = await fetch('/api/projects'); setProjects(await res.json()); } catch(e){}
  };
  const fetchVariables = async () => {
    try { const res = await fetch('/api/variables'); setVariables(await res.json()); } catch(e){}
  };

  useEffect(() => {
    fetchProjects();
    fetchVariables();
  }, []);

  // Legendary Functionality: Live ZK Session Sync
  useEffect(() => {
    if (activeTab === 'scanner' && !qrSession && !scannerSuccess) {
        const initQr = async () => {
            try {
                const res = await fetch('/api/auth/qr-session', { method: 'POST' });
                const data = await res.json();
                if (data.sessionId) {
                    setQrSession(data.sessionId);
                    setIsScannerPolling(true);
                }
            } catch(e) {}
        };
        initQr();
    }
  }, [activeTab, qrSession, scannerSuccess]);

  useEffect(() => {
      if (!isScannerPolling || !qrSession) return;
      const interval = setInterval(async () => {
          try {
              const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
              const data = await res.json();
              if (data.status === 'complete') {
                  clearInterval(interval);
                  setScannerSuccess(true);
                  setIsScannerPolling(false);
              } else if (data.status === 'expired' || data.status === 'error') {
                  clearInterval(interval);
                  setQrSession(null);
                  setIsScannerPolling(false);
              }
          } catch (e) {}
      }, 2000);
      return () => clearInterval(interval);
  }, [isScannerPolling, qrSession]);


  const handleCreateProject = async () => {
    if(!newProjectName) return;
    await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: newProjectName })
    });
    setNewProjectName("");
    setIsCreating(false);
    fetchProjects();
  };

  const handleDeleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    fetchProjects();
  };

  return (
    <ContextMenu>
      <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-[#e0ff00] selection:text-black">
        {/* Railway-style grid background */}
        <div className="absolute inset-0 bg-[url('https://railway.app/illustrations/grid.svg')] bg-center opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#b37feb]/10 via-[#0a051a]/50 to-transparent blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 pt-12">
          {/* Header */}
          <header className="flex items-end justify-between mb-12 relative z-10 border-b border-white/10 pb-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center shadow-2xl border border-white/20">
                <Crown size={24} className="text-[#e0ff00]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-1 flex items-center gap-3">
                  System Infrastructure
                  <span className="text-[10px] font-mono bg-[#e0ff00]/10 text-[#e0ff00] px-2 py-1 rounded-md border border-[#e0ff00]/30 shadow-[0_0_15px_rgba(224,255,0,0.2)]">LIVE & ACTIVE</span>
                </h1>
                <div className="flex items-center gap-4 text-sm font-mono text-white/40">
                  <span>us-east-1 (Ethereum Mainnet)</span>
                  {currentPrice > 0 && (
                    <span className="text-[#e0ff00]">
                      BTC_USD: {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8 relative z-10">
            {/* Sidebar Navigation (Railway-style) */}
            <div className="col-span-12 md:col-span-3">
              <nav className="space-y-1 sticky top-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                        isActive 
                          ? 'bg-white/10 text-white font-bold translate-x-1 border-l-2 border-[#e0ff00]' 
                          : 'hover:bg-white/5 text-white/50 hover:text-white/80 font-medium'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-[#e0ff00]' : ''} />
                      <span className="tracking-wide">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 md:col-span-9 bg-[#0c0c0c] border border-white/10 rounded-2xl min-h-[600px] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e0ff00]/50 to-transparent" />
              
              <AnimatePresence mode="wait">
                {activeTab === 'canvas' && (
                  <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-bold flex items-center gap-2"><LayoutGrid size={20}/> Projects Registry</h2>
                      <button onClick={() => setIsCreating(true)} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                        <Plus size={16} /> Deploy Registry
                      </button>
                    </div>

                    {isCreating && (
                      <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                        <input 
                          type="text" 
                          placeholder="e.g. WHALE-BTC-PREDICT" 
                          className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#e0ff00] w-64"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        <button onClick={handleCreateProject} className="bg-[#e0ff00] text-black px-4 py-2 rounded-lg text-sm font-bold">Deploy DB Sync</button>
                        <button onClick={() => setIsCreating(false)} className="text-white/50 text-sm hover:text-white">Cancel</button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((p) => (
                        <div key={p.id} className="group p-6 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl transition-all relative overflow-hidden">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg">{p.name}</h3>
                            <button onClick={() => handleDeleteProject(p.id)} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Untrack</button>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-xs font-mono text-cyan-400">DB REGISTRATION OK</span>
                          </div>
                          <div className="w-full bg-black/50 rounded-lg p-3 text-xs font-mono text-white/50">
                            ID: {p.id.split('-')[0]}...
                          </div>
                        </div>
                      ))}
                      {projects.length === 0 && !isCreating && (
                        <div className="col-span-2 text-center py-20 text-white/30 font-mono border border-dashed border-white/10 rounded-xl">
                          No database projects found. Register a new name to track it on postgres.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'variables' && (
                  <motion.div key="variables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                     <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-bold flex items-center gap-2"><Database size={20}/> Locked Environment Vars</h2>
                    </div>
                    {/* Read-only viewer */}
                    <div className="text-white/40 font-mono text-sm space-y-4">
                        {variables.map(v => (
                            <div key={v.id} className="flex gap-4 items-center bg-black/40 p-4 rounded-lg border border-white/5">
                                <span className="text-[#e0ff00] w-1/3">{v.key}</span>
                                <span className="text-white">{v.value}</span>
                            </div>
                        ))}
                        {variables.length === 0 && <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">No variables defined globally. API read-only.</div>}
                    </div>
                  </motion.div>
                )}

                {/* Legendary Functionality: Real-Time WebSockets Feed */}
                {activeTab === 'logs' && (
                  <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-0 h-full flex flex-col">
                     <div className="p-4 border-b border-white/10 bg-black/60 flex items-center justify-between text-xs font-mono text-[#e0ff00]">
                         <div className="flex items-center gap-2">
                             <Terminal size={14} /> LIVE_TELEMETRY_STREAM_CONNECTED
                         </div>
                         <div className="flex items-center gap-2 animate-pulse">
                             <div className="w-2 h-2 rounded-full bg-[#e0ff00]"></div> LISTENING
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs max-h-[500px]">
                         {unifiedWhaleFeed.slice(0, 50).map(log => (
                             <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-white/5 pb-2">
                                 <span className="text-blue-400 shrink-0">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}]</span>
                                 <span className={log.action === 'SELL' ? 'text-red-400 shrink-0' : log.action === 'BUY' ? 'text-emerald-400 shrink-0' : 'text-[#e0ff00] shrink-0'}>[{log.chain}]</span>
                                 <span className="text-white">Detected transfer: {log.amount.toLocaleString(undefined, {maximumFractionDigits: 1})} {log.asset} <span className="text-white/40">(${log.usdNum.toLocaleString()})</span></span>
                                 <span className="text-white/20 truncate hidden sm:block">HASH: {log.hash}</span>
                             </motion.div>
                         ))}
                         {unifiedWhaleFeed.length === 0 && <span className="text-white/20 animate-pulse">Waiting for oceanic quantum telemetry...</span>}
                     </div>
                  </motion.div>
                )}

                {/* Legendary Functionality: Live ZK Scanner Polling */}
                {activeTab === 'scanner' && (
                  <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 flex flex-col items-center justify-center min-h-[500px] gap-12">
                     {scannerSuccess ? (
                         <div className="text-center space-y-6 flex flex-col items-center">
                             <div className="w-24 h-24 rounded-full bg-[#e0ff00]/20 flex items-center justify-center border border-[#e0ff00]">
                                 <CheckCircle2 size={40} className="text-[#e0ff00]" />
                             </div>
                             <div>
                                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-[#e0ff00]">Sync Established</h3>
                                 <p className="text-sm text-white/50 font-sans mt-2">Mobile node linked to master terminal logically. Device handshake complete.</p>
                             </div>
                         </div>
                     ) : (
                        <>
                            <div className="text-center space-y-4 max-w-sm">
                               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Live Mobile Link</h3>
                               <p className="text-sm text-[#A3A6AF] font-sans">Open Sovereign Companion on your mobile device and scan this live API endpoint to link your session natively.</p>
                            </div>

                            <div className="w-80 h-80 border-2 border-dashed border-[#e0ff00]/30 rounded-[3rem] flex items-center justify-center relative bg-black/50 backdrop-blur-md p-10">
                                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#e0ff00] rounded-tl-[2rem] m-6" />
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#e0ff00] rounded-tr-[2rem] m-6" />
                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#e0ff00] rounded-bl-[2rem] m-6" />
                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#e0ff00] rounded-br-[2rem] m-6" />
                                
                                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                                   {qrSession ? (
                                       <QRCodeSVG 
                                          value={qrSession} 
                                          size={200} 
                                          level="H"
                                          fgColor="#000000"
                                          bgColor="#ffffff"
                                       />
                                   ) : (
                                       <div className="w-[200px] h-[200px] flex items-center justify-center animate-pulse">
                                           <span className="text-[10px] font-mono text-black/40 uppercase text-center leading-loose">Waiting for<br/>Backend Node API...</span>
                                       </div>
                                   )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-mono text-[#e0ff00]/60 uppercase tracking-[0.4em] animate-pulse">
                               <Activity size={14} /> retrieving_live_api &bull; scanning
                            </div>
                        </>
                     )}
                  </motion.div>
                )}

                {activeTab === 'heatmap' && (
                  <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                     <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Flame size={20} className="text-[#e0ff00]"/> Live Orderbook Heatmap</h2>
                     <div className="bg-black/60 rounded-3xl p-2 border border-white/5 shadow-2xl">
                         <LiquidationHeatmap />
                     </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                     <AztecPrivacyHub />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <PremiumToasts />
    </ContextMenu>
  );
}

function Camera(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2-2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> }
