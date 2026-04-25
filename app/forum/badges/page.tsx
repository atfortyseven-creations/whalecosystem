import React from 'react';
import Link from 'next/link';

export default function ForumBadgesPage() {
  const badges = [
    { id: 'genesis',      label: 'Genesis Founder',    sub: 'First 10,000 protocol participants',    rarity: 'Legendary' },
    { id: 'pro',          label: 'Institutional Pro',  sub: 'Active Sovereign Terminal subscribers',  rarity: 'Epic'      },
    { id: 'human',        label: 'Verified Human',      sub: 'World ID or KYC verified identity',      rarity: 'Standard'  },
    { id: 'signal',       label: 'Signal Provider',     sub: 'Topics exceeding 100 community votes',   rarity: 'Rare'      },
  ];

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* Breadcrumb & Header */}
      <div className="mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold text-white/40">
          <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
          <span>/</span>
          <span className="text-white/80">Badges</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-sans font-bold text-white tracking-tight">
              Cryptographic Achievements
            </h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
         {badges.map(b => (
           <div
             key={b.id}
             className="flex items-center py-4 px-4 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-[#1a112a] hover:border-[#6366f1]/50 transition-all duration-200"
           >
             <div className="flex-1 min-w-0">
               <div className="text-[16px] font-sans font-bold text-white">
                 {b.label}
               </div>
               <div className="text-[13px] font-sans text-[#919191] mt-1">{b.sub}</div>
             </div>
             <div className="w-28 flex items-center justify-end">
               <span className="text-[13px] font-sans font-bold text-white/60 bg-white/5 px-3 py-1 rounded-sm border border-white/5">
                 {b.rarity}
               </span>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
