'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWalletClient } from 'wagmi';
import { useSovereignAccount as useAccount } from '@/hooks/useSovereignAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { QrCode, X, ChevronLeft, Menu, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { toast } from 'sonner';

import SidebarNavigation from '@/components/chat/SidebarNavigation';
import MessageEngine from '@/components/chat/MessageEngine';
import ChatInput from '@/components/chat/ChatInput';
import AdvancedSettingsModal from '@/components/chat/AdvancedSettingsModal';
import AttestationEngine from '@/components/dashboard/AttestationEngine';
import { QrScanner } from '@/components/dashboard/QrScanner';


import type { RenderableMessage, Reaction } from '@/components/chat/MessageEngine';
import type { ChatSettings } from '@/components/chat/AdvancedSettingsModal';
import { DEFAULT_SETTINGS } from '@/components/chat/AdvancedSettingsModal';

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
// Imported from AdvancedSettingsModal

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

// ── Persist conversations to localStorage ────────────────────────────────

function loadConversations(selfAddress: string): Conversation[] {
  if (typeof window === 'undefined' || !selfAddress) return [];
  try {
    const raw = localStorage.getItem(`sovereign_chat_convs_${selfAddress.toLowerCase()}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveConversations(selfAddress: string, convs: Conversation[]) {
  if (typeof window === 'undefined' || !selfAddress) return;
  localStorage.setItem(`sovereign_chat_convs_${selfAddress.toLowerCase()}`, JSON.stringify(convs));
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
    const ctx = new window.AudioContext();
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

export default function SovereignChat({ onReturnToGate }: { onReturnToGate?: () => void }) {
  const { address, isConnected, isLocalSovereignWallet } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { privateKey: storePrivateKey } = useWalletStore();
  const { disconnect } = useDisconnect();

  const handleFullDisconnect = () => {
    try { disconnect(); } catch {}
    localStorage.removeItem('sovereign_keystore');
    document.cookie = 'whale_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'sovereign_handshake=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    toast.success('Session disconnected.');
    window.location.replace('/connect');
  };

  // ── Settings (persisted) ─────────────────────────────────────────────────
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setSettings(loadSettings()); }, []);
  const handleSettingsChange = (s: ChatSettings) => { setSettings(s); saveSettings(s); };

  // ── UI State ─────────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [scannerTab, setScannerTab]     = useState<'scan' | 'my-qr'>('scan');
  const [activeFolder, setActiveFolder] = useState('all');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // ── Conversations & Messages ─────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<RenderableMessage[]>([]);
  const [replyingTo, setReplyingTo]       = useState<{ id: string; preview: string } | undefined>();
  const [pinnedIds, setPinnedIds]         = useState<Set<string>>(new Set());
  const [newPeer, setNewPeer]             = useState('');
  const [sending, setSending]             = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [xmtpReady, setXmtpReady]        = useState(false);
  const [xmtpError, setXmtpError]        = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const xmtpClient = useRef<any>(null);
  
  const activeConvRef = useRef<Conversation | null>(null);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  const settingsRef = useRef<ChatSettings>(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Load conversations on mount / address change
  useEffect(() => {
    if (address) {
      setConversations(loadConversations(address));
    } else {
      setConversations([]);
    }
    setActiveConv(null);
    setMessages([]);
  }, [address]);

  // Save conversations on change
  useEffect(() => {
    if (address && conversations.length > 0) {
      saveConversations(address, conversations);
    }
  }, [conversations, address]);

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
  const initXmtpClient = useCallback(async () => {
    if (!isConnected || !address) return;
    const hasLocalWallet = isLocalSovereignWallet && storePrivateKey;
    if (!walletClient && !hasLocalWallet) return;

    setXmtpError(null);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(1.5, attempts)));

        let signer: any;
        if (hasLocalWallet) {
          const ethersWallet = new ethers.Wallet(storePrivateKey);
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              return ethersWallet.signMessage(msg);
            },
          };
        } else if (walletClient) {
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              const text = typeof msg === 'string' ? msg : new TextDecoder().decode(msg);
              return walletClient.signMessage({ message: text });
            },
          };
        } else {
          return;
        }
        const client = await getXMTPClient(signer);
        xmtpClient.current = client;
        setXmtpReady(true);
        return; // Success
      } catch (e: any) {
        attempts++;
        const msg = (e?.message || '').toLowerCase();
        // If user actively rejected, don't retry automatically
        if (msg.includes('reject') || msg.includes('deny') || msg.includes('user denied')) {
           setXmtpError('Signature rejected. Please approve the prompt in your wallet.');
           return;
        }
        if (attempts >= maxAttempts) {
           setXmtpError(e?.message ?? 'XMTP init failed after retries due to network inactivity.');
        } else {
           console.warn(`[XMTP] Init attempt ${attempts} failed, retrying...`, e);
        }
      }
    }
  }, [isConnected, walletClient, address, isLocalSovereignWallet, storePrivateKey]);

  useEffect(() => {
    initXmtpClient();
  }, [initXmtpClient]);

  // ── Global XMTP Stream ───────────────────────────────────────────────────
  useEffect(() => {
    if (!xmtpReady || !xmtpClient.current) return;
    
    let cancelled = false;
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    (async () => {
      try {
        const gen = streamMessages(xmtpClient.current);
        for await (const msg of gen) {
          if (cancelled) break;
          
          const rendered = xmtpToRenderable(msg, selfInboxId);
          if (typeof rendered.content === 'string' && rendered.content.includes('initiatedByInboxId')) {
             continue;
          }
          const fromPeer = msg.senderInboxId !== selfInboxId;
          const msgConvPeer = msg.conversation?.peerAddress?.toLowerCase() ?? '';
          const currentActivePeer = activeConvRef.current?.peerAddress.toLowerCase();
          
          // Verify if message belongs to the current conversation
          const belongsToActive = (msgConvPeer === currentActivePeer) || (!msgConvPeer && currentActivePeer);

          if (belongsToActive) {
            if (fromPeer && settingsRef.current.soundEnabled) playMessageSound();
            setMessages(prev => {
              if (prev.some(m => m.id === rendered.id)) return prev;
              
              if (!fromPeer) {
                // Deduplicate own optimistic messages
                const optIndex = prev.findIndex(m => m.id.startsWith('opt-') && m.content === rendered.content);
                if (optIndex !== -1) {
                  const next = [...prev];
                  next[optIndex] = rendered;
                  return next.sort((a, b) => a.sentAt - b.sentAt);
                }
              }
              
              return [...prev, rendered].sort((a, b) => a.sentAt - b.sentAt);
            });
            // Update last message in conv list
            setConversations(prev => prev.map(c => 
              c.peerAddress.toLowerCase() === currentActivePeer 
                ? { ...c, lastMessage: rendered.content.slice(0, 30) } 
                : c
            ));
          } else if (fromPeer) {
            // If it belongs to another conversation, update its unread count
            setConversations(prev => {
               if (!msgConvPeer) return prev;
               
               const exists = prev.some(c => c.peerAddress.toLowerCase() === msgConvPeer);
               if (exists) {
                 return prev.map(c => 
                   c.peerAddress.toLowerCase() === msgConvPeer 
                     ? { ...c, unread: c.unread + 1, lastMessage: rendered.content.slice(0, 30) } 
                     : c
                 );
               } else {
                 // Auto-add new conversation
                 return [...prev, {
                    peerAddress: msg.conversation.peerAddress,
                    displayName: msg.conversation.peerAddress.slice(0, 6) + '...' + msg.conversation.peerAddress.slice(-4),
                    folder: 'all',
                    unread: 1,
                    lastMessage: rendered.content.slice(0, 30)
                 }];
               }
            });
            if (settingsRef.current.soundEnabled) playMessageSound();
          }
        }
      } catch (e) {
        console.warn('[Chat] global stream failed:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [xmtpReady]);

  // ── Load messages when conversation changes ───────────────────────────────
  useEffect(() => {
    if (!xmtpClient.current || !activeConv) { setMessages([]); return; }

    let cancelled = false;
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    const fetchHistorical = async () => {
      try {
        const raw = await getMessages(xmtpClient.current, activeConv.peerAddress);
        if (cancelled) return;
        const rendered = raw
          .map((m: any) => xmtpToRenderable(m, selfInboxId))
          .filter((m: any) => !(typeof m.content === 'string' && m.content.includes('initiatedByInboxId')))
          .sort((a, b) => a.sentAt - b.sentAt);
        
        // Merge with optimistic local messages safely
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('opt-'));
          const renderedIds = new Set(rendered.map(r => r.id));
          return [...rendered, ...optimistic.filter(o => !renderedIds.has(o.id))].sort((a, b) => a.sentAt - b.sentAt);
        });
      } catch (e) {
        console.warn('[Chat] load messages failed:', e);
      }
    };

    fetchHistorical();

    // Fallback polling for the active conversation
    const pollId = setInterval(fetchHistorical, 5000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.peerAddress, xmtpReady]);

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
    
    // Update last message locally
    setConversations(prev => prev.map(c => 
      c.peerAddress.toLowerCase() === activeConv.peerAddress.toLowerCase() 
        ? { ...c, lastMessage: content.slice(0, 30) } 
        : c
    ));

    try {
      await xmtpSend(xmtpClient.current, activeConv.peerAddress, content);
      // Mark as sent (remove optimistic tag)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, readAt: undefined } : m));
    } catch (e: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('[Chat] send failed:', e);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [activeConv, replyingTo, settings.autoDestruct]);

  // ── Emoji / Voice / File senders ─────────────────────────────────────────
  const handleSendText  = (text: string) => sendXmtp(text);
  const handleSendEmoji = (emoji: string) => sendXmtp(emoji);

  const uploadAttachment = async (fileOrBlob: Blob, filename: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileOrBlob, filename);
      const res = await fetch('/api/chat/attachments', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return `[ATTACHMENT:${data.type}]${data.url}|${data.name}`;
    } catch (err: any) {
      toast.error('Attachment failed', { description: err.message });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVoice = async (blob: Blob, dur: number) => {
    const payload = await uploadAttachment(blob, `voice-${Date.now()}.webm`);
    if (payload) await sendXmtp(payload);
  };

  const handleSendFile = async (file: File) => {
    const payload = await uploadAttachment(file, file.name);
    if (payload) await sendXmtp(payload);
  };

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
  const startConversation = (addressOverride?: string) => {
    const addr = (addressOverride ?? newPeer).trim();
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
    
    // Select the existing or new conversation
    setConversations(prev => {
       const existing = prev.find(c => c.peerAddress.toLowerCase() === addr.toLowerCase());
       setActiveConv(existing || conv);
       return prev;
    });
    
    setNewPeer('');
  };

  const filteredConvs = activeFolder === 'all' ? conversations : conversations.filter(c => c.folder === activeFolder);

  // ── Theme-driven background (forced light — no dark mode in chat) ────────
  const bg = '#ffffff';

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center">
        <p className="font-mono text-[12px] tracking-widest text-black/30 uppercase">
          Connect wallet to access Sovereign Chat
        </p>
      </div>
    );
  }

  if (xmtpError) {
    return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center flex-col gap-4">
        <p className="font-mono text-[12px] tracking-widest text-red-500 uppercase">XMTP Synchronization Error</p>
        <p className="font-mono text-[10px] text-black/40 max-w-md text-center">{xmtpError}</p>
        <button onClick={() => initXmtpClient()} className="px-6 py-2.5 bg-black text-white font-mono text-[10px] uppercase tracking-widest rounded-xl">
          Retry Sync
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 w-full h-full text-black overflow-hidden" style={{ background: bg }}>

      {/* Settings overlay */}
      {showSettings && (
        <AdvancedSettingsModal
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Scanner overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md relative shadow-2xl border border-black/10 flex flex-col items-center">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-black/50 hover:text-black z-10">
              <X size={20} />
            </button>
            <h3 className="font-mono text-lg font-bold mb-4 uppercase tracking-widest text-center">Wallet QR</h3>
            
            <div className="flex bg-black/[0.04] p-1 rounded-xl w-full mb-6 relative">
              <button
                onClick={() => setScannerTab('scan')}
                className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  scannerTab === 'scan' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black/80'
                }`}
              >
                Scan QR
              </button>
              <button
                onClick={() => setScannerTab('my-qr')}
                className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  scannerTab === 'my-qr' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black/80'
                }`}
              >
                My QR
              </button>
            </div>

            {scannerTab === 'scan' ? (
              <div className="w-full">
                <QrScanner 
                  mode="scan" 
                  onScanSuccess={(scannedAddr) => {
                    setShowScanner(false);
                    startConversation(scannedAddr);
                  }} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="p-6 bg-white rounded-3xl border border-black/10 shadow-xl">
                  {address ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${address}&color=000000&bgcolor=ffffff`} alt="QR" className="w-[220px] h-[220px] object-contain" />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-black/5 rounded-2xl">
                      <p className="text-[10px] font-mono text-black/40">No wallet connected</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">Your Wallet Address</p>
                  <p className="font-mono text-[11px] font-bold text-black break-all max-w-[250px]">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex md:hidden">
          <div className="bg-white w-[240px] h-full shadow-2xl flex flex-col relative border-r border-black/10">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 text-black/50 hover:text-black z-50 p-1 bg-black/5 rounded-full"
            >
              <X size={16} />
            </button>
            <SidebarNavigation
              activeFolder={activeFolder}
              onSelectFolder={(folder) => {
                setActiveFolder(folder);
                setShowMobileSidebar(false);
              }}
              onOpenSettings={() => {
                setShowSettings(true);
                setShowMobileSidebar(false);
              }}
            />
          </div>
          <div className="flex-1" onClick={() => setShowMobileSidebar(false)} />
        </div>
      )}

      {/* 1 – Folders Rail */}
      <div className="hidden md:flex">
        <SidebarNavigation
          activeFolder={activeFolder}
          onSelectFolder={setActiveFolder}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {/* 2 – Conversation List */}
      <div className={`w-full md:w-[280px] border-r border-black/8 flex-col shrink-0 bg-white ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-black/6 space-y-3">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <div className="flex items-center gap-2">
              {onReturnToGate && (
                <button
                  onClick={onReturnToGate}
                  title="Back to wallet selector"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/[0.04] border border-black/10 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-black hover:bg-black/[0.08] transition-all"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.04] border border-black/10 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-black hover:bg-black/[0.08] transition-all"
              >
                <Menu size={16} />
                <span>{activeFolder === 'all' ? 'All Chats' : 'Secret ZK'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFullDisconnect}
                title="Disconnect session"
                className="p-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-500 hover:bg-rose-100 transition-all"
              >
                <LogOut size={15} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 bg-black/[0.04] border border-black/10 rounded-xl text-black hover:bg-black/[0.08] transition-all"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPeer}
              onChange={e => setNewPeer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startConversation()}
              placeholder="0x address…"
              className="flex-1 min-w-0 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] font-mono text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
            />
            <button
              onClick={() => setShowScanner(true)}
              className="px-3 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-black hover:bg-black/10 transition-all shrink-0 flex items-center justify-center"
              title="Scan QR Code"
            >
              <QrCode size={18} />
            </button>
            <button
              onClick={() => startConversation()}
              className="px-3 py-2.5 rounded-xl bg-black text-white hover:bg-black/80 font-bold text-[16px] transition-all shrink-0 flex items-center justify-center"
              title="Add Address"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-black/25 font-mono text-[10px] px-4 text-center">
              Add a wallet address or scan a QR to start a conversation
            </div>
          )}
          {filteredConvs.map(conv => (
            <button
              key={conv.peerAddress}
              onClick={() => {
                // Clear unread on click
                setConversations(prev => prev.map(c => 
                  c.peerAddress === conv.peerAddress ? { ...c, unread: 0 } : c
                ));
                setActiveConv(conv);
              }}
              className={`w-full text-left px-4 py-4 border-b border-black/4 transition-all ${
                activeConv?.peerAddress.toLowerCase() === conv.peerAddress.toLowerCase()
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
      <div className={`flex-1 flex-col min-w-0 bg-white ${activeConv ? 'flex' : 'hidden md:flex'}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-2 -ml-3 text-black/50 hover:text-black transition-colors rounded-full hover:bg-black/5">
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <p className="font-mono text-[14px] font-bold text-black">{activeConv.displayName}</p>
                  <p className={`font-mono text-[10px] font-bold mt-0.5 uppercase tracking-widest ${sending || isUploading ? 'text-black/50' : 'text-emerald-500'}`}>
                    {sending || isUploading ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Radar Removed */}
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
                  onAutoDestructChange={(val) => handleSettingsChange({ ...settings, autoDestruct: val })}
                  disabled={!xmtpReady || sending || isUploading}
                />
              </div>
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
