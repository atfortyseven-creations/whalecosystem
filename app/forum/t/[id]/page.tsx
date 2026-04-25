"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { Heart, Reply, Link as LinkIcon, MoreHorizontal, Bookmark, Bell } from 'lucide-react';

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = () => {
    fetch(`/api/forum/topics/${id}`)
      .then(r => r.json())
      .then(data => setTopic(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: id, content: replyContent })
      });
      if (res.ok) {
        setReplyContent('');
        fetchTopic(); // Refresh
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading topic...</div>;
  if (!topic || topic.error) return <div className="p-12 text-center text-red-500">Topic not found or deleted.</div>;

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto">
      
      {/* ── Topic Header ── */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-[26px] font-semibold text-[#222222] leading-tight">{topic.title}</h1>
        <div className="flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-sm" 
            style={{ backgroundColor: topic.category.color }} 
          />
          <span className="text-[13px] text-gray-600 font-medium">
            {topic.category.name}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* ── Posts Column ── */}
        <div className="flex-1 flex flex-col">
          <PayloadBlock entity={topic} type="topic" onLike={fetchTopic} isLast={!topic.posts?.length} />

          {topic.posts?.map((post: any, i: number) => (
            <PayloadBlock key={post.id} entity={post} type="post" onLike={fetchTopic} isLast={i === topic.posts.length - 1} />
          ))}

          {/* ── Post Footer Actions ── */}
          <div className="mt-4 flex flex-col gap-4">
             <div className="flex items-center gap-2">
               <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                 <LinkIcon size={14} />
                 Share
               </button>
               <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                 <Bookmark size={14} />
                 Bookmark
               </button>
               <button 
                 onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                 className="flex items-center gap-1.5 bg-[#0088CC] hover:bg-[#0077B3] text-white px-4 py-1.5 rounded text-[13px] font-medium transition-colors"
               >
                 <Reply size={14} />
                 Reply
               </button>
             </div>
             
             <div className="flex items-center gap-2 text-[13px] text-gray-500 bg-gray-50/50 p-2 rounded border border-gray-100">
               <span className="flex items-center gap-1 text-gray-700 font-medium bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                 <Bell size={12} /> Normal
               </span>
               You will be notified if someone mentions your @name or replies to you.
             </div>
          </div>

          {/* ── Related Topics ── */}
          <div className="mt-10 mb-6">
            <h3 className="text-[16px] font-semibold text-[#222222] flex items-center gap-2 mb-4">
              <span className="text-gray-400">✦</span> Related topics
            </h3>
            <div className="flex items-center py-2 border-b border-gray-300 text-[12px] text-gray-500 font-normal">
               <div className="flex-1">Topic</div>
               <div className="w-16 text-center">Replies</div>
               <div className="w-16 text-center">Views</div>
               <div className="w-20 text-right">Activity</div>
            </div>
            
            {/* Mock Related Topic */}
            <div className="flex items-center py-3 border-b border-gray-100">
               <div className="flex-1 min-w-0 pr-4">
                 <div className="text-[14px] text-[#222222] font-semibold truncate leading-snug">
                   Request for Comments: Protocol Upgrades
                 </div>
                 <div className="flex items-center gap-1 mt-1">
                   <span className="w-2 h-2 rounded-sm bg-purple-500" />
                   <span className="text-[11px] text-gray-500">Governance</span>
                 </div>
               </div>
               <div className="w-16 text-center text-[13px] text-gray-500">22</div>
               <div className="w-16 text-center text-[13px] text-gray-500">854</div>
               <div className="w-20 text-right text-[13px] text-gray-500">Oct 2025</div>
            </div>
          </div>

          {/* ── Reply Composer ── */}
          <div id="reply-composer" className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-gray-700 font-semibold mb-3">Reply to this topic</h3>
            <textarea 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md p-4 text-[15px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] resize-y shadow-sm"
              placeholder="Type your reply here..."
            />
            <div className="flex justify-start mt-4">
              <button 
                onClick={submitReply}
                disabled={submitting || !replyContent.trim()}
                className="bg-[#0088CC] hover:bg-[#0077B3] text-white px-6 py-2.5 rounded shadow-sm text-[15px] font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Reply size={18} />
                {submitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Discourse Timeline Sidebar ── */}
        <div className="hidden lg:block w-36 shrink-0 relative">
          <div className="sticky top-24 flex flex-col items-center">
            <div className="text-[12px] text-gray-400 font-medium mb-2">{format(new Date(topic.createdAt), "MMM yyyy")}</div>
            <div className="flex gap-2 w-full text-[12px] font-medium text-[#0088CC] mb-2 px-2">
              <span className="flex-1 text-right">{topic.posts?.length ? topic.posts.length + 1 : 1}</span>
              <span className="text-gray-300">/</span>
              <span className="flex-1">{topic.posts?.length ? topic.posts.length + 1 : 1}</span>
            </div>
            <div className="w-1 h-32 bg-gray-200 rounded-full relative">
               <div className="absolute top-0 w-full h-1/3 bg-[#0088CC] rounded-full"></div>
            </div>
            <div className="text-[12px] text-gray-400 font-medium mt-2">{format(new Date(topic.updatedAt || topic.createdAt), "MMM yyyy")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayloadBlock({ entity, type, onLike, isLast }: { entity: any, type: 'topic' | 'post', onLike: () => void, isLast: boolean }) {
  const [liked, setLiked] = useState(false);
  const authorAddress = entity.author.walletAddress;
  const avatarColor = `#${authorAddress.slice(2, 8)}`;
  
  const handleLike = async () => {
    try {
       const res = await fetch('/api/forum/likes', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(type === 'topic' ? { topicId: entity.id } : { postId: entity.id })
       });
       if (res.ok) {
         setLiked(!liked);
         onLike();
       }
    } catch (e) {}
  };

  const formattedDate = formatDistanceToNowStrict(new Date(entity.createdAt), { addSuffix: true });

  return (
    <div className={`flex gap-4 py-6 group ${!isLast ? 'border-b border-gray-200' : ''}`}>
      
      {/* Avatar Column */}
      <div className="w-12 shrink-0 flex flex-col items-center relative group-hover:z-10">
        <Link href={`/forum/u/${authorAddress}`}>
          {entity.author.avatarUrl ? (
             <img src={entity.author.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" />
          ) : (
             <div 
               className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] text-white font-bold shadow-sm"
               style={{ backgroundColor: avatarColor }}
             >
               {authorAddress.slice(2,3).toUpperCase()}
             </div>
          )}
        </Link>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
         {/* User Meta Row */}
         <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
             <Link href={`/forum/u/${authorAddress}`} className="text-[15px] font-bold text-[#222222] hover:underline">
               {entity.author.displayName || `${authorAddress.slice(0,6)}…${authorAddress.slice(-4)}`}
             </Link>
             {entity.author.isPro && (
               <span className="text-[10px] uppercase font-bold text-[#D4AF37] border border-[#D4AF37] px-1 rounded-sm">
                 Pro
               </span>
             )}
           </div>
           <span className="text-[13px] text-gray-500">
             {formattedDate}
           </span>
         </div>

         {/* Body */}
         <div className="text-[15px] leading-relaxed text-[#222222] whitespace-pre-wrap mb-4">
           {entity.content}
         </div>
         
         {/* Actions Row — no opacity/transition: prevents GPU repaint on mobile scroll */}
         <div className="flex items-center gap-1 justify-end mt-2">
           <button 
             onClick={handleLike}
             className={`flex items-center gap-1.5 px-2.5 py-1 hover:bg-gray-100 rounded text-[13px] ${liked ? 'text-red-500 bg-red-50' : 'text-gray-500'}`}
             title="Like this post"
           >
             <Heart size={14} className={liked || entity._count?.likes > 0 ? "fill-current" : ""} />
             {entity._count?.likes > 0 && <span className="font-medium">{entity._count.likes}</span>}
           </button>
           <button 
             onClick={() => navigator.clipboard.writeText(window.location.href)}
             className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-gray-100 text-gray-500 rounded text-[13px]"
             title="Copy link"
           >
             <LinkIcon size={14} />
           </button>
           <button 
             onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
             className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-gray-100 text-gray-500 rounded text-[13px]"
           >
             <Reply size={14} />
             <span className="font-medium">Reply</span>
           </button>
         </div>
      </div>
    </div>
  );
}

