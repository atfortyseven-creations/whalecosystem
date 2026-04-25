"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function UserProfilePage() {
  const { address }                     = useParams();
  const [profile, setProfile]           = useState<any>(null);
  const [activeTab, setActiveTab]       = useState<'ACTIVITY' | 'TOPICS' | 'REPLIES'>('ACTIVITY');

  useEffect(() => {
    fetch(`/api/forum/user/${address}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(console.error);
  }, [address]);

  if (!profile) return null;
  if (profile.error) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
      [ NODE NOT FOUND ]
    </div>
  );

  const addrStr = typeof address === 'string' ? address : address[0];
  const avatarColor = `#${addrStr.slice(2, 8)}`;

  const activity = [
    ...(profile.forumTopics || []).map((t: any) => ({ ...t, _type: 'TOPIC' })),
    ...(profile.forumPosts  || []).map((p: any) => ({ ...p, _type: 'REPLY' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = activeTab === 'ACTIVITY'
    ? activity
    : activity.filter(i => i._type === (activeTab === 'TOPICS' ? 'TOPIC' : 'REPLY'));

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
        <Link href="/forum" className="hover:text-[#050505] transition-colors">FORUM</Link>
        <span>/</span>
        <span className="text-[#050505]">NODE</span>
      </div>

      {/* Profile block */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#E0E0E0]">
        <div
          className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-[18px] font-mono font-black text-white overflow-hidden border border-[#E0E0E0]"
          style={{ backgroundColor: avatarColor }}
        >
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : addrStr.slice(2, 3).toUpperCase()
          }
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-mono font-black uppercase tracking-widest text-[#050505]">
              {profile.displayName || `${addrStr.slice(0, 8)}…${addrStr.slice(-4)}`}
            </span>
            {profile.isPro && (
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37] px-1.5 py-0.5">
                PRO
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono text-[#050505]/30 uppercase tracking-widest">
            {addrStr.slice(0, 10)}…{addrStr.slice(-6)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-[#050505]/40 uppercase tracking-[0.15em]">
            <span>{(profile.forumTopics || []).length} TOPICS</span>
            <span>·</span>
            <span>{(profile.forumPosts  || []).length} REPLIES</span>
            <span>·</span>
            <span>{profile.tier || 'FREE'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E0E0E0] mb-0 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
        {(['ACTIVITY', 'TOPICS', 'REPLIES'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#050505] text-[#050505]'
                : 'border-transparent text-[#050505]/30 hover:text-[#050505]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
            [ NO TRANSMISSIONS ]
          </div>
        ) : filtered.map((item, i) => {
          const time = formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: false });
          const href = item._type === 'TOPIC'
            ? `/forum/t/${item.id}`
            : `/forum/t/${item.topicId}`;
          const label = item._type === 'TOPIC'
            ? (item.title || 'Untitled')
            : (item.content?.slice(0, 80) || '—');

          return (
            <Link
              key={i}
              href={href}
              className="flex items-center gap-4 py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors group"
            >
              <span className="text-[9px] font-mono font-black text-[#050505]/20 w-14 shrink-0 uppercase">
                {item._type}
              </span>
              <span className="flex-1 text-[12px] font-mono text-[#050505] truncate group-hover:underline underline-offset-2">
                {label}
              </span>
              <span className="text-[10px] font-mono text-[#050505]/30 whitespace-nowrap">
                {time.replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
