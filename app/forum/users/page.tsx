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
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">
      {/* Breadcrumb & Header */}
      <div className="mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold text-white/40">
          <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
          <span>/</span>
          <span className="text-white/80">Users</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-sans font-bold text-white tracking-tight">
              Leaderboard
            </h1>
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="flex items-center pb-3 border-b border-white/10 text-[12px] font-sans font-bold uppercase text-white/40 mb-4 px-2">
        <div className="w-12 text-center">Rank</div>
        <div className="flex-1">User</div>
        <div className="w-20 text-center hidden sm:block">Topics</div>
        <div className="w-20 text-center hidden sm:block">Posts</div>
        <div className="w-20 text-center hidden sm:block">Likes</div>
        <div className="w-24 text-right">Score</div>
      </div>

      <div className="flex flex-col gap-2">
        {rankedUsers.length > 0 ? (
          rankedUsers.map((u, i) => (
            <Link 
              href={`/forum/u/${u.walletAddress}`} 
              key={u.id} 
              className="flex items-center py-4 border border-white/5 bg-white/[0.02] hover:bg-[#1a112a] hover:border-[#6366f1]/50 rounded-sm transition-all duration-200 px-2 group"
            >
              <div className="w-12 text-center text-[16px] font-sans font-bold text-white/40 group-hover:text-white transition-colors">
                #{i + 1}
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#6366f1]/50 transition-colors">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[14px] font-sans font-bold text-white">
                       {u.walletAddress ? u.walletAddress.slice(2,3).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-[15px] font-sans font-bold text-white transition-colors">
                    {u.displayName || (u.walletAddress ? `${u.walletAddress.slice(0,6)}…${u.walletAddress.slice(-4)}` : "Anonymous")}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-sans font-bold text-[#919191]">
                      {u.tier === 'basic' ? 'Initiate' : u.tier}
                    </span>
                    {u.isPro && (
                      <span className="text-[10px] font-sans font-bold bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm">PRO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-[#919191]">
                {u.stats.topics}
              </div>
              <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-[#919191]">
                {u.stats.posts}
              </div>
              <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-[#919191]">
                {u.stats.likes}
              </div>
              <div className="w-24 text-right text-[16px] font-sans font-bold text-white">
                {u.prestigeScore}
              </div>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center text-[13px] font-sans text-white/30">
            No active users found.
          </div>
        )}
      </div>
    </div>
  );
}
