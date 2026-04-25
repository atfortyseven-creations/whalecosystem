"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewTopicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('category');

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [categoryId, setCategoryId] = useState(preselectedCategory || '');
  const [tags, setTags]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!categoryId && data.length > 0) setCategoryId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const submit = async () => {
    setError('');
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('TITLE, CATEGORY AND CONTENT ARE REQUIRED');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const topic = await res.json();
        router.push(`/forum/t/${topic.id}`);
      } else {
        const err = await res.json();
        setError(err.error?.toUpperCase() || 'SUBMISSION FAILED — ARE YOU AUTHENTICATED?');
      }
    } catch {
      setError('NETWORK ERROR — RETRY');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-8 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
        <Link href="/forum" className="hover:text-white transition-colors">FORUM</Link>
        <span>/</span>
        <span className="text-white">NEW TRANSMISSION</span>
      </div>

      <div className="flex flex-col gap-0 border border-white/20 bg-black/20 backdrop-blur-sm">

        {/* ── Title ── */}
        <div className="border-b border-white/10">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="SUBJECT LINE"
            className="w-full px-6 py-5 text-[15px] font-mono font-black uppercase tracking-widest text-white placeholder-white/20 bg-transparent focus:outline-none"
          />
        </div>

        {/* ── Category + Tags ── */}
        <div className="flex flex-col sm:flex-row border-b border-white/10">
          <div className="flex-1 border-b sm:border-b-0 sm:border-r border-white/10">
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-6 py-4 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#2D0A59]">SELECT CHANNEL</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-[#2D0A59]">{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="SIGNAL TAGS (COMMA SEPARATED)"
              className="w-full px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white placeholder-white/20 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="border-b border-white/10">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="TRANSMISSION BODY..."
            className="w-full px-6 py-5 text-[14px] font-mono text-white placeholder-white/20 bg-transparent focus:outline-none resize-none min-h-[320px] leading-relaxed"
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/10">
          <div className="flex items-center gap-6">
            <button
              onClick={submit}
              disabled={submitting}
              className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black bg-white px-6 py-3 hover:bg-white/80 transition-colors disabled:opacity-40"
            >
              {submitting ? 'TRANSMITTING…' : '⬆ TRANSMIT'}
            </button>
            <Link
              href="/forum"
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              DISCARD
            </Link>
          </div>
          {error && (
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-400">
              ⚠ {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
