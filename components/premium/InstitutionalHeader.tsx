"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useUIStore } from '@/lib/store/ui-store';
import { motion } from 'framer-motion';

export default function InstitutionalHeader() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-20 bg-[var(--aztec-parchment)]/80 backdrop-blur-xl border-b border-[var(--aztec-ink)]/10 px-8 flex items-center justify-between">
      {/* Left: Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 relative">
          <Image 
            src="/models/update/gradient-pink-diamond-balls-assortment (2).png" 
            alt="Whale Logo" 
            fill 
            className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        <span className="font-aztec-h1 text-2xl tracking-tighter text-[var(--aztec-ink)]">
          Whale Alert <span className="italic">Network</span>.
        </span>
      </Link>

      {/* Center: Navigation */}
      <nav className="hidden md:flex items-center gap-12">
        <NavLink href="/network" label="ACTIVITIES" />
        <NavLink href="/support" label="SUPPORT" />
        <NavLink href="/academy" label="ACADEMY" />
      </nav>

      {/* Right: Connect */}
      <div className="flex items-center gap-6">
        <motion.button
          onClick={() => openConnectModal()}
          whileHover={{ scale: 1.05, backgroundColor: "var(--aztec-ink)", color: "var(--aztec-parchment)" }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 border-2 border-[var(--aztec-ink)] text-[var(--aztec-ink)] font-aztec-h2 text-[10px] uppercase tracking-[0.3em] rounded-full transition-all duration-300"
        >
          {isConnected ? "NODE CONNECTED" : "CONNECT NODE"}
        </motion.button>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="font-aztec-h2 text-[11px] uppercase tracking-[0.4em] text-[var(--aztec-ink)]/60 hover:text-[var(--aztec-ink)] transition-colors relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--aztec-ink)] group-hover:w-full transition-all duration-500" />
    </Link>
  );
}
