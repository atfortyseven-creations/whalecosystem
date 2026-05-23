"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export function ForumHeader({ address: serverAddress, avatarUrl: dbAvatarUrl }: { address?: string; avatarUrl?: string }) {
  const { address: wagmiAddress } = useAccount();
  const address = wagmiAddress || serverAddress;
  const router = useRouter();
  const [menuOpen,    setMenuOpen]    = useState(false);
  // Theme is always 'light'  forced globally. No toggle needed.
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ensure hydration matches for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const [mountedDate, setMountedDate] = useState('');
  useEffect(() => {
    setMountedDate(new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, ''));
  }, []);

  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined, chainId: mainnet.id });
  const finalAvatar = ensAvatar || dbAvatarUrl;



  return (
    <>
      {/*  Main Header Removed  */}
      {/* Handled by the Unified Master InstitutionalHeader in ClientLayout */}


      {/* Secondary Discourse Sub-Nav */}
      <div className="w-full shadow-sm bg-white border-b border-slate-200 transition-colors duration-300">
        <div className="w-full max-w-[1110px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[54px]">
          
          {/* Left: Breadcrumbs and Nav Links */}
          <div className="flex items-center gap-6 h-full overflow-x-auto custom-scrollbar no-scrollbar">
            
            {/* Breadcrumbs (Aztec style) */}
            <div className="flex items-center gap-2 mr-2 shrink-0">
              <span className="font-sans text-[13px] text-slate-500 cursor-pointer hover:text-slate-800 transition-colors flex items-center gap-1">
                categories <span className="text-slate-400 text-[10px]">&gt;</span>
              </span>
              <span className="font-sans text-[13px] text-slate-500 cursor-pointer hover:text-slate-800 transition-colors flex items-center gap-1">
                tags <span className="text-slate-400 text-[10px]">&gt;</span>
              </span>
            </div>

            {/* Nav Tabs */}
            <Link href="/forum" className="shrink-0 font-sans text-[14px] h-full flex items-center transition-colors text-slate-900 border-b-2 border-[#0088cc] whitespace-nowrap">
              Categories
            </Link>
            <Link href="/forum?filter=latest" className="shrink-0 font-sans text-[14px] h-full flex items-center transition-colors text-slate-500 hover:text-slate-800 whitespace-nowrap border-b-2 border-transparent">
              Latest
            </Link>
            <Link href="/forum?filter=new" className="shrink-0 font-sans text-[14px] h-full flex items-center transition-colors text-slate-500 hover:text-slate-800 whitespace-nowrap border-b-2 border-transparent">
              New
            </Link>
            <Link href="/forum?filter=unread" className="shrink-0 font-sans text-[14px] h-full flex items-center transition-colors text-slate-500 hover:text-slate-800 whitespace-nowrap border-b-2 border-transparent">
              Unread
            </Link>
            <Link href="/forum?filter=top" className="shrink-0 font-sans text-[14px] h-full flex items-center transition-colors text-slate-500 hover:text-slate-800 whitespace-nowrap border-b-2 border-transparent">
              Top
            </Link>
          </div>

          {/* Right: Aztec style Action Icons */}
          <div className="flex items-center gap-4 shrink-0 text-slate-400 ml-4">
            
            {/* Theme Toggle Icon (Half Moon) */}
            <button className="hover:text-slate-700 transition-colors cursor-pointer" title="Theme">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z"/>
              </svg>
            </button>

            {/* Search Icon */}
            <button className="hover:text-slate-700 transition-colors cursor-pointer" title="Search">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Hamburger Menu Icon */}
            <button className="hover:text-slate-700 transition-colors cursor-pointer" title="Menu">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Avatar Icon (Wave/User) */}
            <button className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#0088cc] hover:ring-offset-1 transition-all cursor-pointer ml-1" title="Profile">
              {finalAvatar ? (
                <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
