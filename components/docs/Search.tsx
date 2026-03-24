"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Command } from 'lucide-react';

interface SearchProps {
  theme: 'light' | 'dark';
}

export function Search({ theme }: SearchProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger search modal (future enhancement)
        alert("Institutional Search Protocol Initialized [Ctrl+K]");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative group flex items-center">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-text min-w-[200px] lg:min-w-[300px] ${
        theme === 'light' 
          ? 'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-slate-300' 
          : 'bg-white/5 border-white/10 text-slate-500 group-hover:border-white/20'
      }`}>
        <SearchIcon size={14} className="opacity-60" />
        <span className="text-[11px] font-black uppercase tracking-widest flex-1">Search...</span>
        
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black tracking-tighter ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-black border-white/10 text-slate-500'
        }`}>
          <span>{isMac ? '⌘' : 'Ctrl'}</span>
          <span>K</span>
        </div>
      </div>
    </div>
  );
}
