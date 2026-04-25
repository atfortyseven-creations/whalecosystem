"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict, format } from 'date-fns';

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic]               = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [replyError, setReplyError]     = useState('');

  const fetchTopic = () => {
    fetch(`/api/forum/topics/${id}`)
      .then(r => r.json())
      .then(data => setTopic(data))
      .catch(console.error);
  };

  useEffect(() => { if (id) fetchTopic(); }, [id]);

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setReplyError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: id, content: replyContent }),
      });
      if (res.ok) {
        setReplyContent('');
        fetchTopic();
      } else {
        const err = await res.json();
        setReplyError(err.error?.toUpperCase() || 'TRANSMISSION FAILED');
      }
    } catch (e) {
      setReplyError('NETWORK ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  if (!topic) return (
    <div className="py-20 text-center text-[13px] font-sans text-white/30 animate-pulse">
      Loading topic...
    </div>
  );

  if (topic.error) return (
    <div className="py-20 text-center text-[13px] font-sans text-red-400">
      Topic not found.
    </div>
  );

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* Topic Header */}
      <div className="mb-8 pb-4">
        <h1 className="text-[24px] md:text-[28px] font-sans font-bold leading-[1.3] tracking-[-0.01em] text-white mb-3">
          {topic.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {topic.category && (
            <Link href={`/forum/c/${topic.category.slug}`} className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.category.color || '#6366f1' }} />
              <span className="text-[12px] font-sans font-bold text-white/80">{topic.category.name}</span>
            </Link>
          )}
          {topic.tags?.map((tag: any) => (
            <span key={tag.id} className="text-[12px] font-sans text-[#919191] before:content-['#'] before:mr-[1px]">
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Posts (Left 9 cols) + Timeline (Right 3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px]">
        
        <div className="lg:col-span-9 flex flex-col border-t border-white/5">
          <PostRow entity={topic} type="topic" onLike={fetchTopic} index={1} />
          {(topic.posts || []).map((post: any, i: number) => (
            <PostRow key={post.id} entity={post} type="post" onLike={fetchTopic} index={i + 2} />
          ))}

          {/* Reply composer */}
          <div id="reply-composer" className="mt-8 flex gap-6">
             {/* Empty spacer for the avatar column alignment */}
             <div className="w-[60px] shrink-0 hidden sm:block"></div>
             <div className="flex-1">
                <div className="border border-white/10 bg-white/[0.02] rounded-md overflow-hidden">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-5 py-4 text-[14px] font-sans text-white placeholder-white/30 bg-transparent focus:outline-none resize-none min-h-[140px] leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-black/20">
                    <button
                      onClick={submitReply}
                      disabled={submitting || !replyContent.trim()}
                      className="text-[13px] font-sans font-bold text-black bg-[#6366f1] px-5 py-2 rounded-sm hover:bg-[#4f46e5] transition-colors disabled:opacity-40"
                    >
                      {submitting ? 'Replying...' : 'Reply'}
                    </button>
                    {replyError && (
                      <span className="text-[12px] font-sans font-bold text-red-400">
                        {replyError}
                      </span>
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Timeline Sidebar (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
           <div className="sticky top-[120px] border-l-2 border-white/10 pl-6 py-2">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between text-[13px] font-sans text-white/50">
                    <span>Created</span>
                    <span className="font-bold text-white/80">
                       {topic.createdAt ? format(new Date(topic.createdAt), 'MMM d') : ''}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans text-white/50">
                    <span>Last Reply</span>
                    <span className="font-bold text-white/80">
                       {topic.updatedAt ? formatDistanceToNowStrict(new Date(topic.updatedAt)) : ''}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans text-white/50">
                    <span>Replies</span>
                    <span className="font-bold text-white/80">{topic._count?.posts || 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans text-white/50">
                    <span>Views</span>
                    <span className="font-bold text-white/80">{topic.views || 0}</span>
                 </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[13px] font-sans font-bold text-white transition-colors"
                  >
                    Reply
                  </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function PostRow({ entity, type, onLike, index }: { entity: any; type: 'topic' | 'post'; onLike: () => void; index: number }) {
  const [liked, setLiked] = useState(false);
  const addr  = entity.author?.walletAddress || '';
  const label = entity.author?.displayName || (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'ANONYMOUS');
  const time  = entity.createdAt ? format(new Date(entity.createdAt), 'MMM d, yyyy') : '';

  const handleLike = async () => {
    try {
      const res = await fetch('/api/forum/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'topic' ? { topicId: entity.id } : { postId: entity.id }),
      });
      if (res.ok) { setLiked(l => !l); onLike(); }
    } catch {}
  };

  const likeCount = entity.likes?.length || 0;

  return (
    <div className={`flex gap-6 py-6 border-b border-white/5 ${type === 'topic' ? '' : ''}`}>
      
      {/* Left Sidebar (Author) */}
      <div className="w-[60px] shrink-0 hidden sm:flex flex-col items-center">
        <Link href={`/forum/u/${addr}`}>
          <div
            className="w-[45px] h-[45px] rounded-full flex items-center justify-center text-[14px] font-sans font-bold text-white bg-white/10 overflow-hidden"
          >
            {entity.author?.avatarUrl
              ? <img src={entity.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              : addr.slice(2, 3).toUpperCase()
            }
          </div>
        </Link>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link href={`/forum/u/${addr}`} className="text-[14px] font-sans font-bold text-white hover:underline">
              {label}
            </Link>
            {entity.author?.isPro && (
              <span className="text-[10px] font-sans font-bold bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm">PRO</span>
            )}
            {type === 'topic' && (
              <span className="text-[10px] font-sans font-bold bg-[#6366f1]/20 text-[#6366f1] px-1.5 py-0.5 rounded-sm">OP</span>
            )}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[12px] font-sans text-white/40">{time}</span>
             <span className="text-[12px] font-sans font-bold text-white/20">#{index}</span>
          </div>
        </div>

        <div className="text-[15px] font-sans text-[#d1d5db] leading-[1.6] whitespace-pre-wrap mb-4">
          {entity.content}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-auto">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[13px] font-sans font-bold transition-colors ${liked ? 'text-red-400' : 'text-white/40 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            {likeCount > 0 && likeCount}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 text-[13px] font-sans font-bold text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </button>
          <button
            onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-[13px] font-sans font-bold text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
