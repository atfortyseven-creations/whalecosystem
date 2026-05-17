"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, SovereignSettings } from '@/lib/store/useSettingsStore';
import { Sliders, Network, ShieldAlert, Key, Loader2, Check, Zap, Monitor, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'AJUSTES GENERALES' },
  { id: 'display', label: 'APARIENCIA' },
  { id: 'privacy', label: 'PRIVACIDAD Y SEGURIDAD' },
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
    <div className="flex flex-col md:flex-row w-full h-full bg-[#FAF9F6] dark:bg-[#0A0A0A] overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col p-6 bg-white dark:bg-[#111111] shrink-0">
         <div className="flex flex-col mb-8 px-2">
            <span className="text-[13px] font-black uppercase tracking-tighter dark:text-white">Ajustes</span>
            <span className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">Preferencias</span>
         </div>

         <div className="flex flex-col gap-2">
            {CATEGORIES.map(c => {
               const isActive = activeTab === c.id;
               return (
                 <button 
                   key={c.id} 
                   onClick={() => setActiveTab(c.id)}
                   className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'bg-transparent text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
                 >
                    {c.label}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 bg-[#FAF9F6] dark:bg-[#0A0A0A] overflow-y-auto h-full custom-scrollbar">
         
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
                     {renderSelect('language', 'Idioma', 'Idioma de visualización de la interfaz.', [
                        {value: 'en', label: 'Inglés'},
                        {value: 'es-ES', label: 'Español (ES)'},
                     ])}
                     {renderSelect('currency', 'Moneda Base', 'Moneda predeterminada para el balance.', [
                        {value: 'USD', label: 'USD - Dólar'},
                        {value: 'EUR', label: 'EUR - Euro'},
                        {value: 'GBP', label: 'GBP - Libra'},
                        {value: 'JPY', label: 'JPY - Yen'}
                     ])}
                     {renderSelect('timeFormat', 'Formato de Tiempo', 'Visualización de la hora.', [
                        {value: '12h', label: '12 Horas (AM/PM)'},
                        {value: '24h', label: '24 Horas'}
                     ])}
                     {renderSelect('dateFormat', 'Formato de Fecha', 'Orden de día, mes y año.', [
                        {value: 'DD/MM/YYYY', label: 'DD/MM/YYYY'},
                        {value: 'MM/DD/YYYY', label: 'MM/DD/YYYY'}
                     ])}
                     {renderSelect('addressFormat', 'Formato de Dirección', 'Cómo se muestran las direcciones.', [
                        {value: 'truncated', label: 'Abreviada (0x1...ABCD)'},
                        {value: 'full', label: 'Dirección Completa'}
                     ])}
                  </>
               )}

               {activeTab === 'display' && (
                  <>
                     {renderSelect('theme', 'Apariencia', 'Tema visual general.', [
                        {value: 'light', label: 'Modo Claro'},
                        {value: 'dark', label: 'Modo Oscuro'},
                        {value: 'system', label: 'Usar Configuración del Sistema'}
                     ])}
                     {renderSelect('density', 'Densidad', 'Espaciado de la interfaz.', [
                        {value: 'relaxed', label: 'Relajado'},
                        {value: 'compact', label: 'Compacto'},
                        {value: 'dense', label: 'Denso'}
                     ])}
                     {renderToggle('showBalances', 'Mostrar Balances', 'Visualizar balances en pantalla.')}
                     {renderToggle('hardwareAcceleration', 'Aceleración de Hardware', 'Mejor rendimiento visual.')}
                  </>
               )}

               {activeTab === 'privacy' && (
                  <>
                     {renderInput('inactivityLockMinutes', 'Bloqueo por inactividad', 'Minutos de inactividad antes del bloqueo.', 'number', 'MIN')}
                     {renderToggle('stealthMode', 'Modo Sigiloso', 'Desenfoca todas las direcciones visibles.')}
                     {renderToggle('requireSignForExports', 'Firma para exportar', 'Requiere firma antes de exportar.')}
                  </>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
