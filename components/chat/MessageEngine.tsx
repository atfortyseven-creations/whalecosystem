'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Pin, Trash2, Copy, Reply, Forward, Timer,
  CheckCheck, Check, ShieldCheck, Flame
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export type Reaction = { emoji: string; count: number; reacted: boolean };

export interface RenderableMessage {
  id: string;
  senderAddress: string;
  content: string;                 // decrypted text or [VOICE] / [FILE:name]
  sentAt: number;                  // unix ms
  isMine: boolean;
  isPinned: boolean;
  isDestructing: boolean;
  destructsAt?: number;            // unix ms
  readAt?: number;                 // unix ms (undefined = not read)
  reactions: Reaction[];
  replyToId?: string;
  attestationScore?: number;       // 0–100 whale score
}

export interface MessageEngineProps {
  messages: RenderableMessage[];
  onReact:  (messageId: string, emoji: string) => void;
  onPin:    (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReply:  (messageId: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

// ── Constants ──────────────────────────────────────────────────────────────

const QUICK_REACTIONS = ['👍', '🔥', '🐳', '🚀', '💎', '❤️', '🤯', '✅'];

// ── Component ──────────────────────────────────────────────────────────────

export default function MessageEngine({
  messages, onReact, onPin, onDelete, onReply, bottomRef,
}: MessageEngineProps) {
  const [menuState, setMenuState] = useState<{ id: string; x: number; y: number } | null>(null);

  const openMenu = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuState({ id, x: rect.left, y: rect.top });
  }, []);

  const closeMenu = () => setMenuState(null);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scroll-smooth" onClick={closeMenu}>
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          onContextMenu={(e) => openMenu(e, msg.id)}
          onReact={onReact}
        />
      ))}
      <div ref={bottomRef} />

      {/* Floating Context Menu */}
      {menuState && (
        <ContextMenu
          messageId={menuState.id}
          x={menuState.x}
          y={menuState.y}
          onReact={(emoji) => { onReact(menuState.id, emoji); closeMenu(); }}
          onPin={() => { onPin(menuState.id); closeMenu(); }}
          onDelete={() => { onDelete(menuState.id); closeMenu(); }}
          onReply={() => { onReply(menuState.id); closeMenu(); }}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}

// ── MessageBubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg, onContextMenu, onReact }: {
  msg: RenderableMessage;
  onContextMenu: (e: React.MouseEvent) => void;
  onReact: (id: string, emoji: string) => void;
}) {
  const now = Date.now();
  const secondsLeft = msg.destructsAt ? Math.max(0, Math.round((msg.destructsAt - now) / 1000)) : null;

  return (
    <div className={`flex flex-col max-w-[75%] ${msg.isMine ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>

      {/* Pin indicator */}
      {msg.isPinned && (
        <div className="flex items-center gap-1 text-[9px] font-mono text-white/30 mb-1 px-1">
          <Pin size={9} /> Pinned
        </div>
      )}

      {/* Bubble */}
      <div
        onContextMenu={onContextMenu}
        className={`relative group px-4 py-3 rounded-2xl cursor-default select-text transition-all ${
          msg.isMine
            ? 'bg-[#00C076]/10 border border-[#00C076]/20 rounded-br-sm text-white'
            : 'bg-white/5 border border-white/8 rounded-bl-sm text-white'
        } ${msg.isDestructing ? 'opacity-60' : ''}`}
      >
        {/* Attestation badge */}
        {msg.attestationScore && msg.attestationScore >= 95 && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-[#00C076]/70 mb-2">
            <ShieldCheck size={10} /> ZK-VERIFIED · SCORE {msg.attestationScore}
          </div>
        )}

        <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-mono">{msg.content}</p>

        {/* Self-destruct countdown */}
        {secondsLeft !== null && (
          <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-red-400">
            <Flame size={10} /> {secondsLeft}s
          </div>
        )}
      </div>

      {/* Reactions row */}
      {msg.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
          {msg.reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => onReact(msg.id, r.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all ${
                r.reacted
                  ? 'bg-[#00C076]/10 border-[#00C076]/30 text-[#00C076]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {r.emoji} <span className="font-mono text-[10px]">{r.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Timestamp + read receipt */}
      <div className={`flex items-center gap-1.5 mt-1 px-1 text-[9px] font-mono text-white/30`}>
        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {msg.isMine && (
          msg.readAt
            ? <CheckCheck size={11} className="text-[#00C076]" />
            : <Check size={11} className="text-white/30" />
        )}
      </div>
    </div>
  );
}

// ── ContextMenu ────────────────────────────────────────────────────────────

function ContextMenu({ messageId, x, y, onReact, onPin, onDelete, onReply, onClose }: {
  messageId: string;
  x: number; y: number;
  onReact: (emoji: string) => void;
  onPin: () => void;
  onDelete: () => void;
  onReply: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-[300] bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-3 w-[260px] flex flex-col gap-1"
      style={{ top: Math.min(y, window.innerHeight - 280), left: Math.min(x, window.innerWidth - 280) }}
      onClick={e => e.stopPropagation()}
    >
      {/* Quick reactions */}
      <div className="flex gap-1 flex-wrap pb-3 border-b border-white/5 mb-1">
        {QUICK_REACTIONS.map(e => (
          <button
            key={e}
            onClick={() => onReact(e)}
            className="w-9 h-9 rounded-xl text-[18px] hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {e}
          </button>
        ))}
      </div>

      {[
        { icon: Reply,   label: 'Reply',        action: onReply  },
        { icon: Pin,     label: 'Pin Message',  action: onPin    },
        { icon: Copy,    label: 'Copy Text',    action: () => {} },
        { icon: Forward, label: 'Forward',      action: () => {} },
        { icon: Trash2,  label: 'Delete',       action: onDelete, danger: true },
      ].map(({ icon: Icon, label, action, danger }) => (
        <button
          key={label}
          onClick={action}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-mono transition-all ${
            danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Icon size={15} />{label}
        </button>
      ))}
    </div>
  );
}
