"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { useTheme } from 'next-themes';

export function ForumHeader({ address: serverAddress, avatarUrl: dbAvatarUrl }: { address?: string; avatarUrl?: string }) {
  const { address: wagmiAddress } = useAccount();
  const address = wagmiAddress || serverAddress;
  const router = useRouter();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const { theme, setTheme } = useTheme();
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

  const navLinks = [
    { href: '/forum',               label: 'TOPICS'       },
    { href: '/forum/users',         label: 'USERS'        },
    { href: '/forum/groups',        label: 'GROUPS'       },
    { href: '/forum/guidelines',    label: 'GUIDELINES'   },
    { href: '/forum/anniversaries', label: 'NEW ARRIVALS' },
    { href: '/forum/settings',      label: 'SETTINGS'     },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 px-4 h-[52px] flex items-center justify-between bg-white/80 dark:bg-[#050505]/80 border-b border-black/10 dark:border-white/5 backdrop-blur-md transition-colors duration-300">

        {/* Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/forum"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-black dark:text-white"
          >
            {/* "FORUM P2P" — only on md+ */}
            <span className="hidden md:inline text-[20px] font-sans font-black tracking-tight">FORUM</span>
            <span className="hidden md:inline text-[12px] font-mono tracking-[0.2em] px-2 py-0.5 rounded border border-black/10 dark:border-white/10 opacity-70">P2P</span>
            {/* Brand always visible */}
            <span className="text-[15px] font-serif tracking-normal font-bold opacity-90 truncate">Humanity Ledger®</span>
          </Link>
          {/* SYS.DATE — sm+ only */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-colors">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-black/60 dark:text-[#888888]">SYS.DATE:</span>
            <span className="text-[11px] font-mono font-black uppercase tracking-widest text-black dark:text-white">
              {mountedDate || '---'}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0" ref={menuRef}>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-300 ease-in-out hover:scale-105 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-[#888888] hover:text-black dark:hover:text-white"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-[14px] font-serif leading-none mt-[1px]">{theme === 'dark' ? '☼' : '☾'}</span>
            </button>
          )}

          {/* New Topic — hidden on mobile */}
          <Link
            href="/forum/new"
            className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,192,118,0.3)] hover:-translate-y-0.5 bg-[#00C076] text-black"
          >
            + CREATE MANDATE
          </Link>

          {/* Menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-[12px] font-sans font-bold tracking-wide hover:opacity-100 transition-colors text-black/60 dark:text-[#888888] hover:text-black dark:hover:text-white"
            aria-label="Navigation menu"
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>

          {/* Popover */}
          {menuOpen && (
            <div className="absolute top-[52px] right-0 w-[220px] shadow-lg z-50 flex flex-col overflow-hidden bg-white dark:bg-[#050505] border-l border-b border-black/10 dark:border-white/5 transition-colors">
              {/* + New Topic on mobile only */}
              <Link href="/forum/new" onClick={() => setMenuOpen(false)} className="sm:hidden px-5 py-3.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-colors text-black dark:text-white border-b border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5">
                + CREATE MANDATE
              </Link>
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-colors text-black/60 dark:text-[#888888] border-b border-black/10 dark:border-white/5 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Avatar / connect */}
          {address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/forum/settings')}
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-mono font-black shrink-0 transition-colors bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white"
                title={ensName || address}
              >
                {finalAvatar
                  ? <img src={finalAvatar} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #${address.slice(2,8)}, #${address.slice(-6)})` }} />
                }
              </button>
            </div>
          ) : (
            <div
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] px-2 py-1 rounded-sm text-black/60 dark:text-[#888888] border border-dashed border-black/20 dark:border-white/20 transition-colors"
            >
              [ READ-ONLY ]
            </div>
          )}
        </div>
      </header>


      {/* Secondary Discourse Sub-Nav */}
      <div className="w-full shadow-sm bg-white dark:bg-[#050505] border-b border-black/10 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-[1110px] mx-auto px-4 flex items-center h-[54px] gap-8 overflow-x-auto custom-scrollbar">
          <Link href="/forum" className="text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black dark:text-white border-b-2 border-[#00C076] whitespace-nowrap">
            Institutional Matrix
          </Link>
          <Link href="/forum?filter=latest" className="text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Live Feed
          </Link>
          <Link href="/forum?filter=new" className="text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Recent Profiles
          </Link>
          <Link href="/forum?filter=unread" className="text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Pending Review
          </Link>
          <Link href="/forum?filter=top" className="text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Highest Yield
          </Link>
        </div>
      </div>
    </>
  );
}
