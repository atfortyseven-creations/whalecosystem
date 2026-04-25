"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Bold, Italic, Link as LinkIcon, Quote, Code, List, Image as ImageIcon, Smile, Plus } from 'lucide-react';

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
      .then(data => { 
        if (!data.error) {
          setCategories(data);
          if (!categoryId && data.length > 0) {
            setCategoryId(data[0].id); // Auto-select first category
          }
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
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const topic = await res.json();
        router.push(`/forum/t/${topic.id}`);
      } else {
        const err = await res.json();
        setError(`Error: ${err.error}`);
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto pb-20">
      
      <div className="mb-4">
        <h1 className="text-[18px] font-semibold text-[#222222]">Create a new topic</h1>
      </div>

      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        
        {/* ── Title Input ── */}
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What is this discussion about in one brief sentence?"
            className="w-full text-[15px] text-[#222222] font-semibold placeholder-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* ── Category & Tags Row ── */}
        <div className="flex flex-col sm:flex-row gap-3 p-3 border-b border-gray-200 bg-gray-50/50">
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-[14px] text-[#222222] focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {selectedCategory && (
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-sm pointer-events-none" 
                style={{ backgroundColor: selectedCategory.color }} 
              />
            )}
            {/* Indent text to make room for the color dot if selected */}
            <style jsx>{`
              select { padding-left: ${selectedCategory ? '1.5rem' : '0.75rem'}; }
            `}</style>
          </div>
          <div className="flex-1 sm:max-w-xs">
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="optional tags"
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-[14px] text-[#222222] placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ── Formatting Toolbar ── */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50/30 overflow-x-auto text-gray-500">
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Bold"><Bold size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Italic"><Italic size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Link"><LinkIcon size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Blockquote"><Quote size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Preformatted text"><Code size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Bulleted List"><List size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Upload Image"><ImageIcon size={16} /></button>
          <button className="p-1.5 hover:bg-gray-200 hover:text-black rounded" title="Emoji"><Smile size={16} /></button>
        </div>

        {/* ── Editor Area ── */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type here. Use the toolbar or Markdown for formatting."
            className="w-full flex-1 p-4 text-[15px] text-[#222222] bg-white placeholder-gray-400 resize-none focus:outline-none min-h-[250px]"
          />
        </div>

        {/* ── Footer Actions ── */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex items-center gap-4">
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-1.5 bg-[#0088CC] hover:bg-[#0077B3] text-white px-5 py-2 rounded shadow-sm text-[14px] font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            {submitting ? 'Creating...' : 'Create Topic'}
          </button>
          <Link href="/forum" className="text-[14px] text-[#0088CC] hover:underline">
            Discard
          </Link>
          {error && (
            <span className="text-[13px] text-red-500 ml-auto">{error}</span>
          )}
        </div>

      </div>
    </div>
  );
}

