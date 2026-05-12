import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic   = 'force-dynamic';

export default async function ForumAnniversariesPage() {
  const currentMonth = new Date().getMonth();
  const monthNames   = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

  let users: any[] = [];
  try {
    // Try with displayName (extended schema)
    const all = await (prisma as any).user.findMany({
      select: { walletAddress: true, displayName: true, createdAt: true },
    });
    users = all
      .filter((u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    // Fallback: base columns only
    try {
      const all = await prisma.user.findMany({
        select: { walletAddress: true, createdAt: true },
      });
      users = (all as any[])
        .filter((u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth)
        .map(u => ({ ...u, displayName: null }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (e) {
      console.warn('Failed to fetch anniversaries:', e);
    }
  }

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="text-[12px] font-sans font-bold mb-2 text-black/50 dark:text-[#888888]">FORUM / NEW MEMBERS</div>
        <h1 className="text-[28px] font-sans font-black uppercase tracking-tight text-black dark:text-white">
          {monthNames[currentMonth]}
        </h1>
        <div className="text-[14px] font-sans mt-1 text-black/50 dark:text-[#888888]">Joined this month</div>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 text-[12px] font-sans font-bold uppercase border-b border-black/10 dark:border-white/10 text-black/50 dark:text-[#888888]">
        <div className="flex-1">MEMBER</div>
        <div className="w-24 text-right">JOINED</div>
        <div className="w-16 text-right">SINCE</div>
      </div>

      {users.length === 0 ? (
        <div className="py-16 text-center text-[13px] font-sans text-black/50 dark:text-[#888888]">
          No new members joined in {monthNames[currentMonth]} yet.
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
            className="flex items-center py-4 transition-colors hover:bg-black/5 dark:hover:bg-[#111111] border-b border-black/10 dark:border-white/10"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-sans font-bold truncate text-black dark:text-white">
                {label}
              </div>
            </div>
            <div className="w-24 text-right text-[12px] font-sans uppercase text-black/50 dark:text-[#888888]">
              {monthNames[joined.getMonth()].slice(0,3)} {joined.getFullYear()}
            </div>
            <div className="w-16 text-right text-[14px] font-sans font-bold text-black dark:text-white">
              {years > 0 ? `${years}y` : 'New'}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
