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

      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div className="text-[12px] font-sans font-bold mb-2" style={{ color: 'var(--forum-text-muted)' }}>FORUM / ANNIVERSARIES</div>
        <h1 className="text-[28px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
          {monthNames[currentMonth]}
        </h1>
        <div className="text-[14px] font-sans mt-1" style={{ color: 'var(--forum-text-muted)' }}>JOINED THIS MONTH</div>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 text-[12px] font-sans font-bold uppercase" style={{ borderBottom: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}>
        <div className="flex-1">NODE</div>
        <div className="w-24 text-right">EPOCH</div>
        <div className="w-16 text-right">YRS</div>
      </div>

      {users.length === 0 ? (
        <div className="py-16 text-center text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
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
            className="flex items-center py-4 transition-colors hover:bg-[var(--forum-hover)]"
            style={{ borderBottom: '1px solid var(--forum-border)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-sans font-bold truncate" style={{ color: 'var(--forum-text)' }}>
                {label}
              </div>
            </div>
            <div className="w-24 text-right text-[12px] font-sans uppercase" style={{ color: 'var(--forum-text-muted)' }}>
              {monthNames[joined.getMonth()].slice(0,3)} {joined.getFullYear()}
            </div>
            <div className="w-16 text-right text-[14px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>
              {years > 0 ? `+${years}Y` : '—'}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
