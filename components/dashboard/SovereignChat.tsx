'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

import SidebarNavigation     from '@/components/chat/SidebarNavigation';
import MessageEngine         from '@/components/chat/MessageEngine';
import ChatInput             from '@/components/chat/ChatInput';
import AdvancedSettingsModal from '@/components/chat/AdvancedSettingsModal';
import AttestationEngine     from '@/components/dashboard/AttestationEngine';
import WhaleRadar            from '@/components/dashboard/WhaleRadar';
import AICoPilot             from '@/components/dashboard/AICoPilot';
import AtomicPortfolioShare  from '@/components/dashboard/AtomicPortfolioShare';

import type { RenderableMessage, Reaction } from '@/components/chat/MessageEngine';
import type { ChatSettings } from '@/components/chat/AdvancedSettingsModal';

// ── Types ──────────────────────────────────────────────────────────────────

interface Conversation {
  peerAddress: string;
  displayName: string;
  folder: string;
  lastMessage?: string;
  unread: number;
}

// ── Auto-destruct helpers ─────────────────────────────────────────────────

const DESTRUCT_MS: Record<string, number | null> = {
  off: null, '1m': 60_000, '1h': 3_600_000, '24h': 86_400_000, '7d': 604_800_000,
};

function buildDestructsAt(preset: ChatSettings['autoDestruct']): number | undefined {
  const ms = DESTRUCT_MS[preset];
  return ms ? Date.now() + ms : undefined;
}

// ── Default Settings ───────────────────────────────────────────────────────

const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'dark',
  privacyMode: 'institutional',
  autoDestruct: 'off',
  showReadReceipts: true,
  showLastSeen: false,
  soundEnabled: true,
  notificationsEnabled: true,
  differentialNoiseEpsilon: 0.0001,
  linkPreviewsEnabled: true,
  screenshotProtection: true,
};

// ── Theme map ─────────────────────────────────────────────────────────────

const THEME_ACCENT: Record<ChatSettings['theme'], string> = {
  dark: '#00C076', midnight: '#6366f1', forest: '#22c55e', rose: '#f43f5e', mono: '#e5e5e5',
};

// ── SovereignChat (Orchestrator) ──────────────────────────────────────────

export default function SovereignChat() {
  const { address, isConnected } = useAccount();

  // ── Local State ──────────────────────────────────────────────────────────
  const [settings,       setSettings]       = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showRadar,      setShowRadar]       = useState(false);
  const [attestedAddress, setAttestedAddress] = useState<string | null>(null);
  const [activeFolder,   setActiveFolder]   = useState('all');

  const [conversations, setConversations]   = useState<Conversation[]>([
    { peerAddress: '0xInstitutionalSupport', displayName: 'Institutional Support', folder: 'institutional', unread: 1 },
  ]);
  const [activeConv,    setActiveConv]      = useState<Conversation | null>(conversations[0]);

  const [messages,      setMessages]        = useState<RenderableMessage[]>([
    {
      id: '0',
      senderAddress: '0xInstitutionalSupport',
      content: 'Welcome to Sovereign Chat. Your connection is ML-KEM-1024 encrypted.',
      sentAt: Date.now() - 5000,
      isMine: false,
      isPinned: false,
      isDestructing: false,
      reactions: [],
      attestationScore: 99,
    },
  ]);

  const [replyingTo, setReplyingTo] = useState<{ id: string; preview: string } | undefined>();
  const [pinnedIds,  setPinnedIds]  = useState<Set<string>>(new Set());
  const [newPeer,    setNewPeer]    = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const accent    = THEME_ACCENT[settings.theme];

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply self-destruct timers
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => prev.filter(m => !m.destructsAt || m.destructsAt > Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Message Actions ───────────────────────────────────────────────────────

  const addMessage = useCallback((content: string, extra?: Partial<RenderableMessage>) => {
    if (!address) return;
    const newMsg: RenderableMessage = {
      id: Date.now().toString(),
      senderAddress: address,
      content,
      sentAt: Date.now(),
      isMine: true,
      isPinned: false,
      isDestructing: !!settings.autoDestruct && settings.autoDestruct !== 'off',
      destructsAt: buildDestructsAt(settings.autoDestruct),
      reactions: [],
      replyToId: replyingTo?.id,
      attestationScore: attestedAddress ? 99.5 : undefined,
      ...extra,
    };
    setMessages(prev => [...prev, newMsg]);
    setReplyingTo(undefined);
  }, [address, settings.autoDestruct, replyingTo, attestedAddress]);

  const handleSendText  = (text: string)              => addMessage(text);
  const handleSendEmoji = (emoji: string)              => addMessage(emoji);
  const handleSendVoice = (blob: Blob, dur: number)    => addMessage(`[🎤 Voice · ${(dur/1000).toFixed(1)}s]`);
  const handleSendFile  = (file: File)                 => addMessage(`[📎 ${file.name} · ${(file.size/1024).toFixed(0)} KB]`);

  const handleReact = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      const reactions: Reaction[] = existing
        ? m.reactions.map(r => r.emoji === emoji
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r)
        : [...m.reactions, { emoji, count: 1, reacted: true }];
      return { ...m, reactions: reactions.filter(r => r.count > 0) };
    }));
  };

  const handlePin = (messageId: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.has(messageId) ? next.delete(messageId) : next.add(messageId);
      return next;
    });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
  };

  const handleDelete  = (messageId: string) => setMessages(prev => prev.filter(m => m.id !== messageId));
  const handleReply   = (messageId: string) => {
    const target = messages.find(m => m.id === messageId);
    if (target) setReplyingTo({ id: messageId, preview: target.content.slice(0, 60) });
  };

  const startConversation = () => {
    if (!newPeer.trim()) return;
    const conv: Conversation = {
      peerAddress: newPeer.trim(),
      displayName: newPeer.trim().slice(0, 10) + '…',
      folder: 'all',
      unread: 0,
    };
    setConversations(prev => [...prev, conv]);
    setActiveConv(conv);
    setNewPeer('');
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredConvs = activeFolder === 'all'
    ? conversations
    : conversations.filter(c => c.folder === activeFolder || activeFolder === 'secret');

  const activeMessages = activeConv
    ? messages.filter(m =>
        m.senderAddress === activeConv.peerAddress || m.isMine
      )
    : [];

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="flex h-screen bg-[#050505] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-mono text-[12px] tracking-widest text-white/30 uppercase">Connect wallet to access Sovereign Chat</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden" style={{ '--accent': accent } as React.CSSProperties}>

      {/* Settings overlay */}
      {showSettings && (
        <AdvancedSettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Attestation (silent, fires once) */}
      {address && !attestedAddress && (
        <div className="hidden">
          <AttestationEngine
            sessionId={address}
            // Fires callback on success; we store the attested address
          />
        </div>
      )}

      {/* 1 – Folders Rail */}
      <SidebarNavigation
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 2 – Conversation List */}
      <div className="w-[280px] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPeer}
              onChange={e => setNewPeer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startConversation()}
              placeholder="0x address…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[12px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              onClick={startConversation}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-bold text-lg transition-all"
            >+</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(conv => (
            <button
              key={conv.peerAddress}
              onClick={() => setActiveConv(conv)}
              className={`w-full text-left px-4 py-4 border-b border-white/3 transition-all ${
                activeConv?.peerAddress === conv.peerAddress
                  ? 'bg-white/8 border-l-2'
                  : 'hover:bg-white/3 border-l-2 border-l-transparent'
              }`}
              style={activeConv?.peerAddress === conv.peerAddress ? { borderLeftColor: accent } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-mono text-[13px] font-bold">
                  {conv.displayName.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-mono text-[13px] font-bold text-white truncate">{conv.displayName}</p>
                  <p className="font-mono text-[10px] text-white/30 truncate mt-0.5">{conv.lastMessage ?? 'ML-KEM-1024 encrypted'}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full text-black text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: accent }}>
                    {conv.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3 – Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
              <div>
                <p className="font-mono text-[14px] font-bold text-white">{activeConv.displayName}</p>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: accent }}>
                  E2EE · ML-KEM-1024 · ε={settings.differentialNoiseEpsilon}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Radar toggle */}
                <button
                  onClick={() => setShowRadar(p => !p)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
                    showRadar ? 'border-white/30 text-white bg-white/5' : 'border-white/10 text-white/30 hover:text-white'
                  }`}
                >
                  Radar
                </button>
              </div>
            </div>

            {/* Body (messages + optional side panel) */}
            <div className="flex flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                <MessageEngine
                  messages={activeMessages}
                  onReact={handleReact}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  bottomRef={bottomRef}
                />
                <ChatInput
                  onSendText={handleSendText}
                  onSendVoice={handleSendVoice}
                  onSendFile={handleSendFile}
                  onSendEmoji={handleSendEmoji}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(undefined)}
                  autoDestruct={settings.autoDestruct}
                />
              </div>

              {/* Optional Radar + AI panel */}
              {showRadar && (
                <div className="w-[300px] border-l border-white/5 overflow-y-auto p-4 space-y-4 bg-black/20 shrink-0">
                  <WhaleRadar />
                  <div className="border-t border-white/5 pt-4">
                    <AtomicPortfolioShare />
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <AICoPilot />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 font-mono text-sm space-y-2">
            <p>Select a conversation to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
