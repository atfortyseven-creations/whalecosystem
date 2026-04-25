import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ForumUsersPage() {
  let rankedUsers: any[] = [];
  try {
    const users = await prisma.user.findMany({
      take: 50,
      where: {
          OR: [
              { forumTopics: { some: {} } },
              { forumPosts: { some: {} } }
          ]
      },
      include: {
          _count: {
              select: {
                  forumTopics: true,
                  forumPosts: true,
                  forumLikes: true
              }
          }
      }
    });

    rankedUsers = users.map(u => ({
        id: u.id,
        walletAddress: u.walletAddress,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        tier: u.tier,
        isPro: u.isPro,
        stats: {
            topics: u._count.forumTopics,
            posts: u._count.forumPosts,
            likes: u._count.forumLikes
        },
        prestigeScore: (u._count.forumTopics * 10) + (u._count.forumPosts * 5) + (u._count.forumLikes * 2)
    })).sort((a, b) => b.prestigeScore - a.prestigeScore);
  } catch (e) {
    console.warn("[Leaderboard Error]:", e);
  }

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">
      <div className="mb-8 pb-6 border-b border-white/20">
        <h1 className="text-[16px] font-aztec-h2 font-black uppercase tracking-tight text-white leading-snug">
          Institutional Leaderboard
        </h1>
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#00f2ea] mt-2">
          PRESTIGE & INFLUENCE RANKING
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="flex items-center py-3 border-b border-white/20 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-white/40 mb-4">
        <div className="w-12 text-center">RANK</div>
        <div className="flex-1">OPERATIVE</div>
        <div className="w-20 text-center hidden sm:block">TOPICS</div>
        <div className="w-20 text-center hidden sm:block">TRANSMISSIONS</div>
        <div className="w-20 text-center hidden sm:block">REPUTATION</div>
        <div className="w-24 text-right text-[#00f2ea]">PRESTIGE</div>
      </div>

      <div className="flex flex-col gap-2">
        {rankedUsers.length > 0 ? (
          rankedUsers.map((u, i) => (
            <Link 
              href={`/forum/u/${u.walletAddress}`} 
              key={u.id} 
              className="flex items-center py-4 border border-white/5 bg-black/20 hover:bg-white/5 transition-colors group px-2"
            >
              <div className="w-12 text-center text-[14px] font-aztec-h2 font-black text-white/40 group-hover:text-white transition-colors">
                #{i + 1}
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:border-[#00f2ea] transition-colors">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-mono font-black text-white uppercase">
                       {u.walletAddress ? u.walletAddress.slice(2,3) : '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-[12px] font-mono font-black text-white uppercase tracking-widest group-hover:text-[#00f2ea] transition-colors">
                    {u.displayName || (u.walletAddress ? `${u.walletAddress.slice(0,6)}…${u.walletAddress.slice(-4)}` : "ANONYMOUS WHALE")}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
                      {u.tier === 'basic' ? 'INITIATE' : u.tier}
                    </span>
                    {u.isPro && (
                      <span className="text-[8px] font-black bg-[#D4AF37] text-black px-1 uppercase tracking-widest">PRO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-20 text-center hidden sm:block text-[11px] font-mono text-white/50">
                {u.stats.topics}
              </div>
              <div className="w-20 text-center hidden sm:block text-[11px] font-mono text-white/50">
                {u.stats.posts}
              </div>
              <div className="w-20 text-center hidden sm:block text-[11px] font-mono text-white/50">
                {u.stats.likes}
              </div>
              <div className="w-24 text-right text-[14px] font-aztec-h2 font-black text-[#00f2ea]">
                {u.prestigeScore}
              </div>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
            [ NO INTEL TRANSMITTED YET ]
          </div>
        )}
      </div>
    </div>
  );
}
