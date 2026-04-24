"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function UserProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/user/${address}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">[ RESOLVING_ENTITY ]</div>;
  if (!profile || profile.error) return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-red-500">[ ENTITY_NOT_FOUND ]</div>;

  const snr = (profile._count?.forumPosts || 0) + ((profile._count?.forumTopics || 0) * 2) + (profile._count?.forumLikes || 0);
  const memberSinceDays = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">

      {/* ── Entity Header ── */}
      <div className="mb-12 border-b-[0.5px] border-black/10 pb-8 flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {profile.isPro ? (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/50 px-1.5 py-0.5">POSG_VERIFIED</span>
            ) : (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/40 border border-black/10 px-1.5 py-0.5">T_{profile.tier}</span>
            )}
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/30">
              on_chain: {memberSinceDays}d
            </span>
          </div>
          <h1 className="font-mono text-[18px] sm:text-[22px] font-black uppercase tracking-widest text-[#050505]">
            {profile.walletAddress.slice(0, 12)}…{profile.walletAddress.slice(-8)}
          </h1>
        </div>

        {/* Entity Stats Block */}
        <div className="flex gap-8 sm:gap-12">
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[24px] font-black text-[#050505] leading-none">{snr}</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#050505]/30">SNR_Score</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[24px] font-black text-[#050505] leading-none">{profile._count?.forumTopics || 0}</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#050505]/30">Intel_Sent</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[24px] font-black text-[#050505] leading-none">{profile._count?.forumPosts || 0}</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#050505]/30">Responses</span>
          </div>
        </div>
      </div>

      {/* ── Activity Feed ── */}
      <div className="flex flex-col gap-[1px]">
        {(!profile.forumTopics?.length && !profile.forumPosts?.length) ? (
          <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">[ NO_TELEMETRY_FOUND ]</div>
        ) : (
          <>
            {profile.forumTopics?.map((topic: any) => (
              <Link key={`t-${topic.id}`} href={`/forum/t/${topic.id}`} className="flex items-start gap-6 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-blue-600 border border-blue-500/20 px-1 py-0.5">INTEL_DEPLOYED</span>
                    <span className="font-mono text-[8px] text-[#050505]/30">{new Date(topic.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-serif text-[15px] text-[#050505] group-hover:underline truncate">{topic.title}</span>
                </div>
              </Link>
            ))}
            {profile.forumPosts?.map((post: any) => (
              <Link key={`p-${post.id}`} href={`/forum/t/${post.topic?.id}`} className="flex items-start gap-6 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-emerald-600 border border-emerald-500/20 px-1 py-0.5">RESPONSE_LOGGED</span>
                    <span className="font-mono text-[8px] text-[#050505]/30">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-serif text-[13px] text-[#050505]/60">replied in: <span className="text-[#050505] group-hover:underline">{post.topic?.title || '—'}</span></span>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
