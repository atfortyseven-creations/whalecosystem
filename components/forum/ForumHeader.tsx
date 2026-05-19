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
  // Theme is always 'light' — forced globally. No toggle needed.
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
    { href: '/forum',               label: 'CATEGORIES'   },
    { href: '/forum/users',         label: 'MEMBERS'        },
    { href: '/forum/groups',        label: 'COMMUNITIES'       },
    { href: '/forum/guidelines',    label: 'GETTING STARTED'   },
    { href: '/forum/anniversaries', label: 'INTRODUCTIONS' },
    { href: '/forum/settings',      label: 'SETTINGS'     },
  ];

  return (
    <>
      {/* ─── Main Header Removed ─── */}
      {/* Handled by the Unified Master InstitutionalHeader in ClientLayout */}


      {/* Secondary Discourse Sub-Nav */}
      <div className="w-full shadow-sm bg-white dark:bg-[#050505] border-b border-black/10 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-[1110px] mx-auto px-4 flex items-center h-[54px] gap-4 md:gap-8 overflow-x-auto custom-scrollbar">
          <Link href="/forum" className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black dark:text-white border-b-2 border-[#00C076] whitespace-nowrap">
            Categories
          </Link>
          <Link href="/forum?filter=latest" className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Latest
          </Link>
          <Link href="/forum?filter=new" className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            New
          </Link>
          <Link href="/forum?filter=top" className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Top
          </Link>
          <div className="w-px h-4 bg-black/10 dark:bg-white/10 shrink-0 mx-2" />
          {navLinks.slice(1).map(n => (
            <Link key={n.href} href={n.href} className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
              {n.label}
            </Link>
          ))}
          <Link href="/forum/settings" className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] h-full flex items-center transition-colors text-black/60 dark:text-[#555] hover:text-[#00C076] whitespace-nowrap">
            Forum Settings
          </Link>
        </div>
      </div>
    </>
  );
}
