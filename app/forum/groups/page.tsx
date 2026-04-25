import React from 'react';
import { prisma } from '@/lib/prisma';
import { UsersRound, Shield, Zap, Lock, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function ForumGroupsPage() {
  let groupsData = {
    ELITE: 0,
    PRO: 0,
    STANDARD: 0,
    FREE: 0,
    TOTAL: 0
  };

  try {
    const groupCounts = await (prisma as any).user.groupBy({
      by: ['tier'],
      _count: {
        id: true,
      },
    });

    let total = 0;
    groupCounts.forEach((g: any) => {
      const t = g.tier || 'FREE';
      if (t in groupsData) {
        // @ts-ignore
        groupsData[t] += g._count.id;
      }
      total += g._count.id;
    });
    groupsData.TOTAL = total;

  } catch (e) {
    console.error("Failed to fetch groups:", e);
  }

  const groups = [
    {
      id: 'elite',
      name: 'Elite Matrix',
      description: 'The highest echelon of Sovereign Terminal users with full node-level access.',
      count: groupsData.ELITE,
      icon: <Lock className="w-6 h-6 text-black" />,
      color: 'bg-black text-white',
      border: 'border-black'
    },
    {
      id: 'pro',
      name: 'Institutional Pro',
      description: 'Professional traders with access to real-time MEV and DeFi yield signals.',
      count: groupsData.PRO,
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 text-blue-700',
      border: 'border-blue-200'
    },
    {
      id: 'standard',
      name: 'Standard Operators',
      description: 'Verified users with basic access to on-chain telemetry tools.',
      count: groupsData.STANDARD,
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      color: 'bg-yellow-50 text-yellow-700',
      border: 'border-yellow-200'
    },
    {
      id: 'free',
      name: 'Public Observers',
      description: 'General platform users observing the public consensus network.',
      count: groupsData.FREE,
      icon: <Globe className="w-6 h-6 text-gray-500" />,
      color: 'bg-gray-50 text-gray-700',
      border: 'border-gray-200'
    }
  ];

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto pb-20">
      <div className="mb-6 border-b border-gray-200 pb-4 flex items-center gap-3">
        <UsersRound size={32} className="text-[#222222]" />
        <div>
          <h1 className="text-[24px] font-bold text-[#222222]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Network Groups
          </h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Browse the active cohorts and permission tiers within the terminal. Total users: {groupsData.TOTAL}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.id} className={`border rounded-md p-6 flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-1 ${g.border}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-md ${g.color}`}>
                  {g.icon}
                </div>
                <div className="text-right">
                  <span className="block text-[24px] font-bold text-[#222222]">{g.count}</span>
                  <span className="text-[12px] uppercase tracking-wide text-gray-500 font-bold">Members</span>
                </div>
              </div>
              <h3 className="font-bold text-[18px] text-[#222222] mb-2">{g.name}</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed min-h-[40px]">
                {g.description}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button className="text-[13px] font-semibold text-[#0088CC] hover:underline" disabled>
                View Members (Locked)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
