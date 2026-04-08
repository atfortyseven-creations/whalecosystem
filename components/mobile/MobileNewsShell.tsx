"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { QrCode } from 'lucide-react';
import { MobileQRScanner } from '@/components/mobile/MobileWhaleLanding';
import { useAccount, useSignMessage } from 'wagmi';

// ─── MOBILE AUTHENTICATED SHELL ─────────────────────────────────────────────
// Shown to mobile users who have completed the QR handshake.
// Only Whale News is accessible — no other tabs.

export function MobileNewsShell() {
  const [showScanner, setShowScanner] = useState(false);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  if (showScanner) {
    return <MobileQRScanner onBack={() => setShowScanner(false)} address={address} signMessageAsync={signMessageAsync} />;
  }

  return (
    <div className="w-full min-h-[100dvh] bg-[#FAF9F6] flex flex-col">
      {/* ─── Minimal Mobile Header ─── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 border-b"
        style={{
          background: 'linear-gradient(135deg, #FDFAF5 0%, #F7F2EA 50%, #FDFAF5 100%)',
          borderColor: 'rgba(0,0,0,0.07)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)',
          minHeight: '56px',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="relative w-8 h-8 flex items-center justify-center rounded-full border shadow-sm"
            style={{ background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }}
          >
            <img
              src="/official-whale-monochrome.png"
              alt="Whale Logo"
              className="w-5 h-5 object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-aztec-serif text-[14px] font-black text-black uppercase tracking-tighter leading-none">
              Whale Alert Network
            </span>
            <span
              className="font-mono text-[6px] font-bold uppercase tracking-[0.4em] mt-0.5"
              style={{ color: 'rgba(0,0,0,0.35)' }}
            >
              Mobile Terminal
            </span>
          </div>
        </div>
        
        {/* QR Scanner Button */}
        <button 
          onClick={() => setShowScanner(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shadow-md active:scale-90 transition-transform"
        >
          <QrCode size={18} />
        </button>
      </header>

      {/* ─── News Terminal ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 w-full"
      >
        <NewsTerminal />
      </motion.div>
    </div>
  );
}
