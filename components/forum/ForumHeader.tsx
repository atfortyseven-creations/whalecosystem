"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserProfileModal } from '@/components/ui/UserProfileModal';

export function ForumHeader({ address, avatarUrl }: { address?: string; avatarUrl?: string }) {
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
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 px-6 h-[52px] flex items-center justify-between">

        {/* Wordmark */}
        <Link
          href="/forum"
          className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-white hover:opacity-60 transition-opacity"
        >
          FORUM
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-5" ref={menuRef}>

          {/* New Topic */}
          <Link
            href="/forum/new"
            className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black bg-white px-4 py-2 hover:bg-white/80 transition-colors"
          >
            + NEW
          </Link>

          {/* Menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            aria-label="Navigation menu"
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>

          {/* Popover */}
          {menuOpen && (
            <div className="absolute top-[52px] right-0 w-[220px] bg-[#1a052b] border border-white/10 shadow-lg z-50 flex flex-col overflow-hidden">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/5 border-b border-white/10 last:border-0 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Avatar / connect */}
          {address ? (
            <button
              onClick={() => setProfileOpen(true)}
              className="w-7 h-7 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-mono font-black text-white hover:border-white transition-colors shrink-0"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : address.slice(2, 4).toUpperCase()
              }
            </button>
          ) : (
            <Link
              href="/connect"
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              CONNECT
            </Link>
          )}
        </div>
      </header>

      <UserProfileModal isOpen={profileOpen} onClose={() => { setProfileOpen(false); window.location.reload(); }} />
    </>
  );
}
