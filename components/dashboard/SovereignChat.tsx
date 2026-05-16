'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

import SidebarNavigation from '@/components/chat/SidebarNavigation';
import MessageEngine from '@/components/chat/MessageEngine';
import ChatInput from '@/components/chat/ChatInput';
import AdvancedSettingsModal from '@/components/chat/AdvancedSettingsModal';
import AttestationEngine from '@/components/dashboard/AttestationEngine';
import WhaleRadar from '@/components/dashboard/WhaleRadar';
import AICoPilot from '@/components/dashboard/AICoPilot';
import AtomicPortfolioShare from '@/components/dashboard/AtomicPortfolioShare';

import type { RenderableMessage, Reaction } from '@/components/chat/MessageEngine';
import type { ChatSettings } from '@/components/chat/AdvancedSettingsModal';

import {
  getXMTPClient,
  sendMessage as xmtpSend,
  getMessages,
  streamMessages,
  nsToDate,
} from '@/lib/xmtp/client';

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
  theme: 'light',
  privacyMode: 'standard',
  autoDestruct: 'off',
  showReadReceipts: true,
  showLastSeen: false,
  soundEnabled: true,
  notificationsEnabled: true,
  differentialNoiseEpsilon: 0.0001,
  linkPreviewsEnabled: true,
  screenshotProtection: false,
};

// ── Persist settings to localStorage ─────────────────────────────────────

function loadSettings(): ChatSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('sovereign_chat_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: ChatSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sovereign_chat_settings', JSON.stringify(s));
}

// ── XMTP message → RenderableMessage ────────────────────────────────────

function xmtpToRenderable(msg: any, selfInboxId: string): RenderableMessage {
  const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
  const sentAt = msg.sentAtNs ? Number(nsToDate(msg.sentAtNs)) : Date.now();
  const isMine = msg.senderInboxId === selfInboxId;
  return {
    id: msg.id ?? String(sentAt),
    senderAddress: msg.senderInboxId ?? '',
    content,
    sentAt,
    isMine,
    isPinned: false,
    isDestructing: false,
    reactions: [],
  };
}

// ── Sound helper ─────────────────────────────────────────────────────────

function playMessageSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

// ── SovereignChat (Orchestrator) ──────────────────────────────────────────

export default function SovereignChat() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // ── Settings (persisted) ─────────────────────────────────────────────────
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setSettings(loadSettings()); }, []);
  const handleSettingsChange = (s: ChatSettings) => { setSettings(s); saveSettings(s); };

  // ── UI State ─────────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [showRadar, setShowRadar]       = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');

  // ── Conversations & Messages ─────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<RenderableMessage[]>([]);
  const [replyingTo, setReplyingTo]       = useState<{ id: string; preview: string } | undefined>();
  const [pinnedIds, setPinnedIds]         = useState<Set<string>>(new Set());
  const [newPeer, setNewPeer]             = useState('');
  const [sending, setSending]             = useState(false);
  const [xmtpReady, setXmtpReady]        = useState(false);
  const [xmtpError, setXmtpError]        = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const xmtpClient = useRef<any>(null);
  const streamStop = useRef<(() => void) | null>(null);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Self-destruct ticker ─────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setMessages(prev => prev.filter(m => !m.destructsAt || m.destructsAt > Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Apply screenshot protection ──────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (settings.screenshotProtection) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
  }, [settings.screenshotProtection]);

  // ── XMTP Client Init ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected || !walletClient || !address) return;

    let cancelled = false;
    (async () => {
      try {
        setXmtpError(null);
        const signer = {
          getAddress: async () => address,
          signMessage: async (msg: string | Uint8Array) => {
            const text = typeof msg === 'string' ? msg : new TextDecoder().decode(msg);
            return walletClient.signMessage({ message: text });
          },
        };
        const client = await getXMTPClient(signer);
        if (cancelled) return;
        xmtpClient.current = client;
        setXmtpReady(true);
      } catch (e: any) {
        if (!cancelled) setXmtpError(e?.message ?? 'XMTP init failed');
      }
    })();

    return () => { cancelled = true; };
  }, [isConnected, walletClient, address]);

  // ── Load messages when conversation changes ───────────────────────────────
  useEffect(() => {
    if (!xmtpClient.current || !activeConv) { setMessages([]); return; }

    let cancelled = false;
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    (async () => {
      try {
        const raw = await getMessages(xmtpClient.current, activeConv.peerAddress);
        if (cancelled) return;
        const rendered = raw.map((m: any) => xmtpToRenderable(m, selfInboxId)).sort((a, b) => a.sentAt - b.sentAt);
        setMessages(rendered);
      } catch (e) {
        console.warn('[Chat] load messages failed:', e);
      }
    })();

    // ── Start streaming new messages ──────────────────────────────────────
    (async () => {
      try {
        let active = true;
        const gen = streamMessages(xmtpClient.current);
        const stop = () => { active = false; };
        streamStop.current = stop;

        for await (const msg of gen) {
          if (!active || cancelled) break;
          const rendered = xmtpToRenderable(msg, selfInboxId);

          // Only show messages belonging to active conversation
          const fromPeer = msg.senderInboxId !== selfInboxId;
          if (fromPeer && settings.soundEnabled) playMessageSound();

          setMessages(prev => {
            if (prev.some(m => m.id === rendered.id)) return prev;
            return [...prev, rendered].sort((a, b) => a.sentAt - b.sentAt);
          });
        }
      } catch (e) {
        console.warn('[Chat] stream failed:', e);
      }
    })();

    return () => {
      cancelled = true;
      streamStop.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv, xmtpReady]);

  // ── Send via XMTP ─────────────────────────────────────────────────────────
  const sendXmtp = useCallback(async (content: string) => {
    if (!xmtpClient.current || !activeConv) return;
    setSending(true);
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    // Optimistic update
    const optimistic: RenderableMessage = {
      id: `opt-${Date.now()}`,
      senderAddress: selfInboxId,
      content,
      sentAt: Date.now(),
      isMine: true,
      isPinned: false,
      isDestructing: !!settings.autoDestruct && settings.autoDestruct !== 'off',
      destructsAt: buildDestructsAt(settings.autoDestruct),
      reactions: [],
      replyToId: replyingTo?.id,
    };

    setMessages(prev => [...prev, optimistic]);
    setReplyingTo(undefined);

    try {
      await xmtpSend(xmtpClient.current, activeConv.peerAddress, content);
      // Mark as sent (remove optimistic tag)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, readAt: undefined } : m));
    } catch (e: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('[Chat] send failed:', e);
    } finally {
      setSending(false);
    }
  }, [activeConv, replyingTo, settings.autoDestruct]);

  // ── Emoji / Voice / File senders ─────────────────────────────────────────
  const handleSendText  = (text: string) => sendXmtp(text);
  const handleSendEmoji = (emoji: string) => sendXmtp(emoji);
  const handleSendVoice = (_blob: Blob, dur: number) => sendXmtp(`[🎤 Voice · ${(dur / 1000).toFixed(1)}s]`);
  const handleSendFile  = (file: File) => sendXmtp(`[📎 ${file.name} · ${(file.size / 1024).toFixed(0)} KB]`);

  // ── Reactions / Pin / Delete / Reply ────────────────────────────────────
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

  const handleDelete = (messageId: string) => setMessages(prev => prev.filter(m => m.id !== messageId));
  const handleReply  = (messageId: string) => {
    const target = messages.find(m => m.id === messageId);
    if (target) setReplyingTo({ id: messageId, preview: target.content.slice(0, 60) });
  };

  // ── Start new conversation ────────────────────────────────────────────────
  const startConversation = () => {
    const addr = newPeer.trim();
    if (!addr) return;
    if (!addr.startsWith('0x') || addr.length !== 42) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }
    const conv: Conversation = {
      peerAddress: addr,
      displayName: addr.slice(0, 6) + '...' + addr.slice(-4),
      folder: 'all',
      unread: 0,
    };
    setConversations(prev => {
      if (prev.some(c => c.peerAddress.toLowerCase() === addr.toLowerCase())) return prev;
      return [...prev, conv];
    });
    setActiveConv(conv);
    setNewPeer('');
  };

  const filteredConvs = activeFolder === 'all' ? conversations : conversations.filter(c => c.folder === activeFolder);

  // ── Theme-driven background (forced light — no dark mode in chat) ────────
  const bg = '#ffffff';

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <p className="font-mono text-[12px] tracking-widest text-black/30 uppercase">
          Connect wallet to access Sovereign Chat
        </p>
      </div>
    );
  }

  if (xmtpError) {
    return (
      <div className="flex h-screen bg-white items-center justify-center flex-col gap-4">
        <p className="font-mono text-[12px] tracking-widest text-red-500 uppercase">XMTP Error</p>
        <p className="font-mono text-[10px] text-black/40 max-w-md text-center">{xmtpError}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-black text-white font-mono text-[10px] uppercase tracking-widest rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen text-black overflow-hidden" style={{ background: bg }}>

      {/* Settings overlay */}
      {showSettings && (
        <AdvancedSettingsModal
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 1 – Folders Rail */}
      <SidebarNavigation
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 2 – Conversation List */}
      <div className="w-[280px] border-r border-black/8 flex flex-col shrink-0 bg-white">
        <div className="p-4 border-b border-black/6 space-y-3">
          {!xmtpReady && (
            <div className="text-[10px] font-mono text-black/40 animate-pulse text-center py-2">
              Initialising E2EE…
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPeer}
              onChange={e => setNewPeer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startConversation()}
              placeholder="0x address…"
              className="flex-1 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] font-mono text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
            />
            <button
              onClick={startConversation}
              className="px-3 py-2.5 rounded-xl bg-black text-white hover:bg-black/80 font-bold text-[16px] transition-all"
            >+</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-black/25 font-mono text-[10px] px-4 text-center">
              Add a wallet address above to start a conversation
            </div>
          )}
          {filteredConvs.map(conv => (
            <button
              key={conv.peerAddress}
              onClick={() => setActiveConv(conv)}
              className={`w-full text-left px-4 py-4 border-b border-black/4 transition-all ${
                activeConv?.peerAddress === conv.peerAddress
                  ? 'bg-black/[0.04] border-l-2 border-l-black'
                  : 'hover:bg-black/[0.02] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/8 border border-black/10 flex items-center justify-center shrink-0 font-mono text-[13px] font-bold text-black">
                  {conv.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-mono text-[13px] font-bold text-black truncate">{conv.displayName}</p>
                  <p className="font-mono text-[10px] text-black/35 truncate mt-0.5">{conv.lastMessage ?? 'E2EE encrypted'}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3 – Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 bg-white shrink-0">
              <div>
                <p className="font-mono text-[14px] font-bold text-black">{activeConv.displayName}</p>
                <p className="font-mono text-[10px] text-black/35 mt-0.5">
                  E2EE · ML-KEM-1024 · ε={settings.differentialNoiseEpsilon}
                  {sending && ' · Sending…'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRadar(p => !p)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
                    showRadar
                      ? 'border-black/30 text-black bg-black/5'
                      : 'border-black/10 text-black/35 hover:text-black'
                  }`}
                >
                  Radar
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                <MessageEngine
                  messages={messages}
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
                  disabled={!xmtpReady || sending}
                />
              </div>

              {showRadar && (
                <div className="w-[300px] border-l border-black/6 overflow-y-auto p-4 space-y-4 bg-white shrink-0">
                  <WhaleRadar />
                  <div className="border-t border-black/6 pt-4"><AtomicPortfolioShare /></div>
                  <div className="border-t border-black/6 pt-4"><AICoPilot /></div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-black/20 font-mono text-sm space-y-2">
            <p>Select or start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
