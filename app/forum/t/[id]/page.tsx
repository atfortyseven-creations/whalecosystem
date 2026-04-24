"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

  if (loading) return <div className="p-12 text-center font-mono text-[9px] uppercase tracking-widest text-black/20">[ DECRYPTING_PAYLOAD ]</div>;
  if (!topic || topic.error) return <div className="p-12 text-center font-mono text-[9px] uppercase tracking-widest text-red-500">[ PAYLOAD_CORRUPT ]</div>;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      
      {/* ── Metadata Header ── */}
      <div className="mb-12 border-b-[0.5px] border-black/10 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span 
            className="font-mono text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm"
            style={{ color: topic.category.color, border: `0.5px solid ${topic.category.color}40` }}
          >
            {topic.category.slug}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/30">
            Hash: 0x{topic.id.replace(/-/g, '')}
          </span>
        </div>
        <h1 className="text-[28px] font-serif font-black text-[#050505] leading-[1.1] tracking-tight">{topic.title}</h1>
      </div>

      <div className="flex flex-col gap-12 relative">
        <PayloadBlock entity={topic} type="topic" onLike={fetchTopic} />

        {topic.posts?.map((post: any) => (
          <PayloadBlock key={post.id} entity={post} type="post" onLike={fetchTopic} />
        ))}
      </div>

      {/* ── Minimalist Reply Injector ── */}
      <div className="mt-16 pt-8 border-t-[0.5px] border-black/10">
        <span className="block font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-4">
          [ INJECT_RESPONSE_PAYLOAD ]
        </span>
        <textarea 
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          className="w-full bg-transparent border-[0.5px] border-black/20 p-4 font-serif text-[14px] text-[#050505] focus:outline-none focus:border-black/50 min-h-[120px] resize-none"
          placeholder="Formulate intelligence..."
        />
        <div className="flex justify-end mt-4">
          <button 
            onClick={submitReply}
            disabled={submitting || !replyContent.trim()}
            className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505] border-[0.5px] border-black px-6 py-2 hover:bg-[#050505] hover:text-[#FDFCF8] transition-colors disabled:opacity-30"
          >
            {submitting ? 'EXECUTING...' : 'TRANSMIT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PayloadBlock({ entity, type, onLike }: { entity: any, type: 'topic' | 'post', onLike: () => void }) {
  const [liked, setLiked] = useState(false);
  const authorAddress = entity.author.walletAddress;

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

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 group">
      
      {/* Entity Signature Column */}
      <div className="w-full sm:w-40 shrink-0 flex flex-col gap-2">
         <Link href={`/forum/u/${authorAddress}`} className="font-mono text-[11px] font-black uppercase tracking-widest text-[#050505] hover:underline truncate block">
           {authorAddress.slice(0,8)}…
         </Link>
         <div className="flex flex-wrap items-center gap-2">
            {entity.author.isPro ? (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/50 px-1">
                POSG_PRO
              </span>
            ) : (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/40 border border-black/10 px-1">
                T_{entity.author.tier}
              </span>
            )}
         </div>
         <span className="font-mono text-[8px] text-[#050505]/30 uppercase tracking-[0.1em] mt-2 block">
           t={new Date(entity.createdAt).getTime()}
         </span>
      </div>

      {/* Intelligence Data Column */}
      <div className="flex-1 min-w-0">
         <div className="font-serif text-[15px] leading-relaxed text-[#050505]/90 whitespace-pre-wrap">
           {entity.content}
         </div>
         
         {/* Mathematical Actions */}
         <div className="mt-6 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={handleLike}
             className={`font-mono text-[9px] font-black tracking-[0.2em] transition-colors ${liked ? 'text-red-600' : 'text-[#050505] hover:text-red-600'}`}
           >
             [ {liked ? '++' : '+'} ] {entity._count?.likes > 0 && `v=${entity._count.likes}`}
           </button>
           <button 
             onClick={() => navigator.clipboard.writeText(window.location.href)}
             className="font-mono text-[9px] font-black tracking-[0.2em] text-[#050505] hover:text-blue-600 transition-colors"
           >
             [ COPY_HASH ]
           </button>
         </div>
      </div>
    </div>
  );
}
