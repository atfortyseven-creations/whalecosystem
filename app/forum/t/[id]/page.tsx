"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict, format } from 'date-fns';

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const [topic, setTopic]               = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [replyError, setReplyError]     = useState('');
  const [sessionAddress, setSessionAddress] = useState<string | null>(null);

  // Read current user's address from cookie (client-side)
  useEffect(() => {
    const match = document.cookie.match(/sovereign_handshake=([^;]+)/);
    if (match) setSessionAddress(match[1].toLowerCase());
  }, []);

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

  const deleteTopic = async () => {
    if (!confirm('Delete this topic permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/forum/topics/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/forum');
    else alert('Could not delete topic.');
  };

  if (!topic) return (
    <div className="py-20 text-center text-[13px] font-sans animate-pulse" style={{ color: 'var(--forum-text-muted)' }}>
      Loading topic...
    </div>
  );

  if (topic.error) return (
    <div className="py-20 text-center text-[13px] font-sans text-red-400">
      Topic not found.
    </div>
  );

  const isTopicAuthor = sessionAddress && topic.author?.walletAddress?.toLowerCase() === sessionAddress;

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* Topic Header */}
      <div className="mb-8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[24px] md:text-[28px] font-sans font-bold leading-[1.3] tracking-[-0.01em] mb-3 flex-1" style={{ color: 'var(--forum-text)' }}>
            {topic.title}
          </h1>
          {isTopicAuthor && (
            <button
              onClick={deleteTopic}
              className="shrink-0 mt-1 text-[11px] font-sans font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
              title="Delete this topic"
            >
              Delete Topic
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {topic.category && (
            <Link href={`/forum/c/${topic.category.slug}`} className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] transition-colors" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.category.color || '#6366f1' }} />
              <span className="text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>{topic.category.name}</span>
            </Link>
          )}
          {topic.tags?.map((tag: any) => (
            <span key={tag.id} className="text-[12px] font-sans before:content-['#'] before:mr-[1px]" style={{ color: 'var(--forum-text-muted)' }}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Posts (Left 9 cols) + Timeline (Right 3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px]">
        
        <div className="lg:col-span-9 flex flex-col pt-4" style={{ borderTop: '1px solid var(--forum-border)' }}>
          <PostRow entity={topic} type="topic" onLike={fetchTopic} index={1} sessionAddress={sessionAddress} onDeleted={() => router.push('/forum')} />
          {(topic.posts || []).map((post: any, i: number) => (
            <PostRow key={post.id} entity={post} type="post" onLike={fetchTopic} index={i + 2} sessionAddress={sessionAddress} onDeleted={fetchTopic} />
          ))}

          {/* Reply composer */}
          <div id="reply-composer" className="mt-8 flex gap-6">
             <div className="w-[60px] shrink-0 hidden sm:block"></div>
             <div className="flex-1">
                <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-5 py-4 text-[14px] font-sans bg-transparent focus:outline-none resize-none min-h-[140px] leading-relaxed"
                    style={{ color: 'var(--forum-text)' }}
                  />
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--forum-border)', backgroundColor: 'var(--forum-header-bg)' }}>
                    <button
                      onClick={submitReply}
                      disabled={submitting || !replyContent.trim()}
                      className="text-[13px] font-sans font-bold px-5 py-2 rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40"
                      style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
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
           <div className="sticky top-[120px] border-l-2 pl-6 py-2" style={{ borderColor: 'var(--forum-border)' }}>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
                    <span>Created</span>
                    <span className="font-bold" style={{ color: 'var(--forum-text)' }}>
                       {topic.createdAt ? format(new Date(topic.createdAt), 'MMM d') : ''}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
                    <span>Last Reply</span>
                    <span className="font-bold" style={{ color: 'var(--forum-text)' }}>
                       {topic.updatedAt ? formatDistanceToNowStrict(new Date(topic.updatedAt)) : ''}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
                    <span>Replies</span>
                    <span className="font-bold" style={{ color: 'var(--forum-text)' }}>{topic._count?.posts || 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>
                    <span>Views</span>
                    <span className="font-bold" style={{ color: 'var(--forum-text)' }}>{topic.views || 0}</span>
                 </div>
              </div>
              <div className="mt-8 pt-6 flex gap-2" style={{ borderTop: '1px solid var(--forum-border)' }}>
                  <button 
                    onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 text-center py-2 rounded-sm text-[13px] font-sans font-bold transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
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

function PostRow({
  entity, type, onLike, index, sessionAddress, onDeleted
}: {
  entity: any;
  type: 'topic' | 'post';
  onLike: () => void;
  index: number;
  sessionAddress: string | null;
  onDeleted: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const addr  = entity.author?.walletAddress || '';
  const label = entity.author?.displayName || (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'ANONYMOUS');
  const time  = entity.createdAt ? format(new Date(entity.createdAt), 'MMM d, yyyy') : '';

  const isAuthor = sessionAddress && addr.toLowerCase() === sessionAddress;

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

  const handleDelete = async () => {
    if (!confirm('Delete this post permanently?')) return;
    setDeleting(true);
    try {
      const endpoint = type === 'topic'
        ? `/api/forum/topics/${entity.id}`
        : `/api/forum/posts/${entity.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) onDeleted();
      else alert('Could not delete.');
    } catch {
      alert('Network error.');
    } finally {
      setDeleting(false);
    }
  };

  const likeCount = entity.likes?.length || 0;

  return (
    <div className="flex gap-6 py-6" style={{ borderBottom: '1px solid var(--forum-border)' }}>
      
      {/* Left Sidebar (Author) */}
      <div className="w-[60px] shrink-0 hidden sm:flex flex-col items-center">
        <Link href={`/forum/u/${addr}`}>
          <div
            className="w-[45px] h-[45px] rounded-full flex items-center justify-center text-[14px] font-sans font-bold overflow-hidden"
            style={{ backgroundColor: 'var(--forum-surface)', color: 'var(--forum-text)' }}
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
            <Link href={`/forum/u/${addr}`} className="text-[14px] font-sans font-bold hover:underline" style={{ color: 'var(--forum-text)' }}>
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
             <span className="text-[12px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{time}</span>
             <span className="text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text-muted)', opacity: 0.5 }}>#{index}</span>
          </div>
        </div>

        <div className="text-[15px] font-sans leading-[1.6] whitespace-pre-wrap mb-4" style={{ color: 'var(--forum-text)' }}>
          {entity.content}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-auto">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[13px] font-sans font-bold transition-opacity hover:opacity-100 ${liked ? 'text-red-400' : ''}`}
            style={{ color: liked ? undefined : 'var(--forum-text-muted)' }}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            {likeCount > 0 && likeCount}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 text-[13px] font-sans font-bold transition-opacity hover:opacity-100"
            style={{ color: 'var(--forum-text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </button>
          <button
            onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-[13px] font-sans font-bold transition-opacity hover:opacity-100"
            style={{ color: 'var(--forum-text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            Reply
          </button>

          {/* Delete button — only visible to the author */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              {deleting ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
