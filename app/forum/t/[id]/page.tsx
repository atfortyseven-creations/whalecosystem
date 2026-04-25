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
        setReplyError(err.error?.toUpperCase() || 'TRANSMISSION FAILED — ARE YOU AUTHENTICATED?');
      }
    } catch (e) {
      setReplyError('NETWORK ERROR — RETRY');
    } finally {
      setSubmitting(false);
    }
  };

  if (!topic) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 animate-pulse">
      [ DECRYPTING TRANSMISSION… ]
    </div>
  );

  if (topic.error) return (
    <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
      [ TRANSMISSION NOT FOUND ]
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
        <Link href="/forum" className="hover:text-white transition-colors">FORUM</Link>
        <span>/</span>
        <Link href={`/forum/c/${topic.category?.slug}`} className="hover:text-white transition-colors">
          {topic.category?.name?.toUpperCase()}
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8 pb-6 border-b border-white/20">
        <h1 className="text-[16px] font-mono font-black uppercase tracking-tight text-white leading-snug">
          {topic.title}
        </h1>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {topic.tags?.map((tag: any) => (
            <span key={tag.id} className="text-[9px] font-mono uppercase tracking-widest text-[#00f2ea] border border-[#00f2ea]/40 px-2 py-0.5">
              {tag.name}
            </span>
          ))}
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">{topic._count?.posts || 0} REPLIES · {topic.views || 0} VIEWS</span>
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
      <div id="reply-composer" className="mt-10 pt-8 border-t border-white/20">
        <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          APPEND REPLY
        </div>
        <div className="border border-white/20 bg-black/20">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="TRANSMISSION BODY…"
            className="w-full px-5 py-4 text-[13px] font-mono text-white placeholder-white/20 bg-transparent focus:outline-none resize-none min-h-[140px] leading-relaxed"
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-black/10">
            <button
              onClick={submitReply}
              disabled={submitting || !replyContent.trim()}
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black bg-white px-5 py-2.5 hover:bg-white/80 transition-colors disabled:opacity-40"
            >
              {submitting ? 'TRANSMITTING…' : '⬆ TRANSMIT'}
            </button>
            {replyError ? (
              <span className="text-[9px] font-mono font-black text-red-400 uppercase tracking-widest">
                ⚠ {replyError}
              </span>
            ) : (
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                MARKDOWN SUPPORTED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostRow({ entity, type, onLike }: { entity: any; type: 'topic' | 'post'; onLike: () => void }) {
  const [liked, setLiked] = useState(false);
  const addr  = entity.author?.walletAddress || '';
  const label = entity.author?.displayName || (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'ANONYMOUS');
  const time  = entity.createdAt
    ? formatDistanceToNowStrict(new Date(entity.createdAt), { addSuffix: true })
    : '';

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

  const likeCount = type === 'topic'
    ? (entity.likes?.length || 0)
    : (entity.likes?.length || 0);

  return (
    <div className={`flex gap-6 py-7 border-b border-white/10 ${type === 'topic' ? 'bg-black/10' : ''}`}>

      {/* Avatar */}
      <div className="shrink-0">
        <Link href={`/forum/u/${addr}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono font-black text-white border border-white/20 overflow-hidden"
            style={{ backgroundColor: addr ? `#${addr.slice(2, 8)}` : '#2D0A59' }}
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
              className="text-[11px] font-mono font-black uppercase tracking-widest text-white hover:text-[#00f2ea] transition-colors">
              {label}
            </Link>
            {entity.author?.isPro && (
              <span className="text-[8px] font-black bg-[#D4AF37] text-black px-1.5 py-0.5 uppercase tracking-widest">
                PRO
              </span>
            )}
            {type === 'topic' && (
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#00f2ea] border border-[#00f2ea]/40 px-1.5 py-0.5">
                OP
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-white/30">{time}</span>
        </div>

        {/* Content */}
        <div className="text-[13px] font-mono text-white/80 whitespace-pre-wrap leading-relaxed mb-4">
          {entity.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`text-[10px] font-mono font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
              liked ? 'text-[#00f2ea]' : 'text-white/25 hover:text-white'
            }`}
          >
            ♦ {likeCount > 0 ? likeCount : 'LIKE'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-[10px] font-mono font-black uppercase tracking-widest text-white/25 hover:text-white transition-colors"
          >
            COPY LINK
          </button>
          <button
            onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-mono font-black uppercase tracking-widest text-white/25 hover:text-[#00f2ea] transition-colors"
          >
            ↩ REPLY
          </button>
        </div>
      </div>
    </div>
  );
}
