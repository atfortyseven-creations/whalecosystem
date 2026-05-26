"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Command } from 'lucide-react';

interface SearchProps {
  theme: 'light' | 'dark';
}

export function Search({ theme }: SearchProps) {
  const [isMac, setIsMac] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const DOCUMENTATION_INDEX = [
    { title: 'Zero-Knowledge Attestations', section: 'Architecture', href: '/docs' },
    { title: 'Noir Smart Contracts', section: 'Development', href: '/docs' },
    { title: 'Aztec Network Integration', section: 'API', href: '/docs/api' },
    { title: 'Whale Network Infrastructure', section: 'Infrastructure', href: '/infrastructure' },
    { title: 'Privacy Architecture', section: 'Privacy', href: '/privacy' },
    { title: 'Institutional Dashboard', section: 'Enterprise', href: '/dashboard' }
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.section.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="relative group flex items-center" onClick={() => setIsOpen(true)}>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-none border transition-all cursor-text min-w-[200px] lg:min-w-[300px] ${
          theme === 'light' 
            ? 'bg-white border-black/20 text-black/40 group-hover:border-black' 
            : 'bg-black border-white/20 text-white/40 group-hover:border-white'
        }`}>
          <SearchIcon size={12} strokeWidth={3} className="opacity-60" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] flex-1">Search ZK Docs</span>
          
          <div className={`flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black tracking-tighter ${
            theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black border-white'
          }`}>
            <span>{isMac ? '⌘' : 'CTRL'}</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-[600px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5">
              <SearchIcon size={18} className="text-black/40 dark:text-white/40 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search documentation, API, Noir..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-mono text-[14px] text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
              />
              <button onClick={() => setIsOpen(false)} className="text-[10px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40 px-2 py-1 bg-black/5 dark:bg-white/5 rounded">ESC</button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-2">
              {DOCUMENTATION_INDEX.length === 0 ? (
                <div className="p-8 text-center text-[12px] font-mono text-black/40 dark:text-white/40">
                  No ZK proofs found for "{query}"
                </div>
              ) : (
                DOCUMENTATION_INDEX.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.href}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[14px] text-black dark:text-white mb-1">{res.title}</h4>
                      <p className="font-mono text-[10px] text-black/50 dark:text-white/50 uppercase tracking-widest">{res.section}</p>
                    </div>
                    <Command size={14} className="text-black/20 dark:text-white/20" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
