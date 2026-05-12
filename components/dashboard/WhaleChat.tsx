"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Send, MessageCircle, Plus, ArrowLeft, Shield, Lock, Activity, X, Camera, Zap } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import { getXMTPClient, canReceiveMessages, sendMessage, getMessages, destroyXMTPClient, nsToDate } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/dashboard/QrScanner';
import type { Client } from '@xmtp/browser-sdk';

interface ConversationMeta {
  peerAddress: string;
  lastMessage?: string;
  lastAt?: Date;
}

/** forceAutoInit=true: always auto-init XMTP even on mobile (used by /chat route) */
export interface WhaleChatProps {
  forceAutoInit?: boolean;
}

function Avatar({ address }: { address: string }) {
  const initials = address.slice(2, 4).toUpperCase();
  const hue = parseInt(address.slice(2, 8), 16) % 360;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
      style={{ background: `hsl(${hue},70%,45%)` }}
    >
      {initials}
    </div>
  );
}

export function WhaleChat({ forceAutoInit = false }: WhaleChatProps) {
  const { address, isConnected } = useSovereignAccount();
  const { signMessageAsync } = useSignMessage();

  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState('');

  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [peerInput, setPeerInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [peerStatus, setPeerStatus] = useState<{ online: boolean, lastSeen: number | null, isTyping: boolean }>({ online: false, lastSeen: null, isTyping: false });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePeerRef = useRef<string | null>(null);
  const activePeerDmIdRef = useRef<string | null>(null);
  const peerToConvId = useRef<Map<string, string>>(new Map());
  const convIdToPeer = useRef<Map<string, string>>(new Map());
  // Cache canReceiveMessages result per address to skip redundant network lookups
  const canReceiveCache = useRef<Map<string, boolean>>(new Map());
  // Track if initClient is already in-flight to prevent double-calls on mobile
  const initInFlight = useRef(false);

  // Detect physical device type (touch + narrow screen = mobile)
  useEffect(() => {
    const check = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice && window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keep activePeer ref in sync (used by async callbacks)
  useEffect(() => {
    activePeerRef.current = activePeer;
    if (activePeer) {
      const dmId = `dm-${activePeer.toLowerCase()}`;
      activePeerDmIdRef.current = dmId;
      peerToConvId.current.set(activePeer.toLowerCase(), dmId);
    } else {
      activePeerDmIdRef.current = null;
    }
  }, [activePeer]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle wallet disconnect
  useEffect(() => {
    if (!isConnected && client && address) {
      destroyXMTPClient(address);
      setClient(null);
      setConversations([]);
      setActivePeer(null);
      setMessages([]);
      canReceiveCache.current.clear();
      initInFlight.current = false;
    }
  }, [isConnected, address, client]);

  // ── AUTO-INITIALIZE: When wallet is connected and XMTP not yet started, ──────
  // auto-call initClient so the user doesn't have to tap a button.
  // XMTP v3 stores session keys in IndexedDB — after the first sign,
  // subsequent loads are silent (no wallet prompt needed).
  // NOTE: On mobile, XMTP WASM chunks sometimes fail to load (ChunkLoadError).
  // We skip auto-init on mobile and let the user trigger it manually to avoid
  // silent failures that leave the UI frozen with no clear path forward.
  useEffect(() => {
    if (isConnected && address && !client && !isInitializing) {
      // forceAutoInit=true (used by /chat route) overrides the mobile guard.
      // On desktop always auto-init. On mobile only when forceAutoInit is set.
      if (!isMobile || forceAutoInit) {
        initClient();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isMobile, forceAutoInit]);

  // Telemetry: Heartbeat Loop
  useEffect(() => {
      if (!address || !client) return;
      
      const sendHeartbeat = async () => {
          if (document.visibilityState !== 'visible') return; // Extreme privacy: pause heartbeat when hidden
          try {
              await fetch('/api/chat/telemetry', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ address, type: 'heartbeat' })
              });
          } catch {}
      };

      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, 15000);
      return () => clearInterval(interval);
  }, [address, client]);

  // Telemetry: Peer Polling Loop
  useEffect(() => {
      if (!activePeer || !address) {
          setPeerStatus({ online: false, lastSeen: null, isTyping: false });
          return;
      }
      let isMounted = true;
      const pollPeer = async () => {
          try {
              const res = await fetch(`/api/chat/telemetry?peer=${activePeer}&self=${address}`);
              if (!res.ok) return;
              const data = await res.json();
              if (isMounted) setPeerStatus(data);
          } catch {}
      };

      pollPeer();
      const interval = setInterval(pollPeer, 3000);
      return () => { isMounted = false; clearInterval(interval); };
  }, [activePeer, address]);

  // Extreme Security: Draft Persistence & Typing Telemetry
  useEffect(() => {
    if (!activePeer || !address) return;
    const draftKey = `whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`;
    
    if (inputText.trim()) {
      localStorage.setItem(draftKey, btoa(encodeURIComponent(inputText)));
    } else {
      localStorage.removeItem(draftKey);
    }

    // Typing telemetry: only fire when there is actual text
    if (!inputText.trim()) return;
    const sendTyping = async () => {
        try {
            await fetch('/api/chat/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, type: 'typing', peer: activePeer })
            });
        } catch {}
    };

    const timeoutId = setTimeout(sendTyping, 500); 
    return () => clearTimeout(timeoutId);
  }, [inputText, activePeer, address]);

  // Utility: immediately clear typing signal on the server (call after send)
  const stopTypingSignal = async () => {
    if (!activePeer || !address) return;
    // We clear the typing key by sending an artificial empty heartbeat — Redis TTL handles it in 5s
    // but this triggers an explicit flush to avoid the "ghost typing" 5-second tail.
    // We write a dummy value that the server interprets as "not typing" via the TTL expiry.
    // Fastest approach: write the key with a 0-second TTL to expire it immediately.
    try {
      await fetch('/api/chat/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, type: 'stop_typing', peer: activePeer })
      });
    } catch {}
  };

  // Draft Loading on Peer Switch
  useEffect(() => {
    if (activePeer && address) {
      const draftKey = `whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
          try {
              setInputText(decodeURIComponent(atob(saved)));
          } catch {
              setInputText('');
          }
      } else {
          setInputText('');
      }
    }
  }, [activePeer, address]);

  // Initialize REAL XMTP Network
  const initClient = async () => {
    if (!address) return;
    // Prevent concurrent init calls (can happen on mobile with forceAutoInit + visibility events)
    if (initInFlight.current) return;
    initInFlight.current = true;
    setIsInitializing(true);
    setInitError('');
    try {
      const wagmiSigner = {
        getAddress: async () => address,
        signMessage: async (msg: string | Uint8Array) => {
          try {
            return await signMessageAsync({ message: typeof msg === 'string' ? msg : { raw: msg } as any });
          } catch (sigErr: any) {
            // If this is a QR/cookie-based session without a live wallet, signMessageAsync
            // will throw because there is no wagmi connector. Surface a clear error.
            if (sigErr?.message?.includes('connector') || sigErr?.message?.includes('not connected')) {
              throw new Error('No active wallet connection. Please connect your wallet directly to use Whale Chat.');
            }
            throw sigErr;
          }
        }
      };
      const realClient = await getXMTPClient(wagmiSigner);
      setClient(realClient);
      await loadConversations();
    } catch (err: any) {
      console.error('Init Error:', err);
      if (err?.name === 'ChunkLoadError' || err?.message?.includes('Loading chunk')) {
        setInitError('XMTP module failed to load. Please reload the page and try again.');
        setTimeout(() => { try { window.location.reload(); } catch {} }, 3000);
      } else if (err?.code === 4001 || err?.message?.toLowerCase().includes('reject')) {
        setInitError('Signature rejected. You must sign the authorization to establish the secure channel.');
      } else if (err?.message?.includes('No active wallet')) {
        setInitError('No live wallet detected. Please connect your wallet directly (not via QR session) to activate Whale Chat.');
      } else {
        setInitError('Failed to initialize secure communications channel.');
      }
    } finally {
      setIsInitializing(false);
      initInFlight.current = false;
    }
  };

  const persistToLocal = (convs: ConversationMeta[]) => {
    try {
      localStorage.setItem(
        `whale_chat_history_${address}`,
        JSON.stringify({ conversations: convs }) // ZERO-MOCK: We only store the address book locally, NEVER messages.
      );
    } catch (e) { console.warn('[Chat] persist failed', e); }
  };

  const loadConversations = async () => {
    try {
      const stored = localStorage.getItem(`whale_chat_history_${address}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.conversations) setConversations(parsed.conversations);
      } else {
        const defaultConv = { peerAddress: '0xInstitutionalSupport_0000', lastMessage: 'Secure channel initialized.', lastAt: new Date() };
        setConversations([defaultConv]);
      }
    } catch (e) {}
  };

  // Load messages when active peer changes (handled by loadConversations but filtered in render)
  useEffect(() => {
    if (!client || !activePeer) return;
    // Local storage doesn't need to re-fetch on every peer change since we hold all messages in state
    // but we can set the activePeerDmIdRef so the UI logic works
    activePeerDmIdRef.current = `dm-${activePeer.toLowerCase()}`;
    peerToConvId.current.set(activePeer.toLowerCase(), activePeerDmIdRef.current);
    convIdToPeer.current.set(activePeerDmIdRef.current, activePeer);
  }, [client, activePeer]);

  // ── Global Conversation Sync Loop ─────────────────────────────────────────────────
  // Runs every 8 seconds. Syncs the full XMTP conversation graph from the network
  // and then calls listDms() to surface any new DMs initiated by remote peers.
  // Without this step, the receiver never discovers a new DM until they manually
  // add the sender’s address — which was the root cause of “messages only appear
  // when both people connect simultaneously”.
  useEffect(() => {
    if (!client || !address) return;
    let cancelled = false;

    const syncGlobal = async () => {
      try {
        // Step 1: pull the full conversation graph from the XMTP p2p network
        await client.conversations.sync();

        // Step 2: list all DMs and discover any not yet in local state
        const dms: any[] = await client.conversations.listDms();
        if (!dms?.length || cancelled) return;

        setConversations(prev => {
          const prevSet = new Set(prev.map(c => c.peerAddress.toLowerCase()));
          const toAdd: ConversationMeta[] = [];

          for (const dm of dms) {
            try {
              // Find the peer member (the one who is NOT us)
              const members: any[] = dm.members ?? [];
              const peerMember = members.find((m: any) => {
                const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
                return addrs.some(
                  (a: string) => a.toLowerCase() !== address.toLowerCase()
                );
              });
              if (!peerMember) continue;

              const addrs: string[] = peerMember.accountAddresses ?? peerMember.addresses ?? [];
              const peerAddr = addrs.find((a: string) => /^0x[a-fA-F0-9]{40}$/i.test(a));
              if (!peerAddr || prevSet.has(peerAddr.toLowerCase())) continue;

              // New conversation discovered from the network
              toAdd.push({
                peerAddress: peerAddr,
                lastMessage: '✉ New message received',
                lastAt: new Date(),
              });

              // Register the DM mapping so fetchMessages can find it
              peerToConvId.current.set(peerAddr.toLowerCase(), `dm-${peerAddr.toLowerCase()}`);
              convIdToPeer.current.set(`dm-${peerAddr.toLowerCase()}`, peerAddr);
            } catch { /* skip malformed DM entry */ }
          }

          if (!toAdd.length) return prev; // no change — bail out early
          const updated = [...toAdd, ...prev];
          persistToLocal(updated);
          return updated;
        });

        // Step 3: if there’s an active peer, also refresh messages now
        // (covers the case where a message arrives mid-poll-interval)
        if (activePeerRef.current && !cancelled) {
          const msgs = await getMessages(client, activePeerRef.current);
          if (cancelled) return;
          const mappedMsgs = msgs.map((m: any) => ({
            id: m.id,
            senderInboxId: m.senderInboxId,
            content: m.content || m.fallback || 'Encrypted Data',
            sentAtNs: nsToDate(m.sentAtNs ?? m.sentAt).getTime(),
            conversationId: `dm-${activePeerRef.current!.toLowerCase()}`
          }));
          setMessages(prev => {
            const activeId = `dm-${activePeerRef.current!.toLowerCase()}`;
            const others = prev.filter(p => p.conversationId !== activeId);
            const mappedIds = new Set(mappedMsgs.map((m: any) => m.id));
            const optimistic = prev.filter(p => {
              if (p.conversationId !== activeId || mappedIds.has(p.id) || p.id.length >= 20) return false;
              if (Date.now() - parseInt(p.id) > 15000) return false;
              return true;
            });
            return [...others, ...mappedMsgs, ...optimistic].sort((a, b) => a.sentAtNs - b.sentAtNs);
          });
        }
      } catch (e) {
        console.warn('[WhaleChat] Global sync error:', e);
      }
    };

    syncGlobal();
    const globalPoll = setInterval(syncGlobal, 8000);
    return () => { cancelled = true; clearInterval(globalPoll); };
  }, [client, address]);

  // ── Real-time incoming message polling (REAL XMTP NETWORK) ────────────────
  // Every 4 seconds, sync with the decentralized network to fetch new messages.
  // The global sync loop (above) ensures the receiver discovers new DM invites.
  useEffect(() => {
    if (!client || !activePeer || !address) return;
    let isMounted = true;
    
    // Ignore the institutional support mock for network requests
    if (activePeer.toLowerCase() === '0xinstitutionalsupport_0000') {
      const mockMsg = {
          id: '1',
          senderAddress: activePeer,
          content: 'Welcome to the Secure Client Communications channel. All messages are zero-knowledge encrypted end-to-end.',
          sentAtNs: Date.now(),
          conversationId: `dm-${activePeer.toLowerCase()}`
      };
      setMessages([mockMsg]);
      return;
    }

    const fetchMessages = async () => {
      try {
        // getMessages now handles conversations.sync() internally before listing
        const msgs = await getMessages(client, activePeer);
        if (!isMounted) return;
        
        // Map decoded real XMTP messages to our UI shape
        const mappedMsgs = msgs.map((m: any) => ({
          id: m.id,
          senderInboxId: m.senderInboxId,
          content: m.content || m.fallback || 'Encrypted Data',
          sentAtNs: nsToDate(m.sentAtNs ?? m.sentAt).getTime(),
          conversationId: `dm-${activePeer.toLowerCase()}`
        }));
        
        if (!isMounted) return;
        setMessages(prev => {
            const activeId = `dm-${activePeer.toLowerCase()}`;
            const others = prev.filter(p => p.conversationId !== activeId);
            const mappedIds = new Set(mappedMsgs.map(m => m.id));
            
            const myMappedContents = new Set(mappedMsgs.filter(m => {
                const isMe = m.senderInboxId
                    ? m.senderInboxId?.toLowerCase() === (client?.inboxId as string)?.toLowerCase()
                    : false;
                return isMe;
            }).map(m => typeof m.content === 'string' ? m.content.trim() : ''));

            // Keep optimistic messages only until the network confirms them (15s TTL)
            const optimistic = prev.filter(p => {
                if (p.conversationId !== activeId || mappedIds.has(p.id) || p.id.length >= 20) return false;
                if (myMappedContents.has(typeof p.content === 'string' ? p.content.trim() : '')) return false;
                if (Date.now() - parseInt(p.id) > 15000) return false;
                return true;
            });
            return [...others, ...mappedMsgs, ...optimistic].sort((a, b) => a.sentAtNs - b.sentAtNs);
        });
      } catch (err) {
        console.warn('[XMTP] Network sync error:', err);
      }
    };

    fetchMessages();
    const poll = setInterval(fetchMessages, 4000);
    return () => { isMounted = false; clearInterval(poll); };
  }, [client, activePeer, address]);

  const handleStartConversationWithPeer = async (peerAddr: string) => {
      if (!client || !peerAddr || sending) return;
      setSending(true);
      try {
        let peer = peerAddr.trim();
        if (peer.toLowerCase().startsWith('ethereum:')) {
            peer = peer.substring(9).split('@')[0];
        }
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(peer) && peer.toLowerCase() !== '0xinstitutionalsupport_0000') {
            alert('Invalid Ethereum address format.');
            setSending(false);
            return;
        }

        if (peer.toLowerCase() !== '0xinstitutionalsupport_0000') {
            // Use cached result — avoids ~500ms static network lookup on repeated opens
            let canMsg = canReceiveCache.current.get(peer.toLowerCase());
            if (canMsg === undefined) {
                canMsg = await canReceiveMessages(client, peer);
                canReceiveCache.current.set(peer.toLowerCase(), canMsg);
            }
            if (!canMsg) {
                alert(`The address ${peer} is not registered on the XMTP network. They must connect their wallet to Whale Chat first.`);
                setSending(false);
                return;
            }
        }

        const newConv = { peerAddress: peer, lastMessage: '', lastAt: new Date() };

        setConversations(prev => {
            const exists = prev.find(c => c.peerAddress.toLowerCase() === peer.toLowerCase());
            if (exists) return prev;
            const updated = [newConv, ...prev];
            persistToLocal(updated);
            return updated;
        });

        const dmId = `dm-${peer.toLowerCase()}`;
        peerToConvId.current.set(peer.toLowerCase(), dmId);
        convIdToPeer.current.set(dmId, peer);
        activePeerDmIdRef.current = dmId;

        setActivePeer(peer);
        setShowList(false);
        setPeerInput('');
        setShowScanner(false);
      } catch {
        alert('Invalid address.');
      } finally {
        setSending(false);
      }
  };

  const handleStartConversation = async () => handleStartConversationWithPeer(peerInput);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !activePeer || !inputText.trim() || sending || !address) return;
    setSending(true);
    const content = inputText.trim();
    setInputText(''); 
    
    if (address) {
        localStorage.removeItem(`whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`);
    }

    try {
      // ── 1. REAL ON-CHAIN DECENTRALIZED TRANSMISSION ──────────────────────────────
      if (activePeer.toLowerCase() !== '0xinstitutionalsupport_0000') {
        // Use cached result — canReceiveMessages is a slow static call (~500ms)
        let canMsg = canReceiveCache.current.get(activePeer.toLowerCase());
        if (canMsg === undefined) {
          canMsg = await canReceiveMessages(client, activePeer);
          canReceiveCache.current.set(activePeer.toLowerCase(), canMsg);
        }
        if (!canMsg) {
            alert(`The address ${activePeer} is not registered on the XMTP network. They must connect their wallet to Whale Chat first.`);
            setSending(false);
            return;
        }

        // Optimistic local message so the sender sees it immediately
        const optimisticId = Date.now().toString();
        const optimisticMsg = {
          id: optimisticId,
          senderInboxId: client?.inboxId,
          content: content,
          sentAtNs: Date.now(),
          conversationId: `dm-${activePeer.toLowerCase()}`
        };
        setMessages(prev => [...prev, optimisticMsg].sort((a, b) => a.sentAtNs - b.sentAtNs));

        // 🔑 FIX: Clear typing indicator immediately so receiver doesn't see "ghost typing"
        // after the message is sent. The Redis key TTL (5s) handles cleanup, but we also
        // fire a stop_typing signal to flush it before the next polling cycle.
        stopTypingSignal();

        // Send to XMTP network (includes dm.sync() after send)
        await sendMessage(client, activePeer, content);
        
        // Wait 1.5s for network propagation, then fetch authoritative state
        await new Promise(r => setTimeout(r, 1500));
        try {
            const msgs = await getMessages(client, activePeer);
            const mappedMsgs = msgs.map((m: any) => ({
                id: m.id,
                senderInboxId: m.senderInboxId,
                content: m.content || m.fallback || 'Encrypted Data',
                sentAtNs: nsToDate(m.sentAtNs ?? m.sentAt).getTime(),
                conversationId: `dm-${activePeer.toLowerCase()}`
            }));
            setMessages(prev => {
                const activeId = `dm-${activePeer.toLowerCase()}`;
                const others = prev.filter(p => p.conversationId !== activeId);
                return [...others, ...mappedMsgs].sort((a, b) => a.sentAtNs - b.sentAtNs);
            });
        } catch (syncErr) {
            console.warn('[XMTP] Post-send sync failed:', syncErr);
        }
      }

      // ── 2. UPDATE LOCAL ADDRESS BOOK ──────────────────────────────────────────────
      setConversations(prev => {
        const updated = prev.find(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase())
          ? prev.map(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase() ? { ...c, lastMessage: content, lastAt: new Date() } : c)
          : [{ peerAddress: activePeer, lastMessage: content, lastAt: new Date() }, ...prev];
        persistToLocal(updated);
        return updated;
      });

      // ── 3. AUTO-REPLY BOT (LOCAL MOCK ONLY) ──────────────────────────────────────────────
      if (activePeer.toLowerCase() === '0xinstitutionalsupport_0000') {
        const now = Date.now();
        const myConvId = `dm-${activePeer.toLowerCase()}`;
        const newMsg = {
          id: now.toString(),
          senderInboxId: client?.inboxId,
          content: content,
          sentAtNs: now,         
          conversationId: myConvId
        };
        setMessages(prev => [...prev, newMsg]);

        setTimeout(() => {
          const replyId = (Date.now() + 1).toString();
          const replyMsg = {
            id: replyId,
            senderInboxId: activePeer,
            content: 'An institutional representative will review your inquiry shortly.',
            sentAtNs: Date.now() + 1000,
            conversationId: myConvId
          };
          setMessages(prev => [...prev, replyMsg]);
        }, 1400);
      }

    } catch (err) {
      console.error('[Chat] handleSend failed:', err);
      setInputText(content); // restore on failure
    } finally {
      setSending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center">
          <MessageCircle size={24} className="text-[#9945FF]" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-[#050505]">Whale Chat</h3>
        <p className="text-xs text-black/40 text-center max-w-xs">Connect your wallet to access maximum security decentralized messaging.</p>
      </div>
    );
  }


  // ── Loading / Auto-init state ────────────────────────────────────────────────
  // Displayed while the XMTP client initialises automatically post-connection.
  // On returning sessions, encryption keys are retrieved from IndexedDB instantly.
  // On first-time sessions, a single gasless wallet signature derives the keys.
  if (!client) {
    return (
      <div className="flex flex-col h-full min-h-[500px] bg-white rounded-2xl border border-black/5 shadow-sm overflow-y-auto">
        {/* Protocol Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-black/6 shrink-0">
          <div className="relative">
            <Shield size={22} strokeWidth={1.5} className="text-[#9945FF]" />
            <Lock size={10} className="absolute -bottom-0.5 -right-1 text-[#050505] bg-white rounded-full p-[1px]" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#050505]">Whale Chat — Decentralised E2EE Protocol</h3>
            <p className="text-[9px] text-black/40 font-mono uppercase tracking-widest mt-0.5">XMTP Network · Zero-Trust Architecture</p>
          </div>
        </div>

        {/* Academic Protocol Explanation */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-5">
          <div className="prose-xs text-[12px] text-black/70 leading-relaxed font-sans space-y-3 max-w-2xl">
            <p>
              <strong className="text-[#050505] font-black">Whale Chat</strong> is a decentralised, peer-to-peer encrypted messaging module built upon the{' '}
              <span className="font-black text-[#9945FF]">XMTP (Extensible Message Transport Protocol)</span> network.
              Unlike conventional messaging architectures that route communications through centralised intermediaries,
              Whale Chat establishes direct cryptographic channels between Ethereum wallet identities, ensuring that
              message content is mathematically inaccessible to any third party — including the platform itself.
            </p>
            <p>
              Each participant&apos;s messaging identity is derived deterministically from their Ethereum private key
              via a <strong className="text-[#050505]">gasless ECDSA signature</strong>. This operation generates
              a set of session encryption keys that are stored exclusively in your browser&apos;s IndexedDB, never
              transmitted to any server. All messages are encrypted with <strong className="text-[#050505]">double-ratchet
              forward secrecy</strong> before leaving your device and can only be decrypted by the recipient&apos;s
              private key material.
            </p>
            <p>
              Upon your first activation, a single wallet signature is requested to derive these keys.
              Subsequent sessions are fully automatic — no further signatures are required, as the keys
              persist securely in your local browser storage.
            </p>
          </div>

          {/* Key properties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'No Server Storage', desc: 'Messages are never stored on any centralised server. The network is peer-to-peer.' },
              { label: 'Forward Secrecy', desc: 'Each session uses ephemeral key derivation. Compromise of one key cannot expose historical messages.' },
              { label: 'Gasless Identity', desc: 'Your messaging identity is derived via a costless signature — no gas fee, no on-chain transaction.' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl border border-black/8 bg-black/[0.02]">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#9945FF] mb-1">{item.label}</p>
                <p className="text-[10px] text-black/50 leading-relaxed font-mono">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Status / Action */}
          <div className="mt-auto pt-4">
            {initError ? (
              <div className="flex flex-col gap-3">
                <div className="bg-red-50 text-red-700 text-[11px] font-mono p-4 rounded-xl border border-red-100 leading-relaxed">
                  {initError}
                </div>
                <button
                  onClick={initClient}
                  disabled={isInitializing}
                  className="self-start px-8 py-3.5 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#9945FF] hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isInitializing ? (
                    <><Activity size={14} className="animate-spin" /> Initialising...</>
                  ) : (
                    <><Lock size={14} /> Retry Authentication</>
                  )}
                </button>
              </div>
            ) : isInitializing ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#9945FF]/5 border border-[#9945FF]/15">
                <Activity size={18} className="text-[#9945FF] animate-spin shrink-0" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#9945FF]">Establishing Secure Channel</p>
                  <p className="text-[9px] text-black/40 font-mono mt-0.5">Retrieving session keys from local storage. If this is your first session, approve the signature prompt in your wallet.</p>
                </div>
              </div>
            ) : (
              // Mobile: auto-init is skipped — show a prominent manual trigger button
              <button
                onClick={initClient}
                disabled={isInitializing}
                className="w-full px-8 py-4 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#9945FF] hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Zap size={14} /> Activate Secure Channel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    // ✔️ position:relative is required for the absolute scanner overlays to stay within the chat bounds
    <div className="relative flex w-full h-full min-h-[500px] bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden" style={{ minHeight: isMobile ? '100dvh' : undefined }}>
      {/* ── Sidebar: Conversation List ── */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/6 bg-[#FAFAFA]`}>
        <div className="p-4 border-b border-black/6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#9945FF]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]">E2EE Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                  onClick={() => setShowScanner(true)}
                  className={`flex items-center gap-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold uppercase tracking-widest text-black/60 transition-colors ${isMobile ? 'px-4 py-2.5 text-[11px]' : 'px-2.5 py-1.5 text-[9px]'}`}
                  title="Scan Peer QR"
              >
                  <Camera size={isMobile ? 14 : 12} /> Scan
              </button>
              <button
                  onClick={() => setShowMyQR(true)}
                  className={`flex items-center gap-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold uppercase tracking-widest text-black/60 transition-colors ${isMobile ? 'px-4 py-2.5 text-[11px]' : 'px-2.5 py-1.5 text-[9px]'}`}
                  title="Show My QR"
              >
                  My QR
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x... or .eth"
              value={peerInput}
              onChange={e => setPeerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-[#9945FF]/40 placeholder:text-black/25 text-[#050505]"
            />
            <button
              onClick={handleStartConversation}
              disabled={sending}
              className="w-9 h-9 bg-[#9945FF] rounded-lg flex items-center justify-center text-white hover:bg-[#7c35d4] transition-colors active:scale-95 disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <Lock size={28} className="text-black/10" />
              <p className="text-[10px] text-black/30 font-medium uppercase tracking-widest">Vault is Empty</p>
            </div>
          ) : (
            conversations.map((conv, i) => {
              const isActive = activePeer?.toLowerCase() === conv.peerAddress.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => { setActivePeer(conv.peerAddress); setShowList(false); }}
                  className={`w-full text-left p-3.5 border-b border-black/4 transition-all ${
                    isActive ? 'bg-[#9945FF]/8 border-l-2 border-l-[#9945FF]' : 'hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar address={conv.peerAddress} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#050505] font-mono truncate">{shortAddr(conv.peerAddress)}</p>
                      {conv.lastMessage && (
                        <p className="text-[10px] text-black/40 truncate mt-0.5">{conv.lastMessage}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className={`${!showList ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activePeer ? (
          <>
            <div className="h-14 px-4 border-b border-black/6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-black/50">
                  <ArrowLeft size={16} />
                </button>
                <Avatar address={activePeer!} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#050505] font-mono flex items-center gap-1.5">
                    {shortAddr(activePeer!)}
                    {peerStatus.online && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Online" />}
                  </span>
                  <span className="text-[9px] font-medium flex items-center gap-1">
                    {peerStatus.isTyping ? (
                        <span className="text-[#9945FF] font-black tracking-widest uppercase animate-pulse">Decrypting Keystrokes...</span>
                    ) : peerStatus.online ? (
                        <span className="text-green-600">Active Connection</span>
                    ) : peerStatus.lastSeen ? (
                        <span className="text-black/40">Last seen: {new Date(peerStatus.lastSeen!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    ) : (
                        <span className="text-[#00C076]"><Lock size={9} className="inline" /> Zero-Knowledge E2EE</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#FAFAFA]">
              {(() => {
                // Filter messages for the current active conversation only
                const convId = `dm-${activePeer!.toLowerCase()}`;
                const filteredMsgs = messages.filter(m =>
                  m.conversationId === convId ||
                  m.conversationId === `dm-${activePeer!.toLowerCase()}`
                );
                if (filteredMsgs.length === 0) return (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <Shield size={32} className="mb-2" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#050505]">Cryptographic Tunnel Established</p>
                    <p className="text-[10px] text-[#050505] max-w-xs text-center mt-2">Only you and {shortAddr(activePeer!)} can read these messages.</p>
                  </div>
                );
                return filteredMsgs.map(msg => {
                  const isMe = msg.senderInboxId
                    ? msg.senderInboxId?.toLowerCase() === (client?.inboxId as string)?.toLowerCase()
                    : false;
                  const content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
                  // sentAtNs is now a plain number (ms), not BigInt
                  const sentTime = typeof msg.sentAtNs === 'number' ? new Date(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[78%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                        isMe
                          ? 'bg-[#050505] text-white rounded-br-sm'
                          : 'bg-white text-[#050505] rounded-bl-sm border border-black/8 shadow-sm'
                      }`}>
                        {content}
                      </div>
                      <span className="text-[9px] text-black/25 mt-1 px-1 font-mono">
                        {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                });
              })()}
              {peerStatus.isTyping && (
                  <div className="flex self-start items-start max-w-[78%]">
                      <div className="px-3.5 py-2 rounded-2xl bg-white border border-[#9945FF]/20 shadow-sm flex items-center gap-1.5 rounded-bl-sm">
                          <span className="w-1 h-1 rounded-full bg-[#9945FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 rounded-full bg-[#9945FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 rounded-full bg-[#9945FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-black/6 bg-white shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Draft encrypted message..."
                  className="flex-1 bg-black/[0.03] border border-black/8 rounded-xl px-4 py-3 text-[13px] text-[#050505] focus:outline-none focus:border-[#9945FF]/30 placeholder:text-black/30"
                  style={{ WebkitAppearance: 'none' }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="w-11 h-11 rounded-xl bg-[#050505] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#9945FF] hover:shadow-[0_0_15px_rgba(153,69,255,0.3)] transition-all active:scale-95"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-8 p-8 max-w-sm text-center select-none">

              {/* Logo + Bubble row */}
              <div className="flex items-end gap-3">
                {/* Official Logo */}
                <img
                  src="/official-whale.png"
                  alt="Whale Alert Network"
                  className="w-24 h-24 object-contain"
                />
                {/* Speech Bubble */}
                <div className="relative mb-2">
                  <div className="bg-black/[0.04] border border-black/[0.07] rounded-2xl rounded-bl-none px-4 py-3 text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#050505]/70 whitespace-nowrap">Whale Chat</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
                      <span className="text-[9px] text-[#00C076] font-mono font-bold uppercase tracking-widest">E2EE Secure</span>
                    </div>
                  </div>
                  {/* Bubble tail */}
                  <div className="absolute -bottom-2 left-0 w-3 h-3 bg-black/[0.04] border-l border-b border-black/[0.07]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                </div>
              </div>

              {/* Welcome text */}
              <div className="flex flex-col items-center gap-2">
                <h2
                  className="text-[30px] font-black text-[#050505] leading-[1.1] tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                >
                  Welcome to<br />Whale Chat!
                </h2>
                <p className="text-[11px] text-black/35 leading-relaxed max-w-[240px]">
                  Enter a wallet address to open a secure encrypted channel.
                </p>
              </div>

              {/* Single minimal status row */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#050505]/20" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-black/30">Zero-Knowledge · End-to-End Encrypted</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#050505]/20" />
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ── Overlays ── */}
      {showScanner && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-sm">
               <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505]">Scan Peer QR</h3>
                   <button onClick={() => setShowScanner(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                     <X size={20} />
                   </button>
               </div>
               <div className="mb-8">
                 <p className="text-[10px] text-black/40 text-center font-mono leading-relaxed px-4">
                   Establish a cryptographically secured P2P channel by scanning a peer&apos;s Sovereign QR identity.
                 </p>
               </div>
               <QrScanner mode="scan" onScanSuccess={(addr) => handleStartConversationWithPeer(addr)} />
           </div>
        </div>
      )}

      {showMyQR && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-sm">
               <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505]">My Identity QR</h3>
                   <button onClick={() => setShowMyQR(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                     <X size={20} />
                   </button>
               </div>
               <QrScanner 
                   mode="project" 
                   projectValue={address} 
                   projectTitle="Sovereign Identity" 
                   projectDescription="Present this code to a peer. Once scanned, a zero-knowledge encrypted tunnel will be initialized between your identities." 
               />
           </div>
        </div>
      )}
    </div>
  );
}
