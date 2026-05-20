"use client";

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Calendar, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function StatusNavbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 fixed top-0 left-0 right-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Image 
          src="/official-whale-monochrome.png" 
          alt="Whale Alert Network" 
          width={32} 
          height={32} 
          className="rounded-full bg-black p-1"
        />
        <span className="font-bold text-slate-900 text-lg tracking-tight">Whale Alert Network</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-md transition-colors text-sm font-semibold text-slate-700">
          <Calendar size={16} className="text-slate-500" />
          Subscribe to Updates
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              if (!session) {
                signIn('google');
              } else {
                setMenuOpen(!menuOpen);
              }
            }}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-md transition-colors text-sm font-semibold text-slate-700"
          >
            Account
            {session && <ChevronDown size={14} className="text-slate-500" />}
          </button>

          {menuOpen && session && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 text-xs text-slate-500 truncate">
                {session.user?.email}
              </div>
              <button className="text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                Manage subscriptions
              </button>
              <button 
                onClick={() => signOut()}
                className="text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium border-t border-slate-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
