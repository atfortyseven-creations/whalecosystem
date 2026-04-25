"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/notifications')
      .then(r => r.json())
      .then(data => { if (!data.error) setNotifications(data); })
      .catch(console.error);
  }, []);

  const typeLabel: Record<string, string> = {
    LIKE:    '[ + ]',
    REPLY:   '[ ↳ ]',
    MENTION: '[ @ ]',
  };
  const typeMsg = (n: any): string => {
    const actor = n.actor ? `${n.actor.walletAddress.slice(0, 8)}` : 'SYSTEM';
    const map: Record<string, string> = {
      LIKE:    `${actor} RESONATED WITH YOUR PAYLOAD`,
      REPLY:   `${actor} APPENDED TO YOUR TRANSMISSION`,
      MENTION: `${actor} FLAGGED YOUR ENTITY`,
    };
    return map[n.type] || 'SYSTEM EVENT DETECTED';
  };

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#050505]/30 mb-2">FORUM / NOTIFICATIONS</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
          SIGNAL LOG
        </h1>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="w-10">SIG</div>
        <div className="flex-1 pl-4">EVENT</div>
        <div className="w-20 text-right">EPOCH</div>
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
          [ NO ACTIVE SIGNALS ]
        </div>
      ) : notifications.map(n => (
        <Link
          key={n.id}
          href={n.topicId ? `/forum/t/${n.topicId}` : '#'}
          className={`flex items-center py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors ${!n.isRead ? 'bg-[#FAF9F6]' : ''}`}
        >
          <div className="w-10 text-[11px] font-mono font-black text-[#050505]">
            {typeLabel[n.type] || '[ · ]'}
          </div>
          <div className="flex-1 pl-4 flex items-center gap-3 min-w-0">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#050505] truncate">
              {typeMsg(n)}
            </span>
            {!n.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#050505] shrink-0" />
            )}
          </div>
          <div className="w-20 text-right text-[10px] font-mono text-[#050505]/30">
            t={Math.floor(new Date(n.createdAt).getTime() / 1000)}
          </div>
        </Link>
      ))}

      <div className="mt-10 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-[#050505]/15">
        END_OF_SIGNAL_LOG
      </div>
    </div>
  );
}
