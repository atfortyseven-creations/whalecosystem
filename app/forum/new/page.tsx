"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewTopicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('category');

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(preselectedCategory || '');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => { if (!data.error) setCategories(data); })
      .catch(console.error);
  }, []);

  const submit = async () => {
    setError('');
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('[ PAYLOAD_INCOMPLETE: title, content, and vector required ]');
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
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const topic = await res.json();
        router.push(`/forum/t/${topic.id}`);
      } else {
        const err = await res.json();
        setError(`[ TRANSMISSION_FAILURE: ${err.error} ]`);
      }
    } catch (e) {
      setError('[ NETWORK_FAULT: please retry ]');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-10">

      {/* Classification Selector */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`font-mono text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 border transition-all ${
              categoryId === cat.id
                ? 'border-[#050505] bg-[#050505] text-[#FDFCF8]'
                : 'border-black/10 text-[#050505]/50 hover:border-[#050505]/30 hover:text-[#050505]'
            }`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-sm mr-2 align-middle" style={{ backgroundColor: cat.color }} />
            {cat.slug}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="INTELLIGENCE_PAYLOAD_TITLE"
        className="w-full bg-transparent border-b-[0.5px] border-black/20 py-3 font-serif text-[26px] sm:text-[32px] text-[#050505] placeholder-[#050505]/20 focus:outline-none focus:border-black leading-tight"
      />

      {/* Body */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Formulate your intelligence payload. Raw data, analysis, signals..."
        className="w-full bg-transparent border-[0.5px] border-black/10 p-4 font-serif text-[15px] text-[#050505] placeholder-[#050505]/20 focus:outline-none focus:border-black/40 min-h-[280px] resize-none leading-relaxed"
      />

      {/* Tags & Submit Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t-[0.5px] border-black/10 pt-6">
        <div className="flex-1">
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="vectors: defi, governance, alpha"
            className="w-full bg-transparent border-b-[0.5px] border-black/10 py-2 font-mono text-[10px] text-[#050505]/60 uppercase tracking-widest placeholder-[#050505]/20 focus:outline-none focus:border-black/30"
          />
        </div>
        <button
          onClick={submit}
          disabled={submitting}
          className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#FDFCF8] bg-[#050505] border border-[#050505] px-8 py-2.5 hover:bg-transparent hover:text-[#050505] transition-all disabled:opacity-30"
        >
          {submitting ? 'TRANSMITTING...' : 'TRANSMIT'}
        </button>
      </div>

      {error && (
        <p className="font-mono text-[9px] uppercase tracking-widest text-red-600">{error}</p>
      )}
    </div>
  );
}
