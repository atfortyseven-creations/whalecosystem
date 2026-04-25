"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronDown, Plus } from 'lucide-react';

export default function ForumHomePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/topics?limit=30')
      .then(r => r.json())
      .then(data => {
          if (Array.isArray(data)) {
              setTopics(data);
          } else {
              console.error("API returned error:", data);
              setTopics([]);
          }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-0 w-full">
      
      {/* ── Discourse Sub-Navigation ── */}
      {/* PERF: flex-col on mobile prevents element stacking. md:flex-row aligns on desktop. */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3 w-full">
        <div className="flex items-center gap-2 sm:gap-4 text-[14px] w-full overflow-x-auto pb-1 hide-scrollbar">
          <Link href="/forum" className="flex shrink-0 items-center gap-1.5 text-gray-600 hover:text-black cursor-pointer bg-gray-100/50 px-2.5 py-1.5 rounded-md border border-gray-200 text-[13px]">
            <span>Categories</span>
            <ChevronDown size={13} />
          </Link>
          <Link href="/forum" className="flex shrink-0 items-center gap-1.5 text-gray-600 hover:text-black cursor-pointer bg-gray-100/50 px-2.5 py-1.5 rounded-md border border-gray-200 text-[13px]">
            <span>Tags</span>
            <ChevronDown size={13} />
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-5 ml-1 font-semibold whitespace-nowrap shrink-0 text-[13px]">
            <Link href="/forum" className="text-gray-500 hover:text-black transition-colors">Categories</Link>
            <Link href="/forum" className="text-blue-500 border-b-2 border-blue-500 pb-0.5">Latest</Link>
            <Link href="/forum" className="text-gray-500 hover:text-black transition-colors">New</Link>
            <Link href="/forum" className="text-gray-500 hover:text-black transition-colors">Top</Link>
          </div>
        </div>

        <Link 
          href="/forum/new" 
          className="flex shrink-0 self-start md:self-auto items-center gap-1.5 bg-[#0088CC] hover:bg-[#0077B3] text-white px-4 py-2 rounded shadow-sm text-[13px] font-medium"
        >
          <Plus size={15} />
          New Topic
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          Loading topics...
        </div>
      ) : (
        <div className="w-full">
          {/* ── Table Header ── */}
          <div className="flex items-center py-2 border-b border-gray-300 text-[13px] text-gray-500 font-normal">
             <div className="flex-1">Topic</div>
             <div className="w-20 text-center hidden sm:block">Replies</div>
             <div className="w-16 text-center hidden sm:block">Views</div>
             <div className="w-20 text-right">Activity</div>
          </div>

          {/* ── Topic List ── */}
          <div className="flex flex-col">
            {topics.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No topics found. Be the first to start a discussion!
              </div>
            ) : topics.map(topic => {
              // Calculate activity time
              const lastActivity = topic.updatedAt || topic.createdAt;
              const activityText = formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false });
              
              // Generate pseudo-avatar for the author based on address
              const avatarColor = `#${topic.author.walletAddress.slice(2, 8)}`;

              return (
                <Link 
                  key={topic.id} 
                  href={`/forum/t/${topic.id}`}
                  className="flex items-center py-3 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Topic Title & Category */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-[15px] text-[#222222] font-semibold truncate leading-snug">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-sm" 
                        style={{ backgroundColor: topic.category.color }} 
                      />
                      <span className="text-[12px] text-gray-500">
                        {topic.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Avatars (Discourse style shows recent participants, we show author for now) */}
                  <div className="w-20 hidden md:flex items-center justify-start gap-1">
                     {topic.author.avatarUrl ? (
                        <img src={topic.author.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100" />
                     ) : (
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {topic.author.walletAddress.slice(2,3).toUpperCase()}
                        </div>
                     )}
                  </div>

                  {/* Stats */}
                  <div className="w-16 text-center hidden sm:block text-[13px] text-gray-500">
                    {topic._count?.posts || 0}
                  </div>
                  
                  <div className="w-16 text-center hidden sm:block text-[13px] text-gray-500">
                    {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}
                  </div>

                  {/* Activity */}
                  <div className="w-20 text-right text-[13px] text-gray-500">
                    {activityText.replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd').replace(' months', 'mo')}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

