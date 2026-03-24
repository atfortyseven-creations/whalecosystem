"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/docs/Sidebar';
import { Search } from '@/components/docs/Search';
import { ThemeToggle } from '@/components/docs/ThemeToggle';
import { usePathname } from 'next/navigation';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const pathname = usePathname();

  useEffect(() => {
    // Initial theme detection
    const savedTheme = localStorage.getItem('docs-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('docs-theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#0A0A0B] text-slate-100'} transition-colors duration-300 font-sans selection:bg-cyan-500/30`}>
      {/* Top Navigation / Search Bar */}
      <header className={`sticky top-0 z-50 h-16 border-b ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-[#0A0A0B]/80 border-white/10'} backdrop-blur-xl px-4 md:px-8 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="font-black text-sm tracking-tighter uppercase font-web3">
            Whale Alert <span className="text-cyan-500">Corporation™</span>
          </div>
          <div className="h-4 w-px bg-slate-200/20 mx-2 hidden md:block" />
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Documentation v2.0</div>
        </div>

        <div className="flex items-center gap-6">
          <Search theme={theme} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Institutional Sidebar */}
        <Sidebar theme={theme} currentPath={pathname} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 py-12 px-6 lg:px-16 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          <div className="max-w-[850px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
        
        /* Light mode overrides for document root */
        html.light { 
          background-color: white !important;
          color: #0F172A !important;
        }
        html.light body {
          background-color: white !important;
          color: #0F172A !important;
        }
        html.light a { color: #020617; }
        html.light p { color: #475569; }
      `}</style>
    </div>
  );
}
