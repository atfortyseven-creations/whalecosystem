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
      <div className={`flex items-center gap-3 px-4 py-2 rounded-none border transition-all cursor-text min-w-[200px] lg:min-w-[300px] ${
        theme === 'light' 
          ? 'bg-white border-black/20 text-black/40 group-hover:border-black' 
          : 'bg-black border-white/20 text-white/40 group-hover:border-white'
      }`}>
        <SearchIcon size={12} strokeWidth={3} className="opacity-60" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] flex-1">Search</span>
        
        <div className={`flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black tracking-tighter ${
          theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black border-white'
        }`}>
          <span>{isMac ? '⌘' : 'CTRL'}</span>
          <span>K</span>
        </div>
      </div>
    </div>
  );
}
