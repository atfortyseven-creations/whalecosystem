"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Plus } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);


  useEffect(() => {
    fetch(`/api/forum/categories/${slug}`)
      .then(r => r.json())
      .then(data => setCategory(data))
      .catch(console.error);
  }, [slug]);

  if (!category) return null;
  if (category.error) return <div className="p-12 text-center text-red-500 text-sm">Category not found.</div>;

  return (
    <div className="flex flex-col gap-0 w-full">
      
      {/* ── Discourse Breadcrumb & Controls ── */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/forum" className="transition-colors" style={{ color: 'var(--forum-text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--forum-text)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--forum-text-muted)'}>Categories</Link>
          <ChevronRight size={14} style={{ color: 'var(--forum-text-muted)', opacity: 0.5 }} />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-default" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)' }}>
            <span 
              className="w-2.5 h-2.5 rounded-sm" 
              style={{ backgroundColor: category.color }} 
            />
            <span className="font-semibold" style={{ color: 'var(--forum-text)' }}>{category.name}</span>
          </div>
        </div>

        <Link 
          href={`/forum/new?category=${category.id}`} 
          className="flex items-center gap-1.5 px-4 py-2 rounded shadow-sm text-[14px] font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
        >
          <Plus size={16} />
          New Topic
        </Link>
      </div>

      {/* Category Description */}
      <div className="mb-6 p-4 rounded-md border border-l-4" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)', borderLeftColor: category.color }}>
        <p className="text-[14px]" style={{ color: 'var(--forum-text-muted)' }}>
          {category.description}
        </p>
      </div>

      <div className="w-full">
        {/* ── Table Header ── */}
        <div className="flex items-center py-2 border-b text-[13px] font-normal" style={{ borderColor: 'var(--forum-border)', color: 'var(--forum-text-muted)' }}>
           <div className="flex-1">Topic</div>
           <div className="w-20 text-center hidden sm:block">Replies</div>
           <div className="w-16 text-center hidden sm:block">Views</div>
           <div className="w-20 text-right">Activity</div>
        </div>

        {/* ── Topic List ── */}
        <div className="flex flex-col">
          {!category.topics?.length ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--forum-text-muted)' }}>
              No topics in this category yet. Be the first to start a discussion!
            </div>
          ) : category.topics.map((topic: any) => {
            const lastActivity = topic.updatedAt || topic.createdAt;
            const activityText = formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false });
            const avatarColor = `#${topic.author?.walletAddress?.slice(2, 8) || '000000'}`;

            return (
              <Link 
                key={topic.id} 
                href={`/forum/t/${topic.id}`}
                className="flex items-center py-3 border-b hover:bg-[var(--forum-hover)] transition-colors"
                style={{ borderColor: 'var(--forum-border)' }}
              >
                {/* Topic Title */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-[15px] font-semibold truncate leading-snug" style={{ color: 'var(--forum-text)' }}>
                    {topic.title}
                  </h3>
                </div>

                {/* Avatar */}
                <div className="w-20 hidden md:flex items-center justify-start gap-1">
                   <div 
                     className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                     style={{ backgroundColor: avatarColor }}
                   >
                     {topic.author?.walletAddress?.slice(2,3).toUpperCase() || '?'}
                   </div>
                </div>

                {/* Stats */}
                <div className="w-16 text-center hidden sm:block text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
                  {topic._count?.posts || 0}
                </div>
                
                <div className="w-16 text-center hidden sm:block text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
                  {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}
                </div>

                {/* Activity */}
                <div className="w-20 text-right text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
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

