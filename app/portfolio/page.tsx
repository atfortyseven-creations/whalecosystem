"use client";

import { useState, useEffect } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { CoreAuthGate } from '@/components/auth/CoreAuthGate';
import { InstitutionalPortfolioView } from '@/components/bsv/InstitutionalPortfolioView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PortfolioPage() {
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected: isSystemConnected, isChecking: isSystemChecking } = useSystemAccount();

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('portfolio_unlocked') === 'true') {
        setSessionUnlocked(true);
      }
    } catch(e) {}
  }, []);

  if (!mounted || isSystemChecking) return null;

  const needsGate = !isSystemConnected && !sessionUnlocked;

  if (needsGate) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FFFFFF] text-[#0A0A0A] h-full min-h-0 overflow-hidden relative">
        <Link href="/" className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-white transition-all shadow-sm" title="Return to Landing Page">
          <ArrowLeft size={20} />
        </Link>
        <CoreAuthGate onComplete={() => {
          sessionStorage.setItem('portfolio_unlocked', 'true');
          setSessionUnlocked(true);
        }} />
      </div>
    );
  }

  // The new minimalist black and white Quantum design requested by the user
  return <InstitutionalPortfolioView />;
}
