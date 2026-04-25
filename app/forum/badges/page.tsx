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
      <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>
          <Link href="/forum" className="transition-colors hover:opacity-100">Forum</Link>
          <span>/</span>
          <span style={{ color: 'var(--forum-text)' }}>Badges</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
              Cryptographic Achievements
            </h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
         {badges.map(b => (
           <div
             key={b.id}
             className="flex items-center py-4 px-4 rounded-sm transition-all duration-200 hover:bg-[var(--forum-hover)] hover:border-[#6366f1]"
             style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}
           >
             <div className="flex-1 min-w-0">
               <div className="text-[16px] font-sans font-bold transition-colors" style={{ color: 'var(--forum-text)' }}>
                 {b.label}
               </div>
               <div className="text-[13px] font-sans mt-1" style={{ color: 'var(--forum-text-muted)' }}>{b.sub}</div>
             </div>
             <div className="w-28 flex items-center justify-end">
               <span className="text-[13px] font-sans font-bold px-3 py-1 rounded-sm" style={{ backgroundColor: 'var(--forum-bg)', border: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}>
                 {b.rarity}
               </span>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
