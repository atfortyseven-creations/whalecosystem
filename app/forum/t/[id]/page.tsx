"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic]               = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const fetchTopic = () => {
    fetch(`/api/forum/topics/${id}`)
      .then(r => r.json())
      .then(data => setTopic(data))
      .catch(console.error);
  };

  useEffect(() => { fetchTopic(); }, [id]);

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: id, content: replyContent }),
      });
      if (res.ok) { setReplyContent(''); fetchTopic(); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (!topic) return null;
  if (topic.error) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
      [ TOPIC NOT FOUND ]
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
        <Link href="/forum" className="hover:text-[#050505] transition-colors">FORUM</Link>
        <span>/</span>
        <Link href={`/forum/c/${topic.category?.slug}`} className="hover:text-[#050505] transition-colors">
          {topic.category?.name?.toUpperCase()}
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <h1 className="text-[16px] font-mono font-black uppercase tracking-tight text-[#050505] leading-snug">
          {topic.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[#050505]/30">
          <span>{topic._count?.posts || 0} REPLIES</span>
          <span>·</span>
          <span>{topic.views || 0} VIEWS</span>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col">
        <PostRow entity={topic} type="topic" onLike={fetchTopic} />
        {(topic.posts || []).map((post: any) => (
          <PostRow key={post.id} entity={post} type="post" onLike={fetchTopic} />
        ))}
      </div>

      {/* Reply composer */}
      <div id="reply-composer" className="mt-10 pt-8 border-t border-[#E0E0E0]">
        <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30 mb-4">
          APPEND REPLY
        </div>
        <div className="border border-[#E0E0E0] bg-white">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="TRANSMISSION BODY"
            className="w-full px-5 py-4 text-[13px] font-mono text-[#050505] placeholder-[#CCCCCC] bg-white focus:outline-none resize-none min-h-[140px] leading-relaxed"
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E0E0E0] bg-[#FAF9F6]">
            <button
              onClick={submitReply}
              disabled={submitting || !replyContent.trim()}
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white bg-[#050505] px-5 py-2.5 hover:bg-[#333333] transition-colors disabled:opacity-40"
            >
              {submitting ? 'TRANSMITTING…' : 'TRANSMIT'}
            </button>
            <span className="text-[9px] font-mono text-[#050505]/20 uppercase tracking-widest">
              MARKDOWN SUPPORTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostRow({ entity, type, onLike }: { entity: any; type: 'topic' | 'post'; onLike: () => void }) {
  const [liked, setLiked] = useState(false);
  const addr  = entity.author?.walletAddress || '';
  const label = entity.author?.displayName || `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  const time  = formatDistanceToNowStrict(new Date(entity.createdAt), { addSuffix: true });

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

  return (
    <div className="flex gap-6 py-7 border-b border-[#F0F0F0]">

      {/* Avatar */}
      <div className="shrink-0">
        <Link href={`/forum/u/${addr}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-black text-white border border-[#E0E0E0] overflow-hidden"
            style={{ backgroundColor: addr ? `#${addr.slice(2, 8)}` : '#050505' }}
          >
            {entity.author?.avatarUrl
              ? <img src={entity.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              : addr.slice(2, 3).toUpperCase()
            }
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">

        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/forum/u/${addr}`}
              className="text-[11px] font-mono font-black uppercase tracking-widest text-[#050505] hover:underline underline-offset-2">
              {label}
            </Link>
            {entity.author?.isPro && (
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37] px-1.5 py-0.5">
                PRO
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#050505]/30">{time}</span>
        </div>

        {/* Content */}
        <div className="text-[13px] font-mono text-[#050505]/80 whitespace-pre-wrap leading-relaxed mb-4">
          {entity.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`text-[10px] font-mono font-black uppercase tracking-widest transition-colors ${liked ? 'text-[#050505]' : 'text-[#050505]/25 hover:text-[#050505]'}`}
          >
            + {entity._count?.likes > 0 ? entity._count.likes : 'LIKE'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-[10px] font-mono font-black uppercase tracking-widest text-[#050505]/25 hover:text-[#050505] transition-colors"
          >
            COPY LINK
          </button>
          <button
            onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-mono font-black uppercase tracking-widest text-[#050505]/25 hover:text-[#050505] transition-colors"
          >
            REPLY
          </button>
        </div>
      </div>
    </div>
  );
}
