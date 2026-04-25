"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Plus } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/categories/${slug}`)
      .then(r => r.json())
      .then(data => setCategory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-12 text-center text-gray-500 text-sm">Loading category...</div>;
  if (!category || category.error) return <div className="p-12 text-center text-red-500 text-sm">Category not found.</div>;

  return (
    <div className="flex flex-col gap-0 w-full">
      
      {/* ── Discourse Breadcrumb & Controls ── */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/forum" className="text-gray-500 hover:text-black">Categories</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-md border border-gray-200 cursor-default">
            <span 
              className="w-2.5 h-2.5 rounded-sm" 
              style={{ backgroundColor: category.color }} 
            />
            <span className="font-semibold text-gray-700">{category.name}</span>
          </div>
        </div>

        <Link 
          href={`/forum/new?category=${category.id}`} 
          className="flex items-center gap-1.5 bg-[#0088CC] hover:bg-[#0077B3] text-white px-4 py-2 rounded shadow-sm text-[14px] font-medium transition-colors"
        >
          <Plus size={16} />
          New Topic
        </Link>
      </div>

      {/* Category Description */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-100 border-l-4" style={{ borderLeftColor: category.color }}>
        <p className="text-[14px] text-gray-600">
          {category.description}
        </p>
      </div>

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
          {!category.topics?.length ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No topics in this category yet. Be the first to start a discussion!
            </div>
          ) : category.topics.map((topic: any) => {
            const lastActivity = topic.updatedAt || topic.createdAt;
            const activityText = formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false });
            const avatarColor = `#${topic.author?.walletAddress.slice(2, 8)}`;

            return (
              <Link 
                key={topic.id} 
                href={`/forum/t/${topic.id}`}
                className="flex items-center py-3 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
              >
                {/* Topic Title */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-[15px] text-[#222222] font-semibold truncate leading-snug">
                    {topic.title}
                  </h3>
                </div>

                {/* Avatar */}
                <div className="w-20 hidden md:flex items-center justify-start gap-1">
                   <div 
                     className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                     style={{ backgroundColor: avatarColor }}
                   >
                     {topic.author?.walletAddress.slice(2,3).toUpperCase()}
                   </div>
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
    </div>
  );
}

