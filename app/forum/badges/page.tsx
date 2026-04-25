import React from 'react';

export default function ForumBadgesPage() {
  const badges = [
    { id: 'genesis',      label: 'GENESIS FOUNDER',    sub: 'First 10,000 protocol participants',    rarity: 'LEGENDARY' },
    { id: 'pro',          label: 'INSTITUTIONAL PRO',  sub: 'Active Sovereign Terminal subscribers',  rarity: 'EPIC'      },
    { id: 'human',        label: 'VERIFIED HUMAN',      sub: 'World ID or KYC verified identity',      rarity: 'STANDARD'  },
    { id: 'signal',       label: 'SIGNAL PROVIDER',     sub: 'Topics exceeding 100 community votes',   rarity: 'RARE'      },
  ];

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#050505]/30 mb-2">FORUM / BADGES</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
          CRYPTOGRAPHIC ACHIEVEMENTS
        </h1>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="flex-1">DESIGNATION</div>
        <div className="w-28 text-right">TIER</div>
      </div>

      {badges.map(b => (
        <div
          key={b.id}
          className="flex items-center py-5 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-mono font-black uppercase tracking-widest text-[#050505]">
              {b.label}
            </div>
            <div className="text-[10px] font-mono text-[#050505]/40 mt-1">{b.sub}</div>
          </div>
          <div className="w-28 text-right text-[9px] font-mono font-black uppercase tracking-[0.15em] text-[#050505]/40">
            {b.rarity}
          </div>
        </div>
      ))}
    </div>
  );
}
