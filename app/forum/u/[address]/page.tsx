"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict, format } from 'date-fns';

export default function UserProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Activity');

  useEffect(() => {
    fetch(`/api/forum/user/${address}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <div className="p-12 text-center text-gray-500 text-sm">Loading user profile...</div>;
  if (!profile || profile.error) return <div className="p-12 text-center text-red-500 text-sm">User not found.</div>;

  const addrStr = typeof address === 'string' ? address : address[0];
  const avatarColor = `#${addrStr.slice(2, 8)}`;
  
  // Combine topics and posts for an activity feed
  const combinedActivity = [
    ...(profile.forumTopics || []).map((t: any) => ({ ...t, type: 'topic' })),
    ...(profile.forumPosts || []).map((p: any) => ({ ...p, type: 'post' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto pb-12">

      {/* ── Profile Header ── */}
      <div className="flex flex-col gap-6 mb-8 pt-4">
        <div className="flex items-center gap-6">
          <div 
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center text-[48px] text-white font-bold shadow-md"
            style={{ backgroundColor: avatarColor }}
          >
            {addrStr.slice(2,3).toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-[#222222]">
              {addrStr.slice(0, 12)}…{addrStr.slice(-4)}
            </h1>
            <span className="text-[16px] text-gray-500">{addrStr.slice(0, 6)}</span>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[13px] text-gray-500">
                Joined {format(new Date(profile.createdAt), 'MMM d, yyyy')}
              </span>
              {profile.isPro && (
                <span className="ml-2 text-[11px] uppercase font-bold text-[#D4AF37] border border-[#D4AF37] px-1.5 py-0.5 rounded-sm">
                  Pro Member
                </span>
              )}
            </div>
          </div>
          
          <div className="ml-auto self-start">
             <button className="bg-white border border-gray-300 hover:bg-gray-50 text-[#222222] px-4 py-1.5 rounded shadow-sm text-[14px] font-medium transition-colors">
               Expand
             </button>
          </div>
        </div>
      </div>

      {/* ── Horizontal Tabs ── */}
      <div className="flex border-b border-gray-200 mb-6 text-[15px]">
        {['Summary', 'Activity', 'Notifications', 'Preferences'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-blue-500 text-[#222222]' 
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Sub Tabs (If Activity is selected) ── */}
      {activeTab === 'Activity' && (
        <div className="flex gap-4 border-b border-gray-200 mb-6 text-[14px] pb-2 text-gray-500">
          <span className="font-semibold text-gray-800">All</span>
          <span className="hover:text-black cursor-pointer">Topics</span>
          <span className="hover:text-black cursor-pointer">Replies</span>
          <span className="hover:text-black cursor-pointer">Likes</span>
          <span className="hover:text-black cursor-pointer">Bookmarks</span>
        </div>
      )}

      {/* ── Tab Content ── */}
      <div className="flex flex-col">
        {combinedActivity.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No activity found for this user.</div>
        ) : (
          combinedActivity.map((item: any) => {
            const dateStr = formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true });
            if (item.type === 'topic') {
              return (
                <div key={`t-${item.id}`} className="py-4 border-b border-gray-100 flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-[13px] text-gray-500">Created a topic · {dateStr}</div>
                    <Link href={`/forum/t/${item.id}`} className="text-[15px] font-semibold text-[#0088CC] hover:underline">
                      {item.title}
                    </Link>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`p-${item.id}`} className="py-4 border-b border-gray-100 flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-[13px] text-gray-500">Replied in topic · {dateStr}</div>
                    <Link href={`/forum/t/${item.topic?.id}`} className="text-[15px] font-semibold text-[#0088CC] hover:underline">
                      {item.topic?.title || 'Unknown Topic'}
                    </Link>
                    <p className="text-[14px] text-gray-700 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
}
