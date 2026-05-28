"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletConnectSessions } from '@/components/wallet/WalletConnectSessions';
import BiometricGuard from '@/components/wallet/BiometricGuard';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'sonner';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';

export default function SettingsPanel() {
  const { address: authUserId, isConnected } = useSystemAccount();
  const { nuclearDisconnect } = useSystemSignOut();
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [showSecret, setShowSecret] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  const registerPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      // 1. Get options from server
      const resp = await fetch(`/api/auth/webauthn/register?userId=${authUserId}`);
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      // 2. Start registration with browser
      const attResp = await startRegistration(options);

      // 3. Verify with server
      const verifyResp = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attResp, userId: authUserId }),
      });

      const verification = await verifyResp.json();

      if (verification.verified) {
        toast.success('Passkey registered successfully!');
      } else {
        throw new Error(verification.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to register passkey');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#1F1F1F]">Settings</h2>

      {/* Preferences */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Preferences</h3>
        
        <div className="space-y-1">
          <SettingsInfoRow 
            label="Currency" 
            value={currency} 
            onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')} 
          />
          <SettingsInfoRow 
            label="Language" 
            value={language} 
            onClick={() => {}} 
          />
          <SettingsInfoRow 
            label="Theme" 
            value={theme} 
            onClick={() => setTheme(theme === 'Light' ? 'Dark' : 'Light')} 
          />
        </div>
      </section>

      {/* Connections (WalletConnect) */}
      <section>
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Active Sessions</h3>
        <WalletConnectSessions />
      </section>

      {/* Security */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Security</h3>
        
        <div className="space-y-1">
          <SettingsToggleRow 
            label="Biometric Auth" 
            enabled={true} 
            onToggle={() => {}} 
          />
          <button 
            onClick={registerPasskey}
            disabled={isRegisteringPasskey}
            className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
                <div className="text-left">
                    <div className="font-bold text-[#1F1F1F]">Add Passkey</div>
                    <div className="text-xs text-[#1F1F1F]/50">For passwordless login</div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[#1F1F1F]/60">
                {isRegisteringPasskey && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1F1F1F] border-t-transparent" />
                )}
            </div>
          </button>
          <SettingsToggleRow 
            label="Auto-Lock Timer" 
            sublabel="5 Minutes"
            enabled={true} 
            onToggle={() => {}} 
          />
        </div>
      </section>

      {/* Privacy & Reputation */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Privacy & Reputation</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#1F1F1F]/10 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-[#1F1F1F]/50 mb-1">Privacy Score</div>
              <div className="text-3xl font-black text-black font-mono">98/100</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <SettingsInfoRow 
              label="What can people see about me?" 
              value="Only ZK Proofs" 
              onClick={() => {}} 
            />
            <SettingsToggleRow 
              label="Allow ZK Reputation Queries" 
              sublabel="Used for forum entry"
              enabled={true} 
              onToggle={() => {}} 
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Notifications</h3>
        
        <div className="space-y-1">
          <SettingsToggleRow 
            label="Transaction Alerts" 
            enabled={true} 
            onToggle={() => {}} 
          />
          <SettingsToggleRow 
            label="Price Alerts" 
            enabled={false} 
            onToggle={() => {}} 
          />
        </div>
      </section>

      {/* Advanced Security Zone */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F] uppercase mb-4 tracking-wider flex items-center gap-2">
            Danger Zone
        </h3>
        
        {!showSecret ? (
             <DangerZoneReveal onSuccess={() => setShowSecret(true)} />
        ) : (
            <div className="h-[300px]">
                <div className="p-6 bg-white rounded-xl border border-[#1F1F1F]/10 text-center space-y-4">
                    <p className="font-mono text-lg font-bold text-[#1F1F1F]">
                        abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
                    </p>
                    <p className="text-xs text-black font-bold">
                        DO NOT SHARE THIS PHRASE WITH ANYONE.
                    </p>
                    <button 
                        onClick={() => setShowSecret(false)}
                        className="text-sm text-[#1F1F1F]/50 underline"
                    >
                        Hide Secret
                    </button>
                </div>
            </div>
        )}
      </section>

      {/* Session Connection */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F] uppercase mb-4 tracking-wider">Session Connection</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#1F1F1F]">Active System Session</h4>
            <p className="text-xs text-[#1F1F1F]/50">Log out and clear all secure keys and wallet registries from local cache.</p>
          </div>
          <button 
            onClick={nuclearDisconnect}
            className="px-5 py-3 bg-[#1F1F1F] hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            Disconnect Session
          </button>
        </div>
      </section>

      <div className="text-center text-xs text-[#1F1F1F]/30 pt-4">
        Whale Alert Network Terminal v1.0.0 (Institutional Build)
      </div>
    </div>
  );
}

function DangerZoneReveal({ onSuccess }: { onSuccess: () => void }) {
    const [input, setInput] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    
    const correctPhrase = "Whale Alert Network";
    const isMatched = input === correctPhrase;

    return (
        <div className="relative group">
            {/* Glassmorphism Container */}
            <div className="bg-black/5 backdrop-blur-xl border border-black/10 rounded-2xl p-6 space-y-4 transition-all hover:bg-black/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-black uppercase tracking-widest">
                        Protocol Verification
                    </label>
                    <p className="text-sm text-[#1F1F1F]/60">
                        Type <span className="font-mono font-bold bg-white/50 px-1 rounded text-black">{correctPhrase}</span> to reveal your recovery phrase.
                    </p>
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type verification phrase..."
                        className="w-full px-4 py-3 bg-white/60 border-2 border-transparent focus:border-black/20 rounded-xl outline-none font-bold text-[#1F1F1F] placeholder:text-[#1F1F1F]/20 transition-all"
                    />
                </div>

                <motion.button
                    disabled={!isMatched}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={() => {
                        if (isMatched) onSuccess();
                    }}
                    className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all overflow-hidden relative ${
                        isMatched 
                        ? 'bg-black text-white cursor-pointer shadow-lg shadow-black/20' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                     {/* Hover Animation Overlay */}
                     {isMatched && (
                         <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: isHovering ? '100%' : '-100%' }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0 bg-white/30 skew-x-12"
                         />
                     )}
                     
                     <span className="relative z-10 flex items-center gap-2">
                        {isMatched ? 'Click to Reveal' : 'Locked'}
                     </span>
                </motion.button>
            </div>
        </div>
    );
}

function SettingsInfoRow({ label, value, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all group">
      <div className="flex items-center gap-3">
        <span className="font-bold text-[#1F1F1F]">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-[#1F1F1F]/60">
        <span className="text-sm">{value}</span>
      </div>
    </button>
  );
}

function SettingsToggleRow({ label, sublabel, enabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <div className="text-left">
          <div className="font-bold text-[#1F1F1F]">{label}</div>
          {sublabel && <div className="text-xs text-[#1F1F1F]/50">{sublabel}</div>}
        </div>
      </div>
      
      <button 
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-all ${
          enabled ? 'bg-[#1F1F1F]' : 'bg-[#1F1F1F]/20'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}



