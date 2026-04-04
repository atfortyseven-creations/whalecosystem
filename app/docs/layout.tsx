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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'} transition-colors duration-300 font-sans selection:bg-zinc-200 selection:text-black`}>
      {/* Top Navigation / Search Bar */}
      <header className={`sticky top-0 z-50 h-16 border-b ${theme === 'light' ? 'bg-white border-black/10' : 'bg-black border-white/10'} backdrop-blur-xl px-4 md:px-8 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="font-black text-sm tracking-tighter uppercase font-web3">
            Whale Alert <span className={theme === 'light' ? 'text-black' : 'text-white'}>Corporation™</span>
          </div>
          <div className={`h-4 w-px ${theme === 'light' ? 'bg-black/10' : 'bg-white/10'} mx-2 hidden md:block`} />
          <div className={`text-[10px] font-black ${theme === 'light' ? 'text-black/40' : 'text-white/40'} uppercase tracking-widest hidden md:block`}>Repository v2.0</div>
        </div>

        <div className="flex items-center gap-6">
          <Search theme={theme} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto flex">
        {/* Institutional Sidebar */}
        <Sidebar theme={theme} currentPath={pathname} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 py-20 px-6 lg:px-24 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          <div className="max-w-[800px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme === 'light' ? '#000' : '#fff'}; border-radius: 0; }
        
        /* Light mode overrides for document root */
        html.light { 
          background-color: white !important;
          color: black !important;
        }
        html.light body {
          background-color: white !important;
          color: black !important;
        }
        
        /* Minimalist Typography */
        h1, h2, h3, h4 { font-family: var(--font-aztec-mono), monospace; font-weight: 900 !important; text-transform: uppercase; letter-spacing: -0.05em; }
        p { line-height: 1.8; letter-spacing: -0.01em; }
      `}</style>
    </div>
  );
}
