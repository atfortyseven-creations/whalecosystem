import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic   = 'force-dynamic';
export const revalidate = 60;

export default async function ForumAnniversariesPage() {
  const currentMonth = new Date().getMonth();
  const monthNames   = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

  let users: any[] = [];
  try {
    const all = await (prisma as any).user.findMany({
      select: { walletAddress: true, displayName: true, avatarUrl: true, createdAt: true },
    });
    users = all
      .filter((u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (e) {
    console.error('Failed to fetch anniversaries:', e);
  }

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#050505]/30 mb-2">FORUM / ANNIVERSARIES</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
          {monthNames[currentMonth]}
        </h1>
        <div className="text-[10px] font-mono text-[#050505]/30 mt-1">
          JOINED THIS MONTH
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="flex-1">NODE</div>
        <div className="w-24 text-right">EPOCH</div>
        <div className="w-16 text-right">YRS</div>
      </div>

      {users.length === 0 ? (
        <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
          [ NO ENTRIES FOR {monthNames[currentMonth]} ]
        </div>
      ) : users.map((u, i) => {
        const joined = new Date(u.createdAt);
        const years  = new Date().getFullYear() - joined.getFullYear();
        const addr   = u.walletAddress;
        const label  = u.displayName || `${addr.slice(0,6)}…${addr.slice(-4)}`;

        return (
          <Link
            key={i}
            href={`/forum/u/${addr}`}
            className="flex items-center py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-mono font-black uppercase tracking-widest text-[#050505] truncate">
                {label}
              </div>
            </div>
            <div className="w-24 text-right text-[10px] font-mono text-[#050505]/40 uppercase">
              {monthNames[joined.getMonth()].slice(0,3)} {joined.getFullYear()}
            </div>
            <div className="w-16 text-right text-[11px] font-mono font-black text-[#050505]">
              {years > 0 ? `+${years}Y` : '—'}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
