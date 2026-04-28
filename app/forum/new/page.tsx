"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Save } from 'lucide-react';
import { useSignMessage } from 'wagmi';

const DRAFT_KEY = 'forum_draft_new_topic';

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
  const [draftSaved, setDraftSaved] = useState(false);
  const { signMessageAsync } = useSignMessage();

  // ── Restore draft on mount ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.title)      setTitle(draft.title);
        if (draft.content)    setContent(draft.content);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.tags)       setTags(draft.tags);
      }
    } catch {}
  }, []);

  // ── Auto-save draft on every change ──────────────────────────────────────
  useEffect(() => {
    if (!title && !content && !tags) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, categoryId, tags }));
      setDraftSaved(true);
      const t = setTimeout(() => setDraftSaved(false), 1800);
      return () => clearTimeout(t);
    } catch {}
  }, [title, content, categoryId, tags]);

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
      setError('Title, category, and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      let finalContent = content;
      try {
        const signature = await Promise.race([
          signMessageAsync({ message: title + '\n' + content }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SIGNATURE_TIMEOUT')), 10000))
        ]);
        finalContent = `${content}\n\n[SIGNATURE:${signature}]`;
      } catch (e: any) {
        console.warn('[Forum] Signature skipped or timed out:', e?.message || e);
      }

      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: finalContent,
          categoryId,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        // Clear draft on successful post
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        const topic = await res.json();
        router.push(`/forum/t/${topic.id}`);
      } else {
        const err = await res.json();
        setError(err.error || 'Submission failed. Are you authenticated?');
      }
    } catch {
      setError('Network error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setTitle(''); setContent(''); setTags('');
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[24px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
          Create a New Topic
        </h1>
        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-500">
              <Save size={10} /> Draft saved
            </span>
          )}
          {(title || content) && (
            <button
              onClick={clearDraft}
              className="text-[10px] font-sans font-bold uppercase tracking-widest hover:opacity-100 transition-opacity opacity-50 px-3 py-1.5 rounded-sm"
              style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}
            >
              Clear Draft
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── Title ── */}
        <div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Type title, or paste a link here"
            className="w-full px-4 py-3 text-[18px] font-sans font-bold rounded-sm outline-none transition-colors"
            style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'var(--forum-hover)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--forum-border)'; e.currentTarget.style.backgroundColor = 'var(--forum-surface)'; }}
          />
        </div>

        {/* ── Category + Tags ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 text-[14px] font-sans font-bold rounded-sm outline-none transition-colors cursor-pointer appearance-none"
              style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'var(--forum-hover)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--forum-border)'; e.currentTarget.style.backgroundColor = 'var(--forum-surface)'; }}
            >
              <option value="" disabled style={{ backgroundColor: 'var(--forum-bg)', color: 'var(--forum-text-muted)' }}>Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ backgroundColor: 'var(--forum-bg)', color: 'var(--forum-text)' }}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: 'var(--forum-text-muted)' }} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="optional tags (comma separated)"
              className="w-full px-4 py-3 text-[14px] font-sans rounded-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'var(--forum-hover)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--forum-border)'; e.currentTarget.style.backgroundColor = 'var(--forum-surface)'; }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type here. Use Markdown, BBCode, or HTML to format."
            className="w-full px-5 py-4 text-[15px] font-sans rounded-sm outline-none resize-none min-h-[320px] leading-relaxed transition-colors"
            style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'var(--forum-hover)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--forum-border)'; e.currentTarget.style.backgroundColor = 'var(--forum-surface)'; }}
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-6 mt-2 flex-wrap">
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 text-[14px] font-sans font-bold px-6 py-2.5 rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {submitting ? 'AWAITING SIGNATURE...' : 'SIGN & CREATE TOPIC'}
          </button>
          <Link
            href="/forum"
            className="text-[14px] font-sans font-bold transition-opacity hover:opacity-100"
            style={{ color: 'var(--forum-text-muted)' }}
          >
            Cancel
          </Link>
          {error && (
            <span className="text-[13px] font-sans font-bold text-red-400 ml-auto">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
