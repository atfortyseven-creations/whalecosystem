import React from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export function ActivityTab({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
        [ NO TRANSMISSIONS ]
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const time = formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: false });
        const href = item._type === 'TOPIC'
          ? `/forum/t/${item.id}`
          : `/forum/t/${item.topicId}`;
        const label = item._type === 'TOPIC'
          ? (item.title || 'Untitled')
          : (item.content?.slice(0, 80) || '—');

        return (
          <Link
            key={i}
            href={href}
            className="flex items-center gap-4 py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors group"
          >
            <span className="text-[9px] font-mono font-black text-[#050505]/20 w-14 shrink-0 uppercase">
              {item._type}
            </span>
            <span className="flex-1 text-[12px] font-mono text-[#050505] truncate group-hover:underline underline-offset-2">
              {label}
            </span>
            <span className="text-[10px] font-mono text-[#050505]/30 whitespace-nowrap">
              {time.replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
