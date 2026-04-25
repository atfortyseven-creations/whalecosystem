"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, User, X } from 'lucide-react';

export function ForumHeader({ address }: { address: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 h-[60px] flex items-center justify-between">
      <div className="flex items-center gap-4 h-full">
        <Link href="/forum" className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity">
          <span 
            className="text-[28px] text-[#222222]" 
            style={{ fontFamily: "'Old English Text MT', 'UnifrakturMaguntia', 'Cinzel', serif", fontWeight: 900, letterSpacing: '-0.02em' }}
          >
            Humanity Ledger
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 text-[#919191] relative" ref={menuRef}>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Search">
          <Search size={20} />
        </button>
        
        <button 
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" 
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* ── Aztec/Discourse Style Hamburger Popover ── */}
        {menuOpen && (
          <div className="absolute top-[50px] right-8 w-[320px] bg-white border border-gray-200 shadow-xl rounded-md z-50 flex flex-col overflow-hidden text-[#222222]">
            <div className="grid grid-cols-2 p-3 pb-1 border-b border-gray-100 gap-y-2">
              <Link href="/forum" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">☰</span> Topics
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">👤</span> Users
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">🛡️</span> Guidelines
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">🏆</span> Badges
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">🎂</span> Anniversaries
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                <span className="text-gray-400 w-4 text-center">👥</span> Groups
              </Link>
            </div>

            <div className="flex flex-col p-3 border-b border-gray-100">
              <div className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Categories</div>
              <div className="grid grid-cols-2 gap-y-1">
                 <Link href="/forum/c/aztec" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span> Aztec
                 </Link>
                 <Link href="/forum/c/general" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> General
                 </Link>
                 <Link href="/forum/c/noir" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="w-2.5 h-2.5 bg-black rounded-sm"></span> Noir
                 </Link>
                 <Link href="/forum/c/site-feedback" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="w-2.5 h-2.5 bg-gray-500 rounded-sm"></span> Site Feedback
                 </Link>
              </div>
              <Link href="/forum" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px] mt-1 text-gray-600">
                <span className="text-gray-400 w-4 text-center">☰</span> All categories
              </Link>
            </div>

            <div className="flex flex-col p-3 bg-gray-50/50">
              <div className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Tags</div>
              <div className="grid grid-cols-2 gap-y-1">
                 <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="text-gray-400">🏷️</span> noir
                 </Link>
                 <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px]">
                   <span className="text-gray-400">🏷️</span> specs
                 </Link>
              </div>
              <Link href="#" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded text-[14px] mt-1 text-gray-600">
                <span className="text-gray-400 w-4 text-center">☰</span> All tags
              </Link>
            </div>
          </div>
        )}

        <Link href={`/forum/u/${address}`} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200 ml-1 transition-transform hover:scale-105">
          <User size={18} className="text-blue-500" />
        </Link>
      </div>
    </header>
  );
}
