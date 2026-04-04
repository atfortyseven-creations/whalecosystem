"use client";

import { useState } from 'react';
import { Search, Bell, Clock, Eye, Settings, User, Wallet } from 'lucide-react';
import { useNativeWallet } from '@/hooks/useNativeWallet';

export default function InstitutionalHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { address, isConnecting, connect, disconnect, formatAddress } = useNativeWallet();

  const handleMenuAction = async (actionId: string, payload?: any) => {
    try {
      const res = await fetch('/api/institutional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionId, payload }),
      });
      const data = await res.json();
      console.log('Institutional Action:', data.message);
      setActiveMenu(null);
    } catch (e) {
      console.error('Failed to communicate with the Sovereign backend.', e);
    }
  };

  return (
    <div className="w-full flex flex-col font-serif uppercase tracking-widest text-[10px] text-[#1a1a1a] bg-[#ebe6db] border-b border-black/10 relative z-50">
      
      {/* Layer 1: Institutional Menu & Connection Status */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-black/5">
        <div className="flex items-center gap-6 font-bold">
          <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
            <button 
              onMouseEnter={() => setActiveMenu('file')}
              className="hover:text-black hover:opacity-100 opacity-70 transition-opacity"
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#f5f2eb] border border-black/10 shadow-2xl py-2 z-50 rounded-sm">
                <button onClick={() => handleMenuAction('file_save')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Save State</button>
                <button onClick={() => handleMenuAction('file_export')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Export Matrix</button>
              </div>
            )}
          </div>
          
          <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
            <button 
              onMouseEnter={() => setActiveMenu('edit')}
              className="hover:text-black hover:opacity-100 opacity-70 transition-opacity"
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#f5f2eb] border border-black/10 shadow-2xl py-2 z-50 rounded-sm">
                <button onClick={() => handleMenuAction('edit_preferences')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Preferences</button>
              </div>
            )}
          </div>

          <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
             <button 
               onMouseEnter={() => setActiveMenu('view')}
               className="hover:text-black hover:opacity-100 opacity-70 transition-opacity"
             >
               View
             </button>
             {activeMenu === 'view' && (
               <div className="absolute top-full left-0 mt-1 w-48 bg-[#f5f2eb] border border-black/10 shadow-2xl py-2 z-50 rounded-sm">
                 <button onClick={() => handleMenuAction('view_toggle_mode', 'institutional')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Institutional Mode</button>
                 <button onClick={() => handleMenuAction('view_toggle_mode', 'standard')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Standard Mode</button>
               </div>
             )}
          </div>

          <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
             <button 
               onMouseEnter={() => setActiveMenu('analytics')}
               className="hover:text-black hover:opacity-100 opacity-70 transition-opacity"
             >
               Analytics
             </button>
             {activeMenu === 'analytics' && (
               <div className="absolute top-full left-0 mt-1 w-48 bg-[#f5f2eb] border border-black/10 shadow-2xl py-2 z-50 rounded-sm">
                 <button onClick={() => handleMenuAction('analytics_generate')} className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors">Run Deep Quantum Scan</button>
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="text-black/60">ID: 0X7683...784A</span>
          <span className="text-pink-500 tracking-widest text-[10px]">CONNECTED</span>
        </div>
      </div>

      {/* Layer 2: Core Navigation & Utilities */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">✧</span>
            <span className="font-serif text-xl font-black tracking-normal">SOVEREIGN NETWORK</span>
          </div>
          <nav className="flex items-center gap-8 font-bold opacity-80">
            <button className="hover:text-black hover:opacity-100 transition-opacity text-pink-500">LIVE FEED</button>
            <button className="hover:text-black hover:opacity-100 transition-opacity">NETWORK</button>
            <button className="hover:text-black hover:opacity-100 transition-opacity">PORTFOLIO</button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 opacity-60">
            <Search size={16} className="hover:opacity-100 cursor-pointer" />
            <div className="relative">
              <Bell size={16} className="hover:opacity-100 cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full border border-black/10">
              <span className="text-[9px] font-bold">EUR</span>
              <Settings size={12} />
            </div>
            <Clock size={16} className="hover:opacity-100 cursor-pointer" />
            <Bell size={16} className="hover:opacity-100 cursor-pointer" />
            <Eye size={16} className="hover:opacity-100 cursor-pointer" />
            <Settings size={16} className="hover:opacity-100 cursor-pointer" />
          </div>

          {address ? (
            <div 
              onClick={disconnect}
              className="flex items-center gap-3 bg-[#e0ff00] px-4 py-2 rounded-full border border-black/10 shadow-sm cursor-pointer hover:bg-[#d6f500] transition-colors"
            >
              <div className="flex flex-col text-right">
                 <span className="font-mono font-bold text-[10px] leading-tight text-black">{formatAddress(address)}</span>
                 <span className="font-bold text-[8px] leading-tight text-black/60">SOVEREIGN CONNECTED</span>
              </div>
              <div className="bg-black/10 p-1.5 rounded-full">
                 <User size={14} className="text-black" />
              </div>
            </div>
          ) : (
            <button 
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-[#722ED1] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#B37FEB] transition-all disabled:opacity-50"
            >
              {isConnecting ? <Clock size={16} className="animate-spin" /> : <Wallet size={16} />}
              <span>{isConnecting ? 'Bridging...' : 'Connect Node'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer 3: Global Metrics Bar */}
      <div className="flex items-center gap-12 px-6 py-2 font-bold font-sans overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-2">
            <span className="text-black/60">GLOBAL LIQUIDITY</span>
            <span className="text-black mr-1">$4.2B</span>
            <span className="text-green-500">+0.8%</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-black/60">TOTAL VOLUME</span>
            <span className="text-black">$4.2B</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-black/60">ACTIVE WHALES</span>
            <span className="text-black">1,240</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-black/60">NETWORK PULSE</span>
            <span className="text-[#e0ff00]">99.9%</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-black/60">VOLUME MOMENTUM</span>
            <span className="text-pink-500">HIGH</span>
        </div>
      </div>
    </div>
  );
}
