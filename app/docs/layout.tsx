"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/docs/Sidebar';
import { Search } from '@/components/docs/Search';
import { ThemeToggle } from '@/components/docs/ThemeToggle';
import { usePathname } from 'next/navigation';
import { Database, Shield, Lock, Cpu } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  // Force dark theme for Professor Emeritus consistency
  const theme = 'dark';
  const pathname = usePathname();

  return (
    <div style={{ backgroundColor: "#020202", color: "#E0E0E0" }} className="min-h-screen transition-colors duration-300 font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Navigation / Search Bar */}
      <header style={{ backgroundColor: "rgba(2, 2, 2, 0.8)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }} className="sticky top-0 z-50 h-20 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div style={{ color: "#D4AF37" }} className="p-1.5 border border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded">
              <Database size={16} strokeWidth={1.5} />
            </div>
            <div style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="font-light text-sm tracking-tight uppercase">
              Whale Alert <span style={{ color: "#8A94A6" }}>Network</span>
            </div>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2 hidden md:block" />
          <div style={{ color: "#545F73" }} className="text-[10px] font-mono uppercase tracking-[0.4em] hidden md:block">Repository L-1</div>
        </div>

        <div className="flex items-center gap-6">
          <Search theme={theme} />
          {/* ThemeToggle removed/hidden to maintain fixed Dark Mode as requested */}
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto flex">
        {/* Institutional Sidebar */}
        <Sidebar theme={theme} currentPath={pathname} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 py-24 px-6 lg:px-24 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          <div className="max-w-[850px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 0; }
        
        /* Minimalist Typography */
        h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif !important; font-weight: 300 !important; tracking: -0.02em !important; }
        p { line-height: 1.8; letter-spacing: -0.01em; color: #8A94A6; }
        
        /* Ensure dark mode persists */
        html { background-color: #020202 !important; }
        body { background-color: #020202 !important; color: #E0E0E0 !important; }
      `}</style>
    </div>
  );
}
