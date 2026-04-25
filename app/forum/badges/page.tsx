import React from 'react';
import { Award, Star, Zap, ShieldCheck } from 'lucide-react';

export default function ForumBadgesPage() {
  const badges = [
    {
      id: 1,
      name: 'Genesis Founder',
      description: 'Awarded to early adopters who minted the first 10,000 Golden Tickets.',
      icon: <Award className="text-yellow-500 w-8 h-8" />,
      color: 'bg-yellow-50 border-yellow-200',
      rarity: 'Legendary'
    },
    {
      id: 2,
      name: 'Institutional Pro',
      description: 'Active Sovereign Terminal Pro subscribers with access to advanced telemetry.',
      icon: <Star className="text-blue-500 w-8 h-8" />,
      color: 'bg-blue-50 border-blue-200',
      rarity: 'Epic'
    },
    {
      id: 3,
      name: 'Verified Human',
      description: 'Cryptographically verified via World ID or strictly passing KYC screening.',
      icon: <ShieldCheck className="text-green-500 w-8 h-8" />,
      color: 'bg-green-50 border-green-200',
      rarity: 'Common'
    },
    {
      id: 4,
      name: 'Signal Provider',
      description: 'Users whose forum topics have reached over 100 upvotes from the community.',
      icon: <Zap className="text-purple-500 w-8 h-8" />,
      color: 'bg-purple-50 border-purple-200',
      rarity: 'Rare'
    }
  ];

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto pb-20">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-[24px] font-bold text-[#222222]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Platform Badges
        </h1>
        <p className="text-gray-500 text-[14px] mt-1">
          Cryptographic achievements and institutional tiers within the Sovereign Network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className={`flex items-start gap-4 p-5 rounded-md border shadow-sm ${badge.color}`}>
            <div className="shrink-0 p-3 bg-white rounded-full shadow-sm border border-black/5">
              {badge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[16px] text-[#222222]">{badge.name}</h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-black/10 font-bold text-gray-600">
                  {badge.rarity}
                </span>
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
