"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { SummaryTab } from '@/components/forum/profile/SummaryTab';
import { ActivityTab } from '@/components/forum/profile/ActivityTab';
import { BadgesTab } from '@/components/forum/profile/BadgesTab';

export default function UserProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'ACTIVITY' | 'BADGES'>('SUMMARY');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We hit the new Summary API which aggregates all the data
    fetch(`/api/forum/user/${address}/summary`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setProfile(data.user);
          setSummary(data);
        } else {
          setProfile({ error: true });
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setProfile({ error: true });
        setLoading(false);
      });
  }, [address]);

  if (loading) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
      [ SYNCING NODE DATA... ]
    </div>
  );

  if (!profile || profile.error) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
      [ NODE NOT FOUND ]
    </div>
  );

  const addrStr = typeof address === 'string' ? address : address[0];
  const avatarColor = `#${addrStr.slice(2, 8)}`;

  // Construct generic activity feed for ActivityTab
  const activityItems = [
    ...(profile.forumTopics || []).map((t: any) => ({ ...t, _type: 'TOPIC' })),
    ...(profile.forumPosts || []).map((p: any) => ({ ...p, _type: 'REPLY' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-[24px] font-mono font-black text-white overflow-hidden border border-[#E0E0E0]"
          style={{ backgroundColor: avatarColor }}
        >
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : addrStr.slice(2, 3).toUpperCase()
          }
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-mono font-black uppercase tracking-widest text-[#050505]">
              {profile.displayName || `${addrStr.slice(0, 8)}…${addrStr.slice(-4)}`}
            </span>
            {profile.isPro && (
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37] px-1.5 py-0.5">
                PRO
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#050505]/50 uppercase tracking-widest">
            <span>{profile.bio || "SOVEREIGN AGENT"}</span>
            <span>·</span>
            <span>{profile.tier || 'FREE'}</span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-[#050505]/40 uppercase tracking-[0.15em]">
            <span>JOINED {new Date(profile.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span>{(profile._count?.forumTopics || 0)} TOPICS</span>
            <span>·</span>
            <span>{(profile._count?.forumPosts || 0)} REPLIES</span>
            <span>·</span>
            <span className="text-[#D4AF37]">♥ {(profile._count?.forumLikes || 0)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E0E0E0] mb-8 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
        {(['SUMMARY', 'ACTIVITY', 'BADGES'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#050505] text-[#050505]'
                : 'border-transparent text-[#050505]/30 hover:text-[#050505]'
            }`}
          >
            {tab === 'BADGES' ? `BADGES (${summary.badges?.length || 0})` : tab}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      <div className="flex flex-col">
        {activeTab === 'SUMMARY' && <SummaryTab summary={summary} />}
        {activeTab === 'ACTIVITY' && <ActivityTab items={activityItems} />}
        {activeTab === 'BADGES' && <BadgesTab badges={summary?.badges || []} />}
      </div>

    </div>
  );
}
