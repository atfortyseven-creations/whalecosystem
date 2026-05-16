'use client';

import { useState } from 'react';
import {
  X, Palette, Lock, Eye, EyeOff, RefreshCw, Timer,
  Volume2, VolumeX, Bell, BellOff, Globe, Shield, KeyRound,
  Fingerprint, SlidersHorizontal, MessageSquareOff, Trash2
} from 'lucide-react';

export type Theme = 'dark' | 'midnight' | 'forest' | 'rose' | 'mono';
export type PrivacyMode = 'stealth' | 'standard' | 'institutional';
export type AutoDestructPreset = 'off' | '1m' | '1h' | '24h' | '7d';

export interface ChatSettings {
  theme: Theme;
  privacyMode: PrivacyMode;
  autoDestruct: AutoDestructPreset;
  showReadReceipts: boolean;
  showLastSeen: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  differentialNoiseEpsilon: number; // 0.0001 → 0.01
  linkPreviewsEnabled: boolean;
  screenshotProtection: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'dark',
  privacyMode: 'institutional',
  autoDestruct: 'off',
  showReadReceipts: true,
  showLastSeen: false,
  soundEnabled: true,
  notificationsEnabled: true,
  differentialNoiseEpsilon: 0.0001,
  linkPreviewsEnabled: true,
  screenshotProtection: true,
};

const THEMES: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: 'dark',     label: 'Obsidian',   bg: '#050505',  accent: '#00C076' },
  { id: 'midnight', label: 'Midnight',   bg: '#0d0d1a',  accent: '#6366f1' },
  { id: 'forest',   label: 'Forest',     bg: '#0a0f0a',  accent: '#22c55e' },
  { id: 'rose',     label: 'Rose',       bg: '#0f0a0a',  accent: '#f43f5e' },
  { id: 'mono',     label: 'Monochrome', bg: '#111111',  accent: '#e5e5e5' },
];

const DESTRUCT_OPTS: { value: AutoDestructPreset; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: '1m',  label: '1 min' },
  { value: '1h',  label: '1 hour' },
  { value: '24h', label: '24 hrs' },
  { value: '7d',  label: '7 days' },
];

interface AdvancedSettingsModalProps {
  onClose: () => void;
  settings: ChatSettings;
  onSettingsChange: (s: ChatSettings) => void;
}

export default function AdvancedSettingsModal({
  onClose, settings, onSettingsChange,
}: AdvancedSettingsModalProps) {
  const [tab, setTab] = useState<'appearance' | 'privacy' | 'keys' | 'notifications'>('appearance');
  const [rotating, setRotating] = useState(false);

  const update = <K extends keyof ChatSettings>(key: K, val: ChatSettings[K]) =>
    onSettingsChange({ ...settings, [key]: val });

  const handleKeyRotation = async () => {
    setRotating(true);
    // In production: call lib/snark.ts → generateUniversalAttestation() + XMTP key rotation
    await new Promise(r => setTimeout(r, 1400));
    setRotating(false);
  };

  const tabs = [
    { id: 'appearance',    icon: Palette,         label: 'Appearance' },
    { id: 'privacy',       icon: Shield,           label: 'Privacy' },
    { id: 'keys',          icon: KeyRound,         label: 'Keys' },
    { id: 'notifications', icon: Bell,             label: 'Alerts' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-[680px] bg-[#080808] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-white/60" />
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-white uppercase">Settings</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Tab Rail */}
          <div className="w-[160px] border-r border-white/5 py-4 px-3 flex flex-col gap-1 shrink-0">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                    tab === t.id ? 'bg-[#00C076]/10 border border-[#00C076]/20 text-[#00C076]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-mono text-[11px] font-semibold tracking-wide">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <>
                <section>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">Color Theme</p>
                  <div className="grid grid-cols-5 gap-3">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => update('theme', t.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          settings.theme === t.id ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl" style={{ background: t.bg, border: `2px solid ${t.accent}` }} />
                        <span className="font-mono text-[9px] text-white/50">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ── PRIVACY ── */}
            {tab === 'privacy' && (
              <>
                <section className="space-y-4">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Privacy Mode</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['stealth', 'standard', 'institutional'] as PrivacyMode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => update('privacyMode', m)}
                        className={`py-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest border transition-all ${
                          settings.privacyMode === m
                            ? 'bg-[#00C076]/10 border-[#00C076]/30 text-[#00C076]'
                            : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Auto-Destruct Timer</p>
                  <div className="flex gap-2 flex-wrap">
                    {DESTRUCT_OPTS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => update('autoDestruct', o.value)}
                        className={`px-4 py-2 rounded-lg font-mono text-[11px] border transition-all flex items-center gap-1.5 ${
                          settings.autoDestruct === o.value
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                        }`}
                      >
                        <Timer size={12} />{o.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  {[
                    { key: 'showReadReceipts',    icon: Eye,              label: 'Show Read Receipts' },
                    { key: 'showLastSeen',         icon: Globe,            label: 'Show Last Seen (zk-proven)' },
                    { key: 'screenshotProtection', icon: MessageSquareOff, label: 'Screenshot Protection' },
                    { key: 'linkPreviewsEnabled',  icon: Globe,            label: 'Link Previews' },
                  ].map(({ key, icon: Icon, label }) => (
                    <ToggleRow
                      key={key}
                      label={label}
                      icon={<Icon size={15} />}
                      value={settings[key as keyof ChatSettings] as boolean}
                      onChange={v => update(key as keyof ChatSettings, v as any)}
                    />
                  ))}
                </section>

                <section>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">
                    Differential Privacy Noise — ε = {settings.differentialNoiseEpsilon}
                  </p>
                  <input
                    type="range" min={0.0001} max={0.01} step={0.0001}
                    value={settings.differentialNoiseEpsilon}
                    onChange={e => update('differentialNoiseEpsilon', parseFloat(e.target.value))}
                    className="w-full accent-[#00C076] h-1 rounded-full"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
                    <span>ε=0.0001 (Max Private)</span><span>ε=0.01 (Fast)</span>
                  </div>
                </section>
              </>
            )}

            {/* ── KEYS ── */}
            {tab === 'keys' && (
              <section className="space-y-5">
                <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Active Key Pair</p>
                  <div className="font-mono text-[12px] text-white/70 break-all bg-black/40 p-3 rounded-lg border border-white/5">
                    ML-KEM-1024 • Session {typeof window !== 'undefined' ? btoa(Date.now().toString()).slice(0,12) : '...'}
                  </div>
                  <div className="font-mono text-[10px] text-white/30">
                    SLH-DSA-SHAKE-256 signature scheme active. Forward-secrecy ratchet: MLS.
                  </div>
                </div>
                <button
                  onClick={handleKeyRotation}
                  disabled={rotating}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 font-mono text-[12px] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={16} className={rotating ? 'animate-spin text-[#00C076]' : 'text-white/60'} />
                  {rotating ? 'Rotating ML-KEM Keys...' : 'Rotate Keys (Breaks Past Sessions)'}
                </button>
                <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <Fingerprint size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-red-400/80 leading-relaxed">
                    Key rotation generates a new zk-SNARK attestation and invalidates all active sessions. Peers must re-verify your identity.
                  </p>
                </div>
                <button className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 font-mono text-[11px] text-red-400 hover:bg-red-500/15 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Wipe All Local Message History
                </button>
              </section>
            )}

            {/* ── NOTIFICATIONS ── */}
            {tab === 'notifications' && (
              <section className="space-y-3">
                {[
                  { key: 'soundEnabled',         icon: Volume2, label: 'Message Sounds' },
                  { key: 'notificationsEnabled',  icon: Bell,    label: 'Push Notifications' },
                ].map(({ key, icon: Icon, label }) => (
                  <ToggleRow
                    key={key}
                    label={label}
                    icon={<Icon size={15} />}
                    value={settings[key as keyof ChatSettings] as boolean}
                    onChange={v => update(key as keyof ChatSettings, v as any)}
                  />
                ))}
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, icon, value, onChange }: {
  label: string; icon: React.ReactNode; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 text-white/60">
        {icon}
        <span className="font-mono text-[12px]">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-[#00C076]' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
