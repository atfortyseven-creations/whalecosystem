"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserProfileModal } from '@/components/ui/UserProfileModal';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export function ForumHeader({ address: serverAddress, avatarUrl: dbAvatarUrl }: { address?: string; avatarUrl?: string }) {
  const { address: wagmiAddress } = useAccount();
  const address = wagmiAddress || serverAddress;
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    { href: '/forum/badges',        label: 'BADGES'       },
    { href: '/forum/groups',        label: 'GROUPS'       },
    { href: '/forum/guidelines',    label: 'GUIDELINES'   },
    { href: '/forum/anniversaries', label: 'ANNIVERSARIES'},
  ];

  return (
    <>
      <header className="sticky top-0 z-50 px-6 h-[52px] flex items-center justify-between" style={{ backgroundColor: 'var(--forum-header-bg)', borderBottom: '1px solid var(--forum-border)', backdropFilter: 'blur(12px)' }}>

        {/* Wordmark & Date */}
        <div className="flex items-center gap-6">
          <Link
            href="/forum"
            className="text-[20px] font-sans font-black tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: 'var(--forum-text)' }}
          >
            FORUM
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-sm" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>SYS.DATE:</span>
            <span className="text-[11px] font-mono font-black uppercase tracking-widest" style={{ color: 'var(--forum-text)' }}>
              {mountedDate || '---'}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4" ref={menuRef}>

          {/* Theme Toggle */}
          <button
            onClick={() => document.documentElement.classList.toggle('forum-light-mode')}
            className="w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-300 ease-in-out hover:scale-105"
            style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}
            title="Toggle Light/Dark Mode"
          >
            <span className="text-[14px] font-serif leading-none mt-[1px]">☼</span>
          </button>

          {/* New Topic */}
          <Link
            href="/forum/new"
            className="text-[12px] font-sans font-bold tracking-wide px-4 py-1.5 rounded-sm hover:opacity-80 transition-colors"
            style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
          >
            + New Topic
          </Link>

          {/* Menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-[12px] font-sans font-bold tracking-wide hover:opacity-100 transition-colors ml-2"
            style={{ color: 'var(--forum-text-muted)' }}
            aria-label="Navigation menu"
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>

          {/* Popover */}
          {menuOpen && (
            <div className="absolute top-[52px] right-0 w-[220px] shadow-lg z-50 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--forum-bg)', border: '1px solid var(--forum-border)', borderTop: 'none' }}>
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-colors"
                  style={{ color: 'var(--forum-text-muted)', borderBottom: '1px solid var(--forum-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--forum-text)'; e.currentTarget.style.backgroundColor = 'var(--forum-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--forum-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Avatar / connect */}
          {address ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setProfileOpen(true)}
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-mono font-black shrink-0 transition-colors"
                style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' }}
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
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] px-2 py-1 rounded-sm"
              style={{ color: 'var(--forum-text-muted)', border: '1px dashed var(--forum-border)' }}
            >
              [ READ-ONLY ]
            </div>
          )}
        </div>
      </header>

      {/* Secondary Discourse Sub-Nav */}
      <div className="w-full shadow-sm" style={{ backgroundColor: 'var(--forum-subnav-bg)', borderBottom: '1px solid var(--forum-border)' }}>
        <div className="max-w-[1110px] mx-auto px-4 flex items-center h-[48px] gap-6">
          <Link href="/forum" className="text-[13px] font-sans font-bold h-full flex items-center transition-colors" style={{ color: 'var(--forum-text)', borderBottom: '2px solid var(--forum-border)' }}>
            Categories
          </Link>
          <Link href="/forum?filter=latest" className="text-[13px] font-sans font-bold hover:opacity-100 transition-colors h-full flex items-center" style={{ color: 'var(--forum-text-muted)' }}>
            Latest
          </Link>
          <Link href="/forum?filter=new" className="text-[13px] font-sans font-bold hover:opacity-100 transition-colors h-full flex items-center" style={{ color: 'var(--forum-text-muted)' }}>
            New
          </Link>
          <Link href="/forum?filter=unread" className="text-[13px] font-sans font-bold hover:opacity-100 transition-colors h-full flex items-center" style={{ color: 'var(--forum-text-muted)' }}>
            Unread
          </Link>
          <Link href="/forum?filter=top" className="text-[13px] font-sans font-bold hover:opacity-100 transition-colors h-full flex items-center" style={{ color: 'var(--forum-text-muted)' }}>
            Top
          </Link>
        </div>
      </div>

      <UserProfileModal isOpen={profileOpen} onClose={() => { setProfileOpen(false); window.location.reload(); }} />
    </>
  );
}
