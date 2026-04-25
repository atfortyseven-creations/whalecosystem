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
      setError('Title, category, and content are required.');
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
        setError(err.error || 'Submission failed. Are you authenticated?');
      }
    } catch {
      setError('Network error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1110px] mx-auto py-10 px-4">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[24px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>Create a New Topic</h1>
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
          <div className="flex-1">
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
        <div className="flex items-center gap-6 mt-2">
          <button
            onClick={submit}
            disabled={submitting}
            className="text-[14px] font-sans font-bold px-6 py-2.5 rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
          >
            {submitting ? 'Creating Topic...' : '+ Create Topic'}
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
