"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/notifications')
      .then(r => r.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
          // Mark as read after fetching
          fetch('/api/forum/notifications', { method: 'PUT' }).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
        [ RETRIEVING SECURE COMMS ]
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">
      <div className="mb-8 pb-6 border-b border-white/20">
        <h1 className="text-[16px] font-aztec-h2 font-black uppercase tracking-tight text-white leading-snug">
          Intelligence Alerts
        </h1>
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#00f2ea] mt-2">
          SOVEREIGN NOTIFICATION CENTER
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
            [ NO NEW ALERTS ]
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = !n.isRead;
            const linkHref = n.topicId ? `/forum/t/${n.topicId}` : '#';
            const actorName = n.actor?.displayName || (n.actor?.walletAddress ? `${n.actor.walletAddress.slice(0,6)}…` : 'Unknown');
            
            let message = '';
            if (n.type === 'REPLY') message = 'replied to your transmission';
            else if (n.type === 'LIKE') message = 'verified your intel (like)';
            else if (n.type === 'MENTION') message = 'mentioned you in a broadcast';
            else message = 'interacted with your profile';

            return (
              <Link
                key={n.id}
                href={linkHref}
                className={`flex items-start gap-4 p-4 border transition-colors ${
                  isUnread ? 'bg-white/10 border-white/30 hover:bg-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                  {n.actor?.avatarUrl ? (
                     <img src={n.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-[10px] font-mono font-black text-white">{actorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-mono text-white/90">
                    <span className="font-black text-[#00f2ea]">{actorName}</span> {message}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mt-1.5">
                    {formatDistanceToNowStrict(new Date(n.createdAt))} ago
                  </div>
                </div>
                
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-[#00f2ea] shadow-[0_0_8px_#00f2ea] shrink-0 mt-2" />
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
