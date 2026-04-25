"use client";

import React, { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

export default function SovereignAdminPanel() {
  const [queue, setQueue] = useState<{ topics: any[], posts: any[] }>({ topics: [], posts: [] });

  const [error, setError] = useState<string | null>(null);

  const fetchQueue = () => {
    fetch('/api/forum/admin/queue')
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized or Server Error');
        return r.json();
      })
      .then(data => setQueue(data))
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: string, type: 'topic' | 'post', status: 'PUBLISHED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/forum/admin/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status })
      });
      if (res.ok) {
        fetchQueue();
      } else {
         alert("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
    }
  };


  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <ShieldAlert size={64} className="text-red-500 mb-4" />
       <h1 className="text-2xl font-bold text-[#222222]">ACCESS DENIED</h1>
       <p className="text-gray-500 mt-2">Only the Sovereign Administrator can access this terminal.</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1110px] mx-auto py-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
         <ShieldCheck size={32} className="text-green-600" />
         <div>
           <h1 className="text-[24px] font-bold text-[#222222]">Sovereign Gatekeeper</h1>
           <p className="text-[14px] text-gray-500">Global Moderation Queue. All standard user submissions land here as PENDING.</p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Pending Topics */}
         <div className="flex-1 flex flex-col">
            <h2 className="text-[18px] font-semibold mb-4 text-[#222222]">Pending Topics ({queue.topics.length})</h2>
            <div className="flex flex-col gap-4">
              {queue.topics.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded text-center text-gray-500 text-sm">
                  No pending topics.
                </div>
              ) : queue.topics.map(topic => (
                <div key={topic.id} className="p-4 bg-white border border-yellow-200 shadow-sm rounded flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                      <div className="font-semibold text-[15px]">{topic.title}</div>
                      <div className="text-[12px] text-gray-500">{formatDistanceToNowStrict(new Date(topic.createdAt), { addSuffix: true })}</div>
                   </div>
                   <div className="text-[13px] text-gray-500">
                     By: <span className="font-mono text-black">{topic.author.displayName || topic.author.walletAddress.slice(0,8)}</span>
                   </div>
                   <div className="p-3 bg-gray-50 text-[14px] text-gray-700 whitespace-pre-wrap rounded">
                     {topic.content}
                   </div>
                   <div className="flex justify-end gap-2 mt-2">
                     <button 
                       onClick={() => handleAction(topic.id, 'topic', 'REJECTED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                     >
                       <X size={14} /> Reject
                     </button>
                     <button 
                       onClick={() => handleAction(topic.id, 'topic', 'PUBLISHED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                     >
                       <Check size={14} /> Publish to World
                     </button>
                   </div>
                </div>
              ))}
            </div>
         </div>

         {/* Pending Posts */}
         <div className="flex-1 flex flex-col">
            <h2 className="text-[18px] font-semibold mb-4 text-[#222222]">Pending Replies ({queue.posts.length})</h2>
            <div className="flex flex-col gap-4">
              {queue.posts.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded text-center text-gray-500 text-sm">
                  No pending replies.
                </div>
              ) : queue.posts.map(post => (
                <div key={post.id} className="p-4 bg-white border border-yellow-200 shadow-sm rounded flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                      <div className="text-[13px] text-gray-500">
                        Reply to: <span className="font-semibold text-black">{post.topic.title}</span>
                      </div>
                      <div className="text-[12px] text-gray-500">{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</div>
                   </div>
                   <div className="text-[13px] text-gray-500">
                     By: <span className="font-mono text-black">{post.author.displayName || post.author.walletAddress.slice(0,8)}</span>
                   </div>
                   <div className="p-3 bg-gray-50 text-[14px] text-gray-700 whitespace-pre-wrap rounded">
                     {post.content}
                   </div>
                   <div className="flex justify-end gap-2 mt-2">
                     <button 
                       onClick={() => handleAction(post.id, 'post', 'REJECTED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                     >
                       <X size={14} /> Reject
                     </button>
                     <button 
                       onClick={() => handleAction(post.id, 'post', 'PUBLISHED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                     >
                       <Check size={14} /> Publish to World
                     </button>
                   </div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
