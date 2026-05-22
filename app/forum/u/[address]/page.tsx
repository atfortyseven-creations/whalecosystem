"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
export default function UserProfilePage() {
  const { address } = useParams() as { address: string | string[] };
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/user/${address}/summary`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setProfile(data);
        else setProfile({ error: true });
      })
      .catch(() => setProfile({ error: true }))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return (
    <div className="py-20 text-center text-[13px] font-sans animate-pulse" style={{ color: 'var(--forum-text-muted)' }}>
      Loading profile...
    </div>
  );

  if (!profile || profile.error) return (
    <div className="py-20 text-center text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
      [ NODE NOT FOUND ]
    </div>
  );

  const user = profile.user || profile;
  const addrStr = typeof address === 'string' ? address : address[0];
  const avatarColor = `hsl(${parseInt(addrStr.slice(2, 8), 16) % 360}, 45%, 45%)`;

  // Merge topics + replies into a unified activity feed
  const activityFeed = [
    ...(user.forumTopics || []).map((t: any) => ({ ...t, _kind: 'TOPIC' as const })),
    ...(user.forumPosts  || []).map((p: any) => ({ ...p, _kind: 'REPLY' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const topicCount = user._count?.forumTopics || user.forumTopics?.length || 0;
  const replyCount = user._count?.forumPosts  || user.forumPosts?.length  || 0;
  const likeCount  = user._count?.forumLikes  || 0;

  return (
    <div className="w-full max-w-[860px] mx-auto py-10 px-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)' }}>
        <Link href="/forum" className="transition-opacity hover:opacity-100">Forum</Link>
        <span>/</span>
        <span style={{ color: 'var(--forum-text)' }}>Profile</span>
      </div>

      {/* ── Avatar + Identity Block ── */}
      <div className="flex items-center gap-6 mb-8 pb-8" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div
          className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-[28px] font-sans font-bold text-white overflow-hidden"
          style={{ backgroundColor: avatarColor, border: '2px solid var(--forum-border)' }}
        >
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : addrStr.slice(2, 3).toUpperCase()
          }
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[22px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
              {user.displayName || `${addrStr.slice(0, 8)}…${addrStr.slice(-4)}`}
            </span>
            {user.isPro && (
              <span className="text-[10px] font-sans font-bold bg-[#D4AF37] text-black px-2 py-0.5 rounded-sm">PRO</span>
            )}
          </div>

          <div className="text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
            {user.bio || 'Sovereign Agent'} · {user.tier || 'FREE'}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-2 flex-wrap">
            <StatPill label="Topics" value={topicCount} />
            <StatPill label="Replies" value={replyCount} />
            <StatPill label="Likes" value={likeCount} gold />
            <span className="text-[12px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Activity Feed ── */}
      <div className="mb-4">
        <h2 className="text-[13px] font-sans font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--forum-text-muted)' }}>
          Activity · {activityFeed.length} contributions
        </h2>

        {activityFeed.length === 0 ? (
          <div className="py-16 text-center text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
            No activity yet.
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {activityFeed.map((item: any, i: number) => (
              <ActivityItem key={`${item._kind}-${item.id}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatPill({ label, value, gold }: { label: string; value: number; gold?: boolean }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-sm" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
      <span className="text-[18px] font-sans font-bold" style={{ color: gold ? '#D4AF37' : 'var(--forum-text)' }}>{value}</span>
      <span className="text-[10px] font-sans uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>{label}</span>
    </div>
  );
}

function ActivityItem({ item }: { item: any }) {
  const isTopic = item._kind === 'TOPIC';
  const href = isTopic ? `/forum/t/${item.id}` : `/forum/t/${item.topicId || item.id}`;
  const title = isTopic ? item.title : (item.topic?.title || 'Reply');
  const preview = !isTopic ? (item.content?.slice(0, 120) + (item.content?.length > 120 ? '…' : '')) : (item.content?.slice(0, 100) + (item.content?.length > 100 ? '…' : ''));
  const timeAgo = item.createdAt
    ? formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true })
    : '';

  return (
    <Link
      href={href}
      className="flex items-start gap-4 py-4 transition-all rounded-sm -mx-2 px-2 hover:bg-[var(--forum-hover)]"
      style={{ borderBottom: '1px solid var(--forum-border)' }}
    >
      {/* Type badge */}
      <div className="shrink-0 mt-0.5">
        <span
          className="text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-sm"
          style={{
            backgroundColor: isTopic ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            color: isTopic ? '#6366f1' : 'var(--forum-text-muted)',
            border: `1px solid ${isTopic ? 'rgba(99,102,241,0.3)' : 'var(--forum-border)'}`,
          }}
        >
          {isTopic ? 'Topic' : 'Reply'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-sans font-bold mb-0.5 truncate" style={{ color: 'var(--forum-text)' }}>
          {title}
        </div>
        {preview && (
          <div className="text-[13px] font-sans leading-[1.5] line-clamp-2" style={{ color: 'var(--forum-text-muted)' }}>
            {preview}
          </div>
        )}
      </div>

      {/* Time */}
      <div className="shrink-0 text-[12px] font-sans mt-0.5" style={{ color: 'var(--forum-text-muted)' }}>
        {timeAgo}
      </div>
    </Link>
  );
}
