'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWalletClient } from 'wagmi';
import { useSovereignAccount as useAccount } from '@/hooks/useSovereignAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { QrCode, X, ChevronLeft, Menu, Settings, LogOut, ArrowLeft, UserX, UserCheck, Download, Trash2, UserPlus, User, MoreVertical } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';

import SidebarNavigation from '@/components/chat/SidebarNavigation';
import MessageEngine from '@/components/chat/MessageEngine';
import ChatInput from '@/components/chat/ChatInput';
import AdvancedSettingsModal from '@/components/chat/AdvancedSettingsModal';
import AttestationEngine from '@/components/dashboard/AttestationEngine';
import { QrScanner } from '@/components/dashboard/QrScanner';
import { QRCodeSVG } from 'qrcode.react';


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

// ── Contact/Block helpers ─────────────────────────────────────────────────

function getBlockedList(): string[] {
  try { return JSON.parse(localStorage.getItem('sovereign_blocked') || '[]'); } catch { return []; }
}
function setBlockedList(list: string[]) {
  localStorage.setItem('sovereign_blocked', JSON.stringify(list));
}
function getContacts(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('sovereign_contacts') || '{}'); } catch { return {}; }
}
function setContacts(contacts: Record<string, string>) {
  localStorage.setItem('sovereign_contacts', JSON.stringify(contacts));
}
function exportChat(messages: RenderableMessage[], peerAddress: string) {
  const lines = messages.map(m => {
    const date = new Date(m.sentAt).toLocaleString();
    const sender = m.isMine ? 'Me' : peerAddress.slice(0, 8) + '...';
    return `[${date}] ${sender}: ${m.content}`;
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whale-chat-${peerAddress.slice(0, 8)}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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
  const { nuclearDisconnect } = useSovereignSignOut();

  const handleFullDisconnect = () => {
    toast.success('Session disconnected.');
    nuclearDisconnect();
  };

  // ── Metadata Hydration Engine (Reactions, Pins, Deletions, Replies) ─────────
  const hydrateMessages = useCallback((msgs: RenderableMessage[]) => {
    if (!address) return msgs;
    const normAddr = address.toLowerCase();

    let deletedIds: string[] = [];
    let pinnedIdsList: string[] = [];
    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      if (delRaw) deletedIds = JSON.parse(delRaw);
    } catch {}
    try {
      const pinRaw = localStorage.getItem(`whale_chat_pins_${normAddr}`);
      if (pinRaw) pinnedIdsList = JSON.parse(pinRaw);
    } catch {}

    const deletedSet = new Set(deletedIds);
    const pinnedSet = new Set(pinnedIdsList);

    return msgs
      .filter(m => !deletedSet.has(m.id))
      .map(m => {
        let content = m.content;
        let replyToId = m.replyToId;
        const replyMatch = typeof content === 'string' ? content.match(/^\[REPLY:([^\]]+)\](.*)$/s) : null;
        if (replyMatch) {
          replyToId = replyMatch[1];
          content = replyMatch[2];
        }

        let reactions = m.reactions || [];
        try {
          const rxRaw = localStorage.getItem(`whale_chat_reactions_${normAddr}_${m.id}`);
          if (rxRaw) reactions = JSON.parse(rxRaw);
        } catch {}

        return {
          ...m,
          content,
          replyToId,
          isPinned: pinnedSet.has(m.id),
          reactions,
        };
      });
  }, [address]);

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
  const [showPeerMenu, setShowPeerMenu] = useState(false);
  const [blockedList, setBlockedListState] = useState<string[]>([]);
  const [contacts, setContactsState] = useState<Record<string, string>>({});

  // Load blocked + contacts on mount
  useEffect(() => {
    setBlockedListState(getBlockedList());
    setContactsState(getContacts());
  }, []);

  // ── Conversations & Messages ─────────────────────────────────────────────
  const [conversationsState, setConversationsState] = useState<Conversation[]>([]);
  const setConversations = useCallback((val: Conversation[] | ((prev: Conversation[]) => Conversation[])) => {
    setConversationsState((prev: Conversation[]) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (address) {
        localStorage.setItem(`whale_chat_convs_${address.toLowerCase()}`, JSON.stringify(next));
      }
      return next;
    });
  }, [address]);

  const conversations = conversationsState;

  useEffect(() => {
    if (address) {
      try {
        const saved = JSON.parse(localStorage.getItem(`whale_chat_convs_${address.toLowerCase()}`) || '[]');
        setConversationsState(saved);
      } catch {}
    } else {
      setConversationsState([]);
    }
  }, [address]);

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

  // ── Auto-scroll & Mobile Keyboard Stability ───────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    };
    
    // Initial scroll when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Handle viewport changes (mobile keyboard open/close)
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [messages]);

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
    if ((settings as any).screenshotProtection) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
  }, [(settings as any).screenshotProtection]);

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
          const hydratedList = hydrateMessages([rendered]);
          if (hydratedList.length === 0) continue;
          const hydrated = hydratedList[0];

          const fromPeer = msg.senderInboxId !== selfInboxId;
          
          // Fallback to extract peerAddress from members if not natively provided by SDK v5.3.0
          let msgConvPeer = msg.conversation?.peerAddress?.toLowerCase() || '';
          if (!msgConvPeer && msg.conversation) {
            try {
              const rawMembers = msg.conversation.members;
              const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
              const selfNorm = address?.toLowerCase() ?? '';
              for (const m of members) {
                const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
                const peer = addrs.find((a: string) => a.toLowerCase() !== selfNorm);
                if (peer) {
                  msgConvPeer = peer.toLowerCase();
                  // Attach it to the conversation object so auto-add has it
                  msg.conversation.peerAddress = peer;
                  break;
                }
              }
            } catch (e) {}
          }

          const currentActivePeer = activeConvRef.current?.peerAddress.toLowerCase();
          
          // Verify if message belongs to the current conversation
          const belongsToActive = (msgConvPeer === currentActivePeer) || (!msgConvPeer && currentActivePeer);

          if (belongsToActive) {
            if (fromPeer && (settingsRef.current as any).soundEnabled !== false) playMessageSound();
            setMessages(prev => {
              if (prev.some(m => m.id === hydrated.id)) return prev;
              
              if (!fromPeer) {
                // Deduplicate own optimistic messages
                const optIndex = prev.findIndex(m => m.id.startsWith('opt-') && m.content === hydrated.content);
                if (optIndex !== -1) {
                  const next = [...prev];
                  next[optIndex] = hydrated;
                  return next.sort((a, b) => a.sentAt - b.sentAt);
                }
              }
              
              return [...prev, hydrated].sort((a, b) => a.sentAt - b.sentAt);
            });
            // Update last message in conv list
            setConversations(prev => prev.map(c => 
              c.peerAddress.toLowerCase() === currentActivePeer 
                ? { ...c, lastMessage: hydrated.content.slice(0, 30) } 
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
                     ? { ...c, unread: c.unread + 1, lastMessage: hydrated.content.slice(0, 30) } 
                     : c
                 );
               } else {
                 // Auto-add new conversation
                 const newPeerAddr = msg.conversation.peerAddress || msgConvPeer;
                 return [...prev, {
                    peerAddress: newPeerAddr,
                    displayName: newPeerAddr.slice(0, 6) + '...' + newPeerAddr.slice(-4),
                    folder: 'all',
                    unread: 1,
                    lastMessage: hydrated.content.slice(0, 30)
                 }];
               }
            });
            if ((settingsRef.current as any).soundEnabled !== false) playMessageSound();
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
        
        const hydrated = hydrateMessages(rendered);
        
        // Merge with optimistic local messages safely
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('opt-'));
          const renderedIds = new Set(hydrated.map(r => r.id));
          return [...hydrated, ...optimistic.filter(o => !renderedIds.has(o.id))].sort((a, b) => a.sentAt - b.sentAt);
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

    const finalContent = replyingTo ? `[REPLY:${replyingTo.id}]${content}` : content;

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
      await xmtpSend(xmtpClient.current, activeConv.peerAddress, finalContent);
      // Mark as sent (remove optimistic tag)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, readAt: undefined } : m));
    } catch (e: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('[Chat] send failed:', e);
      const msg = e?.message?.toLowerCase() || '';
      if (msg.includes('network') || msg.includes('recipient') || msg.includes('not found')) {
         toast.error('Destinatario Inactivo', { description: 'La wallet de destino no ha activado Whale Chat. No puede recibir mensajes aún.' });
      } else {
         toast.error('Error de Envío', { description: e?.message || 'Hubo un problema al enviar el mensaje de forma segura.' });
      }
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
    if (!address) return;
    const normAddr = address.toLowerCase();

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      const reactions: Reaction[] = existing
        ? m.reactions.map(r => r.emoji === emoji
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r)
        : [...m.reactions, { emoji, count: 1, reacted: true }];
      
      const nextReactions = reactions.filter(r => r.count > 0);

      try {
        localStorage.setItem(`whale_chat_reactions_${normAddr}_${messageId}`, JSON.stringify(nextReactions));
      } catch {}

      return { ...m, reactions: nextReactions };
    }));
  };

  const handlePin = (messageId: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const nextPinned = !m.isPinned;

      try {
        const pinRaw = localStorage.getItem(`whale_chat_pins_${normAddr}`);
        let pins: string[] = pinRaw ? JSON.parse(pinRaw) : [];
        if (nextPinned) {
          if (!pins.includes(messageId)) pins.push(messageId);
        } else {
          pins = pins.filter(id => id !== messageId);
        }
        localStorage.setItem(`whale_chat_pins_${normAddr}`, JSON.stringify(pins));
      } catch {}

      return { ...m, isPinned: nextPinned };
    }));
  };

  const handleDelete = (messageId: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();

    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      const deleted: string[] = delRaw ? JSON.parse(delRaw) : [];
      if (!deleted.includes(messageId)) {
        deleted.push(messageId);
        localStorage.setItem(`whale_chat_deleted_${normAddr}`, JSON.stringify(deleted));
      }
    } catch {}

    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleReply  = (messageId: string) => {
    const target = messages.find(m => m.id === messageId);
    if (target) setReplyingTo({ id: messageId, preview: target.content.slice(0, 60) });
  };

  // ── Peer management actions ───────────────────────────────────────────────
  const toggleBlock = (peerAddr: string) => {
    const norm = peerAddr.toLowerCase();
    const current = getBlockedList();
    const isBlocked = current.includes(norm);
    const next = isBlocked ? current.filter(a => a !== norm) : [...current, norm];
    setBlockedList(next);
    setBlockedListState(next);
    toast.success(isBlocked ? 'User unblocked.' : 'User blocked. Messages filtered.');
  };

  const addToContacts = (peerAddr: string) => {
    const alias = prompt(`Save alias for ${peerAddr.slice(0, 10)}...`, peerAddr.slice(0, 6) + '...' + peerAddr.slice(-4));
    if (!alias) return;
    const updated = { ...getContacts(), [peerAddr.toLowerCase()]: alias };
    setContacts(updated);
    setContactsState(updated);
    // Update displayName in conversation list
    setConversations(prev => prev.map(c =>
      c.peerAddress.toLowerCase() === peerAddr.toLowerCase() ? { ...c, displayName: alias } : c
    ));
    if (activeConv?.peerAddress.toLowerCase() === peerAddr.toLowerCase()) {
      setActiveConv(prev => prev ? { ...prev, displayName: alias } : null);
    }
    toast.success(`Saved as "${alias}"`);
  };

  const clearChat = (peerAddr: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();
    // Mark all current messages as deleted
    const currentIds = messages.map(m => m.id);
    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      const deleted: string[] = delRaw ? JSON.parse(delRaw) : [];
      const combined = Array.from(new Set([...deleted, ...currentIds]));
      localStorage.setItem(`whale_chat_deleted_${normAddr}`, JSON.stringify(combined));
    } catch {}
    setMessages([]);
    toast.success('Chat cleared locally.');
  };

  const deleteConversation = (peerAddr: string) => {
    clearChat(peerAddr);
    setConversations(prev => prev.filter(c => c.peerAddress.toLowerCase() !== peerAddr.toLowerCase()));
    setActiveConv(null);
    setShowPeerMenu(false);
    toast.success('Conversation removed.');
  };

  // ── Start new conversation ────────────────────────────────────────────────
  const startConversation = (addressOverride?: string) => {
    const addr = (addressOverride ?? newPeer).trim();
    if (!addr) return;
    if (!addr.startsWith('0x') || addr.length !== 42) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }
    const contactAlias = contacts[addr.toLowerCase()];
    const conv: Conversation = {
      peerAddress: addr,
      displayName: contactAlias || addr.slice(0, 6) + '...' + addr.slice(-4),
      folder: 'all',
      unread: 0,
    };

    const existing = conversations.find(c => c.peerAddress.toLowerCase() === addr.toLowerCase());
    const targetConv = existing || conv;

    if (!existing) {
      setConversations(prev => [conv, ...prev]);
    }

    setActiveConv(targetConv);
    setNewPeer('');
  };

  // Filter blocked peers from conversation list incoming messages
  const filteredConvs = (activeFolder === 'all' ? conversations : conversations.filter(c => c.folder === activeFolder))
    .filter(c => !blockedList.includes(c.peerAddress.toLowerCase()));

  // ── Theme-driven background is handled via CSS variables in globals.css ────────

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
        <p className="font-mono text-[12px] tracking-widest text-red-500 uppercase">Error de Sincronización XMTP</p>
        <p className="font-mono text-[10px] text-black/40 max-w-md text-center">{xmtpError}</p>
        <button onClick={() => initXmtpClient()} className="px-6 py-2.5 bg-black text-white font-mono text-[10px] uppercase tracking-widest rounded-xl">
          Reintentar Firma y Sincronizar
        </button>
      </div>
    );
  }

  if (!xmtpReady) {
    return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center flex-col gap-5 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 animate-pulse">
           <UserCheck size={28} className="text-black/60" />
        </div>
        <div>
          <h2 className="font-mono text-[14px] font-black tracking-widest uppercase text-black mb-2">Activando Motor Criptográfico</h2>
          <p className="font-mono text-[10px] text-black/50 max-w-[280px] mx-auto leading-relaxed">
            Whale Chat requiere una firma única para cifrar tus mensajes de extremo a extremo. Revisa tu billetera.
          </p>
        </div>
        <button onClick={() => initXmtpClient()} className="mt-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-md">
          Toque aquí para Firmar (Móvil)
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex-1 flex text-black overflow-hidden chat-theme-wrapper bg-white relative" data-chat-theme={settings.theme} data-privacy={settings.privacyMode} onClick={() => showPeerMenu && setShowPeerMenu(false)}>

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
                    <QRCodeSVG
                      value={address}
                      size={220}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="H"
                      includeMargin={false}
                    />
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
      <div data-sidebar className={`w-full md:w-[280px] border-r border-black/8 flex-col shrink-0 bg-white ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-black/6 space-y-3 pt-[calc(1rem+env(safe-area-inset-top))]">
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
              data-chat-input
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

        <div className="flex-1 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 bg-white shrink-0 pt-[calc(1rem+env(safe-area-inset-top))] relative">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-2 -ml-3 text-black/50 hover:text-black transition-colors rounded-full hover:bg-black/5">
                  <ChevronLeft size={24} />
                </button>
                <div className="w-9 h-9 rounded-full bg-black/8 border border-black/10 flex items-center justify-center font-mono text-[13px] font-bold text-black shrink-0">
                  {activeConv.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-mono text-[14px] font-bold text-black">{activeConv.displayName}</p>
                  <p className={`font-mono text-[10px] font-bold mt-0.5 uppercase tracking-widest ${sending || isUploading ? 'text-black/50' : 'text-emerald-500'}`}>
                    {blockedList.includes(activeConv.peerAddress.toLowerCase()) ? <span className="text-red-400">Blocked</span> :
                     !isConnected ? <span className="text-red-500">Offline</span> :
                     !xmtpReady ? <span className="text-amber-500">Awaiting Handshake...</span> :
                     sending || isUploading ? 'Typing...' : 'End-to-end encrypted'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPeerMenu(p => !p)}
                  className="w-9 h-9 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/[0.07] transition-all"
                  title="Peer options"
                >
                  <MoreVertical size={17} />
                </button>
              </div>

              {/* Peer Profile Dropdown */}
              {showPeerMenu && (
                <div className="absolute right-4 top-full mt-2 z-[200] bg-white border border-black/8 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.13)] w-[230px] flex flex-col py-2 overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Address badge */}
                  <div className="px-4 py-3 border-b border-black/6 mb-1">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/30 mb-0.5">Wallet Address</p>
                    <p className="font-mono text-[11px] font-bold text-black break-all">{activeConv.peerAddress.slice(0,10)}...{activeConv.peerAddress.slice(-6)}</p>
                  </div>
                  {[
                    { icon: UserPlus, label: contacts[activeConv.peerAddress.toLowerCase()] ? 'Edit Contact' : 'Add to Contacts', action: () => { addToContacts(activeConv.peerAddress); setShowPeerMenu(false); } },
                    { icon: Download, label: 'Export Chat', action: () => { exportChat(messages, activeConv.peerAddress); setShowPeerMenu(false); toast.success('Chat exported.'); } },
                    { icon: Trash2, label: 'Clear Chat', action: () => { clearChat(activeConv.peerAddress); setShowPeerMenu(false); } },
                    { icon: blockedList.includes(activeConv.peerAddress.toLowerCase()) ? UserCheck : UserX, label: blockedList.includes(activeConv.peerAddress.toLowerCase()) ? 'Unblock User' : 'Block User', action: () => { toggleBlock(activeConv.peerAddress); setShowPeerMenu(false); }, warn: true },
                    { icon: X, label: 'Delete Conversation', action: () => deleteConversation(activeConv.peerAddress), danger: true },
                  ].map(({ icon: Icon, label, action, warn, danger }) => (
                    <button key={label} onClick={action} className={`flex items-center gap-3 px-4 py-2.5 text-[12px] font-mono transition-all ${
                      danger ? 'text-red-500 hover:bg-red-50' : warn ? 'text-amber-600 hover:bg-amber-50' : 'text-black/60 hover:bg-black/[0.04] hover:text-black'
                    }`}>
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>
              )}
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
                  settings={settings}
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
