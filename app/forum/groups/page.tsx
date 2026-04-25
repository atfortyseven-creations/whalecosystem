import React from 'react';
import { prisma } from '@/lib/prisma';

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
  } catch (e) {
    console.error('Failed to fetch groups:', e);
  }

  const groups = [
    { id: 'ELITE',    label: 'ELITE MATRIX',        sub: 'Full node-level access',              count: groupsData.ELITE    },
    { id: 'PRO',      label: 'INSTITUTIONAL PRO',   sub: 'MEV & DeFi yield signal access',     count: groupsData.PRO      },
    { id: 'STANDARD', label: 'STANDARD OPERATORS',  sub: 'On-chain telemetry verified',         count: groupsData.STANDARD },
    { id: 'FREE',     label: 'PUBLIC OBSERVERS',     sub: 'Public consensus network',            count: groupsData.FREE     },
  ];

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#050505]/30 mb-2">FORUM / GROUPS</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
          NETWORK COHORTS
        </h1>
        <div className="text-[10px] font-mono text-[#050505]/30 mt-1">
          TOTAL: {groupsData.TOTAL} NODES
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="flex-1">COHORT</div>
        <div className="w-20 text-right">MEMBERS</div>
      </div>

      {groups.map(g => (
        <div
          key={g.id}
          className="flex items-center py-5 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-mono font-black uppercase tracking-widest text-[#050505]">
              {g.label}
            </div>
            <div className="text-[10px] font-mono text-[#050505]/40 mt-1">{g.sub}</div>
          </div>
          <div className="w-20 text-right text-[13px] font-mono font-black text-[#050505]">
            {g.count}
          </div>
        </div>
      ))}
    </div>
  );
}
