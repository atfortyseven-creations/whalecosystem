"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, SovereignSettings } from '@/lib/store/useSettingsStore';
import { Sliders, Network, ShieldAlert, Key, Loader2, Check, Zap, Monitor, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'GENERAL SETTINGS', icon: Sliders },
  { id: 'network', label: 'NETWORK & RPC', icon: Network },
  { id: 'sonar', label: 'SONAR ALERTS', icon: ShieldAlert },
  { id: 'privacy', label: 'PRIVACY & SECURITY', icon: Key },
  { id: 'execution', label: 'EXECUTION RULES', icon: Zap },
  { id: 'display', label: 'DISPLAY & HARDWARE', icon: Monitor },
  { id: 'whalechat', label: 'WHALE CHAT ACCOUNT', icon: MessageSquare },
];

export function TerminalSettingsPanel() {
  // Read directly from top-level store state (always has defaults / localStorage values)
  const store = useSettingsStore();
  const { isLoading, updateSetting, fetchSettings } = store;
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Build a settings proxy from the top-level store state
  const settings: SovereignSettings = {
    theme:                store.theme,
    language:             store.language,
    currency:             store.currency,
    timeFormat:           store.timeFormat,
    dateFormat:           store.dateFormat,
    addressFormat:        store.addressFormat,
    density:              store.density,
    defaultTimeframe:     store.defaultTimeframe,
    displayUnit:          store.displayUnit,
    showBalances:         store.showBalances,
    soundEffects:         store.soundEffects,
    hardwareAcceleration: store.hardwareAcceleration,
    gasPreset:            store.gasPreset,
    maxSlippage:          store.maxSlippage,
    customRpcUrl:         store.customRpcUrl,
    mevProtection:        store.mevProtection,
    testnetMode:          store.testnetMode,
    emailAlerts:          store.emailAlerts,
    telegramAlerts:       store.telegramAlerts,
    audioAlerts:          store.audioAlerts,
    whaleAlertThreshold:  store.whaleAlertThreshold,
    email:                store.email,
    inactivityLockMinutes: store.inactivityLockMinutes,
    autoDisconnectTimer:  store.autoDisconnectTimer,
    stealthMode:          store.stealthMode,
    requireSignForExports: store.requireSignForExports,
    allowAnalytics:       store.allowAnalytics,
    chatName:             store.chatName,
    chatBio:              store.chatBio,
    qrLabel:              store.qrLabel,
    hiddenAssets:         store.hiddenAssets,
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  const renderToggle = (key: keyof SovereignSettings, label: string, desc: string) => {
    const isActive = !!settings[key];
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 rounded-2xl hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer select-none" onClick={() => updateSetting(key, !isActive as never)}>
         <div className="flex flex-col pr-4">
            <span className="text-[12px] font-black uppercase tracking-widest text-[#050505] dark:text-white">{label}</span>
            <span className="text-[10px] text-black/40 dark:text-white/40 font-mono mt-1 leading-relaxed">{desc}</span>
         </div>
         <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${isActive ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white dark:bg-[#111111] shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
         </div>
      </div>
    );
  };

  const renderSelect = (key: keyof SovereignSettings, label: string, desc: string, options: {value: string, label: string}[]) => {
    const currentValue = settings[key] as string;
    return (
      <div className="flex flex-col p-4 bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 rounded-2xl">
         <span className="text-[12px] font-black uppercase tracking-widest text-[#050505] dark:text-white mb-1">{label}</span>
         <span className="text-[10px] text-black/40 dark:text-white/40 font-mono mb-4">{desc}</span>
         <div className="flex flex-wrap gap-2">
            {options.map(opt => {
               const isSelected = currentValue === opt.value;
               return (
                  <button 
                    key={opt.value}
                    onClick={() => updateSetting(key, opt.value as never)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-black/50 dark:text-white/50 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'}`}
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
      <div className="flex flex-col p-4 bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 rounded-2xl">
         <span className="text-[12px] font-black uppercase tracking-widest text-[#050505] dark:text-white mb-1">{label}</span>
         <span className="text-[10px] text-black/40 dark:text-white/40 font-mono mb-3">{desc}</span>
         <div className="relative">
            <input 
              type={type}
              value={settings[key] as any}
              onChange={(e) => {
                 let val: any = e.target.value;
                 if (type === 'number') val = parseFloat(val) || 0;
                 updateSetting(key, val as never);
              }}
              className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] font-mono text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
            />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 pointer-events-none">{suffix}</span>}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full bg-[#FAF9F6] dark:bg-[#0A0A0A] min-h-[70vh] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Sidebar */}
      <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col p-6 bg-white dark:bg-[#111111] shrink-0">
         <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
               <Sliders size={14} />
            </div>
            <div className="flex flex-col">
               <span className="text-[13px] font-black uppercase tracking-tighter dark:text-white">Settings</span>
               <span className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">Preferences</span>
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
                   className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'bg-transparent text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
                 >
                    <Icon size={14} className={isActive ? 'text-white dark:text-black' : 'text-black/40 dark:text-white/40'} />
                    {c.label}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 bg-[#FAF9F6] dark:bg-[#0A0A0A] overflow-y-auto max-h-[80vh] custom-scrollbar">
         
         <div className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 dark:text-white">
               {CATEGORIES.find(c => c.id === activeTab)?.label}
            </h2>
            <p className="text-[11px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">
               Manage your terminal configuration and personal preferences.
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
                     {renderSelect('theme', 'Appearance', 'System-wide visual theme.', [
                        {value: 'light', label: 'Light Mode'},
                        {value: 'dark', label: 'Dark Mode'},
                        {value: 'system', label: 'Use System Default'}
                     ])}
                     {renderSelect('language', 'Language', 'Interface display language.', [
                        {value: 'en', label: 'English'},
                        {value: 'es-ES', label: 'Español (ES)'},
                     ])}
                     {renderSelect('currency', 'Base Currency', 'Default currency for balance display.', [
                        {value: 'USD', label: 'USD - Dollar'},
                        {value: 'EUR', label: 'EUR - Euro'},
                        {value: 'GBP', label: 'GBP - Pound'},
                        {value: 'JPY', label: 'JPY - Yen'}
                     ])}
                     {renderSelect('timeFormat', 'Time Format', '12-hour or 24-hour time display.', [
                        {value: '12h', label: '12-Hour (AM/PM)'},
                        {value: '24h', label: '24-Hour'}
                     ])}
                     {renderSelect('dateFormat', 'Date Format', 'Order of day, month and year.', [
                        {value: 'DD/MM/YYYY', label: 'DD/MM/YYYY'},
                        {value: 'MM/DD/YYYY', label: 'MM/DD/YYYY'}
                     ])}
                     {renderSelect('addressFormat', 'Address Display', 'How wallet addresses are shown on screen.', [
                        {value: 'truncated', label: 'Shortened (0x1...ABCD)'},
                        {value: 'full', label: 'Full Address'}
                     ])}
                  </>
               )}

               {activeTab === 'display' && (
                  <>
                     {/* Display settings */}
                     {renderSelect('density', 'Interface Density', 'Amount of spacing and padding in the layout.', [
                        {value: 'relaxed', label: 'Relaxed'},
                        {value: 'compact', label: 'Compact'},
                        {value: 'dense', label: 'Dense'}
                     ])}
                     {renderSelect('defaultTimeframe', 'Default Timeframe', 'Default time range for charts and analytics.', [
                        {value: '1D', label: '24 Hours'},
                        {value: '1W', label: '7 Days'},
                        {value: '1M', label: '30 Days'},
                        {value: 'ALL', label: 'All Time'}
                     ])}
                     {renderSelect('displayUnit', 'Display Unit', 'Show values in fiat or native crypto units.', [
                        {value: 'FIAT', label: 'Fiat Currency'},
                        {value: 'BTC', label: 'Bitcoin (sats)'},
                        {value: 'ETH', label: 'Ethereum (gwei)'}
                     ])}
                     {renderToggle('showBalances', 'Show Balances', 'Display wallet and portfolio balances on screen.')}
                     {renderToggle('soundEffects', 'Sound Effects', 'Play sounds on UI interactions and alerts.')}
                     {renderToggle('hardwareAcceleration', 'GPU Acceleration', 'Use GPU rendering for smoother animations.')}
                  </>
               )}

               {activeTab === 'network' && (
                  <>
                     {/* Network settings */}
                     {renderInput('customRpcUrl', 'Custom RPC Node', 'Override the default JSON-RPC endpoint.', 'text')}
                     {renderToggle('testnetMode', 'Testnet Mode', 'Enable Sepolia and Holesky test networks.')}
                  </>
               )}

               {activeTab === 'execution' && (
                  <>
                     {renderSelect('gasPreset', 'Gas Priority', 'Transaction fee tier for on-chain submissions.', [
                        {value: 'ECONOMY', label: 'Economy'},
                        {value: 'STANDARD', label: 'Standard'},
                        {value: 'FAST', label: 'Fast'},
                        {value: 'INSTANT', label: 'Instant'}
                     ])}
                     {renderInput('maxSlippage', 'Max Slippage', 'Maximum allowed slippage percentage for DEX trades.', 'number', '%')}
                     {renderToggle('mevProtection', 'MEV Protection', 'Route transactions through private relays to prevent sandwich attacks.')}
                  </>
               )}

               {activeTab === 'sonar' && (
                  <>
                     {/* Alerts */}
                     {renderToggle('emailAlerts', 'Email Alerts', 'Receive system alerts via your registered email.')}
                     {renderToggle('telegramAlerts', 'Telegram Alerts', 'Send alerts to your Telegram bot.')}
                     {renderToggle('audioAlerts', 'Audio Alerts', 'Play a sound for large whale movement alerts.')}
                     {renderInput('whaleAlertThreshold', 'Alert Threshold', 'Minimum USD volume to trigger a whale alert.', 'number', 'USD')}
                     {renderInput('email', 'Notification Email', 'Email address for important system notifications.', 'text')}
                  </>
               )}

               {activeTab === 'privacy' && (
                  <>
                     {/* Security */}
                     {renderInput('inactivityLockMinutes', 'Inactivity Lock', 'Minutes of inactivity before the session is locked.', 'number', 'MIN')}
                     {renderSelect('autoDisconnectTimer', 'Auto Disconnect', 'Automatically disconnect wallet after a set period.', [
                        {value: '15m', label: '15 Minutes'},
                        {value: '1h', label: '1 Hour'},
                        {value: '24h', label: '24 Hours'},
                        {value: 'never', label: 'Never'}
                     ])}
                     {renderToggle('stealthMode', 'Stealth Mode', 'Blur all wallet addresses visible on screen.')}
                     {renderToggle('requireSignForExports', 'Sign Before Export', 'Require wallet signature before exporting CSV data.')}
                     {renderToggle('allowAnalytics', 'Allow Analytics', 'Share anonymized usage data to improve the platform.')}
                  </>
               )}

               {activeTab === 'whalechat' && (
                  <>
                     {renderInput('chatName', 'Display Name', 'Your name visible to other users in Whale Chat.', 'text')}
                     {renderInput('chatBio', 'Bio', 'Short description shown on your chat profile.', 'text')}
                     {renderInput('qrLabel', 'QR Code Label', 'Text displayed below your wallet QR code.', 'text')}
                  </>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
