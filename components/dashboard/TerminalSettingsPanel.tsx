"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, SovereignSettings } from '@/lib/store/useSettingsStore';
import { Sliders, Network, ShieldAlert, Key, Loader2, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'GENERAL SETTINGS', icon: Sliders },
  { id: 'network', label: 'NETWORK & EXECUTION', icon: Network },
  { id: 'sonar', label: 'SONAR ALERTS', icon: ShieldAlert },
  { id: 'privacy', label: 'PRIVACY & SECURITY', icon: Key },
];

export function TerminalSettingsPanel() {
  const { settings, isLoading, updateSetting, fetchSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading || !settings) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  const renderToggle = (key: keyof SovereignSettings, label: string, desc: string) => {
    const isActive = !!settings[key];
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-black/20 transition-all cursor-pointer select-none" onClick={() => updateSetting(key, !isActive as never)}>
         <div className="flex flex-col pr-4">
            <span className="text-[12px] font-black uppercase tracking-widest text-[#050505]">{label}</span>
            <span className="text-[10px] text-black/40 font-mono mt-1 leading-relaxed">{desc}</span>
         </div>
         <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${isActive ? 'bg-black' : 'bg-black/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
         </div>
      </div>
    );
  };

  const renderSelect = (key: keyof SovereignSettings, label: string, desc: string, options: {value: string, label: string}[]) => {
    const currentValue = settings[key] as string;
    return (
      <div className="flex flex-col p-4 bg-white border border-black/5 rounded-2xl">
         <span className="text-[12px] font-black uppercase tracking-widest text-[#050505] mb-1">{label}</span>
         <span className="text-[10px] text-black/40 font-mono mb-4">{desc}</span>
         <div className="flex flex-wrap gap-2">
            {options.map(opt => {
               const isSelected = currentValue === opt.value;
               return (
                  <button 
                    key={opt.value}
                    onClick={() => updateSetting(key, opt.value as never)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? 'bg-black text-white border-black' : 'bg-transparent text-black/50 border-black/10 hover:border-black/30'}`}
                  >
                     {opt.label}
                  </button>
               )
            })}
         </div>
      </div>
    );
  };

  const renderInput = (key: keyof SovereignSettings, label: string, desc: string, type: 'number' | 'text' = 'text', suffix?: string) => {
    return (
      <div className="flex flex-col p-4 bg-white border border-black/5 rounded-2xl">
         <span className="text-[12px] font-black uppercase tracking-widest text-[#050505] mb-1">{label}</span>
         <span className="text-[10px] text-black/40 font-mono mb-3">{desc}</span>
         <div className="relative">
            <input 
              type={type}
              value={settings[key] as any}
              onChange={(e) => {
                 let val: any = e.target.value;
                 if (type === 'number') val = parseFloat(val) || 0;
                 updateSetting(key, val as never);
              }}
              className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[12px] font-mono focus:border-black focus:outline-none transition-colors"
            />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-black/30 pointer-events-none">{suffix}</span>}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full bg-[#FAF9F6] min-h-[70vh] border border-black/10 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Sidebar */}
      <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-black/10 flex flex-col p-6 bg-white shrink-0">
         <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
               <Sliders size={14} />
            </div>
            <div className="flex flex-col">
               <span className="text-[13px] font-black uppercase tracking-tighter">Settings</span>
               <span className="text-[9px] font-mono text-black/40 uppercase tracking-widest">Terminal Variables</span>
            </div>
         </div>

         <div className="flex flex-col gap-2">
            {CATEGORIES.map(c => {
               const Icon = c.icon;
               const isActive = activeTab === c.id;
               return (
                 <button 
                   key={c.id} 
                   onClick={() => setActiveTab(c.id)}
                   className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-black text-white' : 'bg-transparent text-black/50 hover:bg-black/5 hover:text-black'}`}
                 >
                    <Icon size={14} className={isActive ? 'text-white' : 'text-black/40'} />
                    {c.label}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 bg-[#FAF9F6] overflow-y-auto max-h-[80vh] custom-scrollbar">
         
         <div className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
               {CATEGORIES.find(c => c.id === activeTab)?.label}
            </h2>
            <p className="text-[11px] font-mono text-black/40 uppercase tracking-widest">
               Control the terminal's physical rendering and local memory parameters.
            </p>
         </div>

         <AnimatePresence mode="wait">
            <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
               {activeTab === 'general' && (
                  <>
                     {/* Aesthetics & UI */}
                     {renderSelect('theme', 'Terminal Aesthetic', 'System-wide visual processing matrix.', [
                        {value: 'light', label: 'Ivory Matrix'},
                        {value: 'dark', label: 'Obsidian Void'}
                     ])}
                     {renderSelect('density', 'Interface Density', 'Padding and spacing physics engine.', [
                        {value: 'relaxed', label: 'Relaxed'},
                        {value: 'compact', label: 'Compact'},
                        {value: 'dense', label: 'Dense'}
                     ])}
                     {renderSelect('language', 'Base Dialect', 'Core linguistic output localization.', [
                        {value: 'en', label: 'English'},
                        {value: 'es-ES', label: 'Español (ES)'},
                     ])}
                     {renderSelect('currency', 'Fiat Anchor', 'Base denominator for balance valuations.', [
                        {value: 'USD', label: 'USD - Dollar'},
                        {value: 'EUR', label: 'EUR - Euro'},
                        {value: 'GBP', label: 'GBP - Pound'},
                        {value: 'JPY', label: 'JPY - Yen'}
                     ])}

                     {/* Portfolio Visuals */}
                     {renderSelect('defaultTimeframe', 'Telemetry Range', 'Default horizon for analytics charting.', [
                        {value: '1D', label: '24 Hours'},
                        {value: '1W', label: '7 Days'},
                        {value: '1M', label: '30 Days'},
                        {value: 'ALL', label: 'Genesis'}
                     ])}
                     {renderSelect('displayUnit', 'Absolute Reference Unit', 'Valuation rendered in native asset or fiat.', [
                        {value: 'FIAT', label: 'Fiat Currency'},
                        {value: 'BTC', label: 'Bitcoin (sats)'},
                        {value: 'ETH', label: 'Ethereum (wei)'}
                     ])}
                     {renderToggle('showBalances', 'Hydrate Balances', 'Render absolute balance integers on-screen.')}
                     {renderToggle('soundEffects', 'Haptic Audio', 'Tactile UI sounds on execution events.')}
                  </>
               )}

               {activeTab === 'network' && (
                  <>
                     {/* Execution params */}
                     {renderSelect('gasPreset', 'Inclusion Thermodynamics', 'Gwei priority layer settings for mainnet.', [
                        {value: 'ECONOMY', label: 'Economy'},
                        {value: 'STANDARD', label: 'Standard'},
                        {value: 'FAST', label: 'Fast'},
                        {value: 'INSTANT', label: 'Instant'}
                     ])}
                     {renderInput('maxSlippage', 'Max Tolerable Deflection', 'Slippage threshold percentage for automatic DEX routing.', 'number', '%')}
                     {renderInput('customRpcUrl', 'Sovereign RPC Node', 'Direct endpoint override for JSON-RPC egress.', 'text')}
                     {renderToggle('mevProtection', 'MEV Cloaking (Dark Pool)', 'Route transactions through private relays (e.g. Flashbots) to evade sandwich attacks.')}
                     {renderToggle('testnetMode', 'Testnet Dimensional Bridge', 'Inject Sepolia and Holesky streams into main views.')}
                  </>
               )}

               {activeTab === 'sonar' && (
                  <>
                     {/* Alerts */}
                     {renderToggle('emailAlerts', 'SMTP Ingress', 'Receive catastrophic system reports via registered email.')}
                     {renderToggle('telegramAlerts', 'Telegram Vector', 'Direct pulse notifications to the sovereign Telegram bot.')}
                     {renderInput('whaleAlertThreshold', 'Leviathan Threshold', 'Minimum USD volume required to trigger a terminal-wide global alert.', 'number', 'USD')}
                  </>
               )}

               {activeTab === 'privacy' && (
                  <>
                     {/* Security */}
                     {renderInput('inactivityLockMinutes', 'Dead Man\'s Lock', 'Idle time required before the terminal requests ECDSA re-validation.', 'number', 'MIN')}
                     {renderToggle('stealthMode', 'Visual Cryptography', 'Scramble all on-screen hexadecimal addresses to prevent shoulder-surfing.')}
                     {renderToggle('requireSignForExports', 'Export Sealing', 'Demand cryptographic signature before exporting CSV ledgers to physical disk.')}
                     {renderToggle('allowAnalytics', 'Telemetry Contribution', 'Allow anonymized metadata shipping to refine the Global Hive intelligence.')}
                  </>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
