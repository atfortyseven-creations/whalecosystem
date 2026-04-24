"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/notifications')
      .then(r => r.json())
      .then(data => { if (!data.error) setNotifications(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">[ SCANNING_SIGNAL_LOGS ]</div>;
  }

  const typeMap: Record<string, { label: string; color: string }> = {
    LIKE:    { label: '[ + ]', color: '#ef4444' },
    REPLY:   { label: '[ ↳ ]', color: '#059669' },
    MENTION: { label: '[ @ ]', color: '#2563eb' },
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">

      {/* ── Table Header ── */}
      <div className="flex items-center px-2 pb-4 border-b-[0.5px] border-black/10 select-none">
        <div className="w-12 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Sig</div>
        <div className="flex-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 pl-4">Event_Log</div>
        <div className="w-28 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Unix_Epoch</div>
      </div>

      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">[ NO_ACTIVE_SIGNALS ]</div>
        ) : notifications.map(n => {
          const meta = typeMap[n.type] || { label: '[ · ]', color: '#050505' };
          const actor = n.actor ? `op_${n.actor.walletAddress.slice(0, 6)}` : 'system';
          const labelMap: Record<string, string> = {
            LIKE:    `${actor} resonated with your payload`,
            REPLY:   `${actor} appended to your transmission`,
            MENTION: `${actor} flagged your entity in a log`,
          };
          const message = labelMap[n.type] || 'system event detected';
          const unixEpoch = Math.floor(new Date(n.createdAt).getTime() / 1000);

          return (
            <Link
              key={n.id}
              href={n.topicId ? `/forum/t/${n.topicId}` : '#'}
              className={`flex items-center px-2 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group ${!n.isRead ? 'bg-black/[0.015]' : ''}`}
            >
              <div className="w-12">
                <span className="font-mono text-[11px] font-black" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <div className="flex-1 pl-4 flex flex-col gap-1 min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#050505]">{message}</span>
                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />}
              </div>
              <div className="w-28 text-right font-mono text-[9px] text-[#050505]/30">
                t={unixEpoch}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#050505]/20 select-none">END_OF_SIGNAL_LOG</span>
      </div>
    </div>
  );
}
