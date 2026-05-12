import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ForumUsersPage() {
  let rankedUsers: any[] = [];

  try {
    // Try full query with extended columns
    const users = await (prisma as any).user.findMany({
      take: 50,
      where: { OR: [{ forumTopics: { some: {} } }, { forumPosts: { some: {} } }] },
      select: {
        id: true, walletAddress: true,
        displayName: true, avatarUrl: true, tier: true, isPro: true,
        _count: { select: { forumTopics: true, forumPosts: true, forumLikes: true } }
      }
    });

    rankedUsers = users.map((u: any) => ({
      id: u.id, walletAddress: u.walletAddress,
      displayName: u.displayName || null,
      avatarUrl: u.avatarUrl || null,
      tier: u.tier || 'basic', isPro: u.isPro || false,
      stats: { topics: u._count.forumTopics, posts: u._count.forumPosts, likes: u._count.forumLikes },
      prestigeScore: (u._count.forumTopics * 10) + (u._count.forumPosts * 5) + (u._count.forumLikes * 2)
    })).sort((a: any, b: any) => b.prestigeScore - a.prestigeScore);

  } catch {
    // Fallback: base columns only (no displayName / avatarUrl)
    try {
      const users = await prisma.user.findMany({
        take: 50,
        select: { id: true, walletAddress: true }
      });
      // Fetch counts separately
      const enriched = await Promise.all(users.map(async (u) => {
        let topics = 0, posts = 0, likes = 0;
        try {
          const c = await (prisma as any).user.findUnique({
            where: { id: u.id },
            select: { _count: { select: { forumTopics: true, forumPosts: true, forumLikes: true } } }
          });
          topics = c?._count?.forumTopics || 0;
          posts  = c?._count?.forumPosts  || 0;
          likes  = c?._count?.forumLikes  || 0;
        } catch {}
        return {
          ...u, displayName: null, avatarUrl: null, tier: 'basic', isPro: false,
          stats: { topics, posts, likes },
          prestigeScore: (topics * 10) + (posts * 5) + (likes * 2)
        };
      }));
      rankedUsers = enriched.filter(u => u.prestigeScore > 0).sort((a, b) => b.prestigeScore - a.prestigeScore);
    } catch (e) {
      console.warn('[Leaderboard Error]:', e);
    }
  }

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">
      {/* Breadcrumb & Header */}
      <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>
          <Link href="/forum" className="transition-opacity hover:opacity-100">Forum</Link>
          <span>/</span>
          <span style={{ color: 'var(--forum-text)' }}>Users</span>
        </div>
        <h1 className="text-[28px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>Leaderboard</h1>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 text-[12px] font-sans font-bold uppercase mb-4 px-2" style={{ borderBottom: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}>
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
              className="flex items-center py-4 rounded-sm transition-all duration-200 px-2 hover:bg-[var(--forum-hover)] hover:border-[#6366f1]"
              style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}
            >
              <div className="w-12 text-center text-[16px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>#{i + 1}</div>

              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--forum-bg)', border: '1px solid var(--forum-border)' }}>
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[14px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>{u.walletAddress?.slice(2, 3).toUpperCase() || '?'}</span>
                  }
                </div>
                <div className="flex flex-col">
                  <div className="text-[15px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>
                    {u.displayName || (u.walletAddress ? `${u.walletAddress.slice(0, 6)}…${u.walletAddress.slice(-4)}` : 'Anonymous')}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>
                      {u.tier === 'basic' ? 'Initiate' : u.tier}
                    </span>
                    {u.isPro && <span className="text-[10px] font-sans font-bold bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm">PRO</span>}
                  </div>
                </div>
              </div>

              <div className="w-20 text-center hidden sm:block text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{u.stats.topics}</div>
              <div className="w-20 text-center hidden sm:block text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{u.stats.posts}</div>
              <div className="w-20 text-center hidden sm:block text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{u.stats.likes}</div>
              <div className="w-24 text-right text-[16px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>{u.prestigeScore}</div>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>No active users found.</div>
        )}
      </div>
    </div>
  );
}
