"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/users')
      .then(r => r.json())
      .then(data => { if (!data.error) setUsers(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">[ PROFILING_ENTITIES ]</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">

      {/* ── Table Header ── */}
      <div className="flex items-center px-2 pb-4 border-b-[0.5px] border-black/10 select-none">
        <div className="flex-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Entity_Address</div>
        <div className="w-24 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Intel_Deployed</div>
        <div className="w-24 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Responses</div>
        <div className="w-24 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">SNR_Score</div>
        <div className="w-20 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Auth</div>
      </div>

      {/* ── Entity Rows ── */}
      <div className="flex flex-col">
        {users.length === 0 ? (
          <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">[ NULL_OPERATORS ]</div>
        ) : users.map((user, idx) => {
          const snr = (user._count.forumPosts + (user._count.forumTopics * 2) + user._count.forumLikes);
          const snrBar = Math.min(100, Math.round((snr / 100) * 100));

          return (
            <Link
              key={user.walletAddress}
              href={`/forum/u/${user.walletAddress}`}
              className="flex items-center px-2 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group"
            >
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <span className="font-mono text-[12px] font-black uppercase tracking-widest text-[#050505] group-hover:underline truncate">
                  {user.walletAddress.slice(0, 10)}…{user.walletAddress.slice(-6)}
                </span>
                {/* SNR Bar */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 max-w-[120px] h-[2px] bg-black/5">
                    <div className="h-full bg-black/30 group-hover:bg-black transition-all duration-500" style={{ width: `${snrBar}%` }} />
                  </div>
                  <span className="font-mono text-[7px] text-[#050505]/30 uppercase tracking-widest">{snrBar}%</span>
                </div>
              </div>

              <div className="w-24 text-right font-mono text-[11px] text-[#050505]/70">
                {user._count.forumTopics}
              </div>
              <div className="w-24 text-right font-mono text-[11px] text-[#050505]/70">
                {user._count.forumPosts}
              </div>
              <div className="w-24 text-right font-mono text-[11px] font-black text-[#050505]">
                {snr}
              </div>
              <div className="w-20 text-right">
                {user.isPro ? (
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#D4AF37] border border-[#D4AF37]/50 px-1 py-0.5">POSG</span>
                ) : (
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#050505]/30 border border-black/10 px-1 py-0.5">T_{user.tier}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#050505]/20 select-none">END_OF_MATRIX</span>
      </div>
    </div>
  );
}
