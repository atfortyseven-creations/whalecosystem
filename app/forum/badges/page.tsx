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
      <div className="mb-8 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold text-black/50 dark:text-[#888888]">
          <Link href="/forum" className="transition-colors hover:opacity-100">Forum</Link>
          <span>/</span>
          <span className="text-black dark:text-white">Badges</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-sans font-black uppercase tracking-tight text-black dark:text-white">
              Cryptographic Achievements
            </h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
         {badges.map(b => (
           <div
             key={b.id}
             className="flex items-center py-4 px-4 rounded-xl transition-all duration-200 bg-black/5 dark:bg-[#111111] border border-black/10 dark:border-white/10 hover:border-[#00C076] dark:hover:border-[#00C076]"
           >
             <div className="flex-1 min-w-0">
               <div className="text-[16px] font-sans font-bold transition-colors text-black dark:text-white">
                 {b.label}
               </div>
               <div className="text-[13px] font-sans mt-1 text-black/50 dark:text-[#888888]">{b.sub}</div>
             </div>
             <div className="w-28 flex items-center justify-end">
               <span className="text-[11px] uppercase tracking-widest font-sans font-bold px-3 py-1 rounded-sm bg-[#FAF9F6] dark:bg-[#050505] border border-black/10 dark:border-white/10 text-black/50 dark:text-[#888888]">
                 {b.rarity}
               </span>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
