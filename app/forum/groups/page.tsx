import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic   = 'force-dynamic';
export const revalidate = 60;

export default async function ForumGroupsPage() {
  let groupsData = { ELITE: 0, PRO: 0, STANDARD: 0, FREE: 0, TOTAL: 0 };

  try {
    const groupCounts = await (prisma as any).user.groupBy({
      by: ['tier'],
      _count: { id: true },
    });
    let total = 0;
    groupCounts.forEach((g: any) => {
      const t = g.tier || 'FREE';
      if (t in groupsData) (groupsData as any)[t] += g._count.id;
      total += g._count.id;
    });
    groupsData.TOTAL = total;
  } catch {
    // tier column may not exist yet — silently show zero counts
    // (run /api/admin/sync-db to apply schema and reload)
  }

  const groups = [
    { id: 'ELITE',    label: 'Elite Matrix',        sub: 'Full node-level access',              count: groupsData.ELITE    },
    { id: 'PRO',      label: 'Institutional Pro',   sub: 'MEV & DeFi yield signal access',      count: groupsData.PRO      },
    { id: 'STANDARD', label: 'Standard Operators',  sub: 'On-chain telemetry verified',         count: groupsData.STANDARD },
    { id: 'FREE',     label: 'Public Observers',    sub: 'Public consensus network',            count: groupsData.FREE     },
  ];

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* Breadcrumb & Header */}
      <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>
          <Link href="/forum" className="transition-colors hover:opacity-100">Forum</Link>
          <span>/</span>
          <span style={{ color: 'var(--forum-text)' }}>Groups</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
              Network Cohorts
            </h1>
            <div className="text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
              Total: <span className="font-bold" style={{ color: 'var(--forum-text)' }}>{groupsData.TOTAL} Nodes</span>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
         {groups.map(g => (
           <div
             key={g.id}
             className="flex items-center py-4 px-4 rounded-sm transition-all duration-200 hover:bg-[var(--forum-hover)] hover:border-[#6366f1]"
             style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}
           >
             <div className="flex-1 min-w-0">
               <div className="text-[16px] font-sans font-bold transition-colors" style={{ color: 'var(--forum-text)' }}>
                 {g.label}
               </div>
               <div className="text-[13px] font-sans mt-1" style={{ color: 'var(--forum-text-muted)' }}>{g.sub}</div>
             </div>
             <div className="w-24 flex items-center justify-end gap-2">
               <span className="text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>Members</span>
               <div className="text-[18px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>
                 {g.count}
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
