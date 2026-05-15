"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';

import { useSignMessage, useReconnect } from 'wagmi';

import { useAppKit } from '@reown/appkit/react';
import { getXMTPClient, canReceiveMessages, sendMessage, getMessages, destroyXMTPClient, nsToDate, discoverNewPeers } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/dashboard/QrScanner';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
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
  const { address, isConnected, isSovereignHandshake, isChecking, connector, isZkVerified } = useSovereignAccount();
  const { signMessageAsync } = useSignMessage();
  const { reconnect } = useReconnect();
  const { open: openAppKit } = useAppKit();

  // MASTER RECOVERY: If wallet is connected but connector is missing (common on mobile redirects)
  useEffect(() => {
    if (isConnected && !connector && !isSovereignHandshake) {
        console.warn('[WhaleChat] Zombie session detected — attempting silent reconnection.');
        reconnect();
    }
  }, [isConnected, connector, isSovereignHandshake, reconnect]);

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

  // ── Audio recording state ──────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Playing audio messages ─────────────────────────────────────────────────
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activePeerRef = useRef<string | null>(null);
  const activePeerDmIdRef = useRef<string | null>(null);
  const peerToConvId = useRef<Map<string, string>>(new Map());
  const convIdToPeer = useRef<Map<string, string>>(new Map());
  // Cache canReceiveMessages result per address to skip redundant network lookups
  const canReceiveCache = useRef<Map<string, boolean>>(new Map());
  // Track if initClient is already in-flight to prevent double-calls on mobile
  const initInFlight = useRef(false);
  // Persistent known-peers set — survives across sync cycles (fixes mobile-to-mobile)
  const knownPeersRef = useRef<Set<string>>(new Set());

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // MASTER-FIX: Auto-scroll on resize (keyboard open/close) to maintain stability
  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return;
    const handleResize = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };
    window.addEventListener('resize', handleResize);
    // Also track visualViewport if available for more precision
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

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

  // AUTO-INITIALIZE: When wallet is connected and XMTP not yet started, auto-init.
  // XMTP v3 stores session keys in IndexedDB — after the first sign,
  // subsequent loads are silent (no wallet prompt needed).
  // We always attempt auto-init on both desktop and mobile. If WASM fails on mobile,
  // the error boundary surfaces a manual "Retry" button. This is better than
  // silently blocking mobile users from ever seeing the Activate button.

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

  // ── Voice Recording: Hold-to-Record ─────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (isRecording || !activePeer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length === 0) return;

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
            console.warn('[Voice] Recording too short, ignoring.');
            setIsRecording(false);
            setRecordingSeconds(0);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          // XMTP Limit Check: Typical message limit is 1MB. 
          // Base64 overhead is ~33%. A 750KB blob is roughly the safe limit.
          if (dataUrl.length > 1024 * 1024) {
              setInitError('Voice message is too long for the secure P2P network. Please record a shorter message (under 30s).');
              setIsRecording(false);
              setRecordingSeconds(0);
              return;
          }

          const audioMsg = `__AUDIO__${dataUrl}`;
          if (client && activePeer) {
            const optimisticId = `optimistic-${Date.now()}`;
            setMessages(prev => [...prev, {
              id: optimisticId,
              senderInboxId: client?.inboxId || '',
              content: audioMsg,
              sentAtNs: Date.now(),
              conversationId: `dm-${activePeer.toLowerCase()}`
            }]);
            try { 
                await sendMessage(client, activePeer, audioMsg); 
                console.log('[Voice] P2P Audio transmission successful.');
            } catch (sendErr: any) {
                console.error('[Voice] P2P Send Failed:', sendErr?.message);
                setMessages(prev => prev.filter(m => m.id !== optimisticId));
                setInitError('Failed to transmit secure voice message. Check your connection.');
            }
          }
        };
        reader.readAsDataURL(blob);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);
      };

      recorder.start(100); // collect chunks every 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (err) {
      console.warn('[Voice] Microphone access denied or unavailable:', err);
    }
  }, [isRecording, activePeer, client]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    try { mediaRecorderRef.current.stop(); } catch {}
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  }, [isRecording]);

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

  const loadConversations = useCallback(async () => {
    try {
      const stored = localStorage.getItem(`whale_chat_history_${address}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.conversations) setConversations(parsed.conversations);
      } else {
        setConversations([]);
      }
    } catch (e) {}
  }, [address]);

  // getDeterministicSeed removed as it produces invalid XMTP signatures.
  // The XMTP SDK automatically caches session keys in IndexedDB.

  // Initialize REAL XMTP Network
  const initClient = useCallback(async () => {
    if (!address) return;
    if (initInFlight.current) return;
    initInFlight.current = true;
    setIsInitializing(true);
    setInitError('');
    try {
      // ── Step 1: Use standard wagmi signer ────────────────
      // XMTP SDK automatically caches keys in IndexedDB, so returning users are not prompted.
      
      const wagmiSigner = {
        getAddress: async () => address as string,
        signMessage: async (msg: string | Uint8Array) => {
          try {
            return await signMessageAsync({ message: typeof msg === 'string' ? msg : { raw: msg } as any });
          } catch (sigErr: any) {
            const msg = sigErr?.message || '';
            if (msg.includes('connector') || msg.includes('not connected') || msg.includes('No connector') || msg.includes('signMessage')) {
                const hasVault = typeof window !== 'undefined' && !!localStorage.getItem('sovereign_vault');
                if (isSovereignHandshake && !hasVault) {
                  console.warn('[WhaleChat:Mobile] Signature requested on linked session without Vault.');
                }
                throw new Error('No active wallet connection detected. Please ensure your wallet app is open and connected to this terminal.');
            }
            throw sigErr;
          }
        }
      };

      // ── Step 2: Initialize client (Direct Execution) ───────────────
      const realClient = await getXMTPClient(wagmiSigner);
      setClient(realClient);
      await loadConversations();
    } catch (err: any) {
      console.error('[WhaleChat] Init Error:', err);
      
      const errorMsg = err?.message || '';
      
      if (err?.name === 'ChunkLoadError' || errorMsg.includes('Loading chunk')) {
        setInitError('Whale Alert Network module failed to load. Please check your network connection and reload the terminal.');
      } else if (err?.code === 4001 || errorMsg.toLowerCase().includes('reject')) {
        setInitError('Identity authorization rejected. You must approve the Whale Chat signature to proceed.');
      } else if (errorMsg.includes('No active wallet') || errorMsg.includes('connector') || errorMsg.includes('signMessage') || errorMsg.toLowerCase().includes('unknown signer')) {
        if (isSovereignHandshake) {
           setInitError('Whale identity not yet synchronized from desktop. Please keep this browser open while the desktop terminal finishes the handshake.');
        } else {
           setInitError('Active wallet connection lost or not detected. Please ensure your wallet app is open and connected directly to this browser.');
        }
      } else if (errorMsg.includes('WASM') || errorMsg.includes('wasm')) {
        setInitError('Cryptographic Whale WASM engine failure. This is often caused by browser security settings or incompatible device architectures.');
      } else {
        setInitError(`Whale Alert Network handshake failure: ${errorMsg.slice(0, 80) || 'Unknown Protocol Error'}. Please retry.`);
      }
    } finally {
      setIsInitializing(false);
      initInFlight.current = false;
    }
  }, [address, isMobile, signMessageAsync, isSovereignHandshake, loadConversations]);

  useEffect(() => {
    // Aggressive Auto-Init: Trigger for all connected users.
    if (isConnected && address && !client && !initInFlight.current && !initError) {
      const hasVault = typeof localStorage !== 'undefined' && !!localStorage.getItem("sovereign_vault_v1");
      const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      // On mobile, auto-init can trigger unwanted wallet app switches if the keys aren't in IndexedDB.
      // However, if forceAutoInit is true or it's a handshake session, we proceed.
      // For returning users with IndexedDB keys, the auto-init is completely silent!
      if (hasVault || !isTouch || forceAutoInit || isSovereignHandshake) {
        initClient();
      }
    }
  }, [isConnected, address, client, initError, initClient, forceAutoInit, isSovereignHandshake]);

  const persistToLocal = (convs: ConversationMeta[]) => {
    try {
      localStorage.setItem(
        `whale_chat_history_${address}`,
        JSON.stringify({ conversations: convs }) // ZERO-MOCK: We only store the address book locally, NEVER messages.
      );
    } catch (e) { console.warn('[Chat] persist failed', e); }
  };

  const syncToAddressBook = async (peerAddr: string) => {
    try {
      // Graceful upsert to user's address book
      await fetch('/api/wallet/address-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Chat: ${peerAddr.slice(0, 6)}...${peerAddr.slice(-4)}`,
          address: peerAddr,
          label: 'Whale Chat',
          isFavorite: false
        })
      });
    } catch (err) {
      console.error('[WhaleChat] Failed to sync address book:', err);
    }
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

  // ── Global Conversation Sync Loop ──────────────────────────────────────────────────────
  // Runs every 6 seconds. Uses discoverNewPeers() to find incoming DMs
  // initiated by remote peers without needing the receiver to manually add them.
  // Also refreshes active-peer messages on every cycle.
  // FIX: knownPeersRef is a persistent ref — not rebuilt on every render — so
  // newly discovered peers are remembered across cycles (fixes mobile-to-mobile).
  useEffect(() => {
    if (!client || !address) return;
    let cancelled = false;

    // Seed the persistent ref with already-known conversations (idempotent)
    conversations.forEach(c => knownPeersRef.current.add(c.peerAddress.toLowerCase()));

    const syncGlobal = async () => {
      try {
        // Discover new peers from the XMTP network (uses persistent ref, not stale snapshot)
        const newPeerAddrs = await discoverNewPeers(client, address, knownPeersRef.current);

        if (newPeerAddrs.length > 0 && !cancelled) {
          setConversations(prev => {
            const prevSet = new Set(prev.map(c => c.peerAddress.toLowerCase()));
            const toAdd: ConversationMeta[] = newPeerAddrs
              .filter(a => !prevSet.has(a.toLowerCase()))
              .map(a => ({
                peerAddress: a,
                lastMessage: '✉ New message received',
                lastAt: new Date(),
              }));

            if (!toAdd.length) return prev;
            
            // Auto-sync discovered peers to Address Book
            toAdd.forEach(c => syncToAddressBook(c.peerAddress));
            
            const updated = [...toAdd, ...prev];
            persistToLocal(updated);
            return updated;
          });
        }

        // Also refresh active-peer messages mid-interval
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
    const globalPoll = setInterval(syncGlobal, 6000);
    return () => { cancelled = true; clearInterval(globalPoll); };
  }, [client, address]);

  // ── Real-time incoming message polling (REAL XMTP NETWORK) ──────────────
  // Every 5 seconds, sync with the decentralized network to fetch new messages.
  // The global sync loop (above) ensures the receiver discovers new DM invites.
  // GUARD: isFetching prevents concurrent calls from stacking on slow networks.
  useEffect(() => {
    if (!client || !activePeer || !address) return;
    let isMounted = true;
    let isFetching = false;
    
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
      // Skip if a fetch is already in-flight (prevents stacking on slow network)
      if (isFetching || !isMounted) return;
      isFetching = true;
      try {
        // getMessages handles conversations.sync() internally before listing
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
      } finally {
        isFetching = false;
      }
    };

    fetchMessages();
    const poll = setInterval(fetchMessages, 5000);
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
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(peer)) {
            alert('Invalid Ethereum address format.');
            setSending(false);
            return;
        }

        if (peer) {
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
            
            // Auto-sync manual new chat to Address Book
            syncToAddressBook(peer);
            
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
          senderInboxId: client?.inboxId || '',
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
        // Fetch authoritative state immediately after send
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
        <h3 className="text-sm font-black uppercase tracking-widest text-[#050505]">Whale Chat</h3>
        <p className="text-xs text-black/40 text-center max-w-xs">Connect your wallet to access maximum security decentralized messaging.</p>
        <button onClick={() => openAppKit()} className="px-8 py-4 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl">Connect Wallet</button>
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
        {/* Minimalist Protocol Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5 bg-[#FAFAF8] shrink-0">
          <div className="flex items-center gap-3">
          </div>
          <div className="w-4" />
        </div>

        {/* Hero Institutional Section */}
        <div className="flex-1 px-8 py-16 flex flex-col items-center justify-center text-center gap-10">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {isInitializing ? (
              <div className="w-16 h-16 rounded-full border-2 border-black/5 border-t-black animate-spin" />
            ) : (
              <div className="w-48 h-48 rounded-full border border-black/5 flex flex-col items-center justify-center bg-white shadow-sm gap-4">
                <img src="/official-whale-monochrome.png" alt="Whale" className="w-16 h-16 opacity-80" />
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-black/20">Sensors Initialized</div>
              </div>
            )}
          </div>

          <div className="space-y-4 max-w-2xl">
            <h2 className="text-[#050505] text-[24px] sm:text-[32px] md:text-[44px] font-black uppercase tracking-tighter leading-tight">
                Whale Chat <br /> <span className="text-black/30">Secure Terminal.</span>
            </h2>
            <div className="w-12 h-px bg-black/10 mx-auto my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-xl mx-auto mb-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">01</span>
                <p className="text-[11px] font-black uppercase text-black/60">Connect Wallet</p>
                <p className="text-[10px] text-black/30 font-serif">Authorize browser session via AppKit.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">02</span>
                <p className={`text-[11px] font-black uppercase ${isZkVerified ? 'text-[#00C076]' : 'text-black/60'}`}>Whale Identity</p>
                <p className="text-[10px] text-black/30 font-serif">Sovereign identity verified via sensors.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">03</span>
                <p className="text-[11px] font-black uppercase text-black/60">Sensors Secured</p>
                <p className="text-[10px] text-black/30 font-serif">Persistent encryption across all devices.</p>
              </div>
            </div>

            <p className="text-[#050505]/40 text-[13px] md:text-[15px] font-serif leading-relaxed px-6 max-w-sm mx-auto text-center">
              Mathematical identity. Sovereign communication.
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-[#FAFAF8] p-8 md:p-12 border-t border-black/5 flex flex-col items-center">
          {initError ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-full bg-red-50 text-red-700 text-[12px] font-mono p-5 rounded-xl border border-red-100 text-center leading-relaxed">
                {initError}
              </div>
              
              {/* Expert UX: If the error is about a missing connector, offer to open the wallet modal */}
              {(initError.includes('wallet connection lost') || initError.includes('Connect your wallet') || initError.toLowerCase().includes('unknown signer')) ? (
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => openAppKit()}
                    className="w-full py-5 rounded-xl bg-[#050505] text-white text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
                  >
                    Reconnect Wallet
                  </button>
                  <button
                    onClick={() => { reconnect(); initClient(); }}
                    className="w-full py-4 rounded-xl bg-white border border-black/10 text-black/60 text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.02] transition-all"
                  >
                    Refresh Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={initClient}
                  disabled={isInitializing}
                  className="w-full py-5 rounded-xl bg-[#050505] text-white text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isInitializing ? (
                    <>Establish Tunnel...</>
                  ) : (
                    <>Retry Initialization</>
                  )}
                </button>
              )}
            </div>
          ) : isInitializing ? (
            <div className="flex flex-col items-center gap-5">
              <p className="text-[12px] text-black/40 font-mono uppercase tracking-[0.2em] font-black">Establishing Secure Tunnel...</p>
              {isMobile && (
                <p className="text-[10px] text-black font-black uppercase max-w-[260px] leading-relaxed mx-auto text-center">
                  Action Required: Confirm identity in wallet.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={initClient}
                disabled={isInitializing}
                className="w-full max-w-md py-6 rounded-xl bg-[#050505] text-white text-[13px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                Activate Identity
              </button>
              <p className="text-[9px] font-mono uppercase tracking-widest text-black/30">Protocol-level cryptographic activation</p>
            </div>
          )}
        </div>
      </div>
    );
    }

  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    // ✔️ position:relative required for absolute scanner overlays
    // h-full fills the parent (MobileChatPage flex-1 min-h-0), NO minHeight override
    <div className="relative flex w-full h-full bg-white overflow-hidden" style={{ borderRadius: isMobile ? 0 : '1rem', border: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
      {/* ── Sidebar: Conversation List ── */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/6 bg-[#FAFAFA]`}>
        <div className="p-4 border-b border-black/6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="p-2.5 rounded-xl bg-black text-white hover:bg-black/80 transition-all text-[10px] font-black uppercase tracking-widest"
                title="Scan Identity QR"
              >
                SCAN
              </button>
              <button
                onClick={() => setShowMyQR(true)}
                className="p-2.5 rounded-xl bg-black/[0.03] text-black/40 hover:bg-black/5 transition-all text-[10px] font-black uppercase"
                title="Show My QR"
              >
                QR
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Address or .eth"
              value={peerInput}
              onChange={e => setPeerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-[#9945FF]/40 placeholder:text-black/25 text-[#050505]"
            />
            <button
              onClick={handleStartConversation}
              disabled={sending}
              className="w-9 h-9 bg-[#050505] rounded-lg flex items-center justify-center text-white hover:bg-black/80 transition-colors active:scale-95 disabled:opacity-50 text-[18px] font-light"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
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
                    isActive ? 'bg-black/[0.03] border-l-2 border-l-black' : 'hover:bg-black/[0.02]'
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
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-black/50 text-[10px] font-black">
                  BACK
                </button>
                <Avatar address={activePeer!} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#050505] font-mono flex items-center gap-1.5">
                    {shortAddr(activePeer!)}
                  </span>
                  <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="lg:hidden px-3 py-2 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                >
                  SCAN
                </button>
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
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center max-w-[280px] text-center gap-6">
                      <div className="flex flex-col items-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#050505]">Tunnel Established</p>
                      </div>
                    </div>
                  </div>
                );
                return filteredMsgs.map(msg => {
                  const isMe = msg.senderInboxId
                    ? msg.senderInboxId?.toLowerCase() === (client?.inboxId as string)?.toLowerCase()
                    : false;
                  const content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
                  const isAudio = content.startsWith('__AUDIO__');
                  const audioSrc = isAudio ? content.slice('__AUDIO__'.length) : null;
                  // sentAtNs is now a plain number (ms), not BigInt
                  const sentTime = typeof msg.sentAtNs === 'number' ? new Date(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      {isAudio && audioSrc ? (
                        <div className={`px-3 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-[#050505] rounded-br-sm'
                            : 'bg-white rounded-bl-sm border border-black/8 shadow-sm'
                        }`}>
                          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'text-white/60' : 'text-black/40'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">AUDIO</span>
                          </div>
                          <audio
                            controls
                            src={audioSrc}
                            className="h-8 max-w-[200px]"
                            style={{ filter: isMe ? 'invert(1) brightness(0.8)' : 'none' }}
                          />
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                          isMe
                            ? 'bg-[#050505] text-white rounded-br-sm'
                            : 'bg-white text-[#050505] rounded-bl-sm border border-black/8 shadow-sm'
                        }`}>
                          {content}
                        </div>
                      )}
                      <span className="text-[9px] text-black/25 mt-1 px-1 font-mono">
                        {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                });
              })()}
              {peerStatus.isTyping && (
                  <div className="flex self-start items-start max-w-[78%]">
                      <div className="px-3.5 py-2 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center gap-1.5 rounded-bl-sm">
                          <span className="w-1 h-1 rounded-full bg-black/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 rounded-full bg-black/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 rounded-full bg-black/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="shrink-0 bg-white border-t border-black/6"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* ── Audio recording indicator ── */}
              {isRecording && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-black/5 px-2 py-1 rounded-md">
                        <span className="text-[10px] font-mono text-black uppercase font-black">REC</span>
                        <span className="text-[9px] font-mono text-black/40">{recordingSeconds}s</span>
                    </div>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 p-3">
                <button
                  type="button"
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                    isRecording
                      ? 'bg-black text-white shadow-xl'
                      : 'bg-black/[0.05] text-black/50 hover:bg-black/10'
                  }`}
                  style={{ touchAction: 'none' }}
                  title={isRecording ? 'Release to send audio' : 'Hold to record voice'}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">{isRecording ? 'OFF' : 'REC'}</span>
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Encrypted transmission..."
                  className="flex-1 bg-black/[0.03] border border-black/8 rounded-xl px-4 py-3 text-[#050505] focus:outline-none focus:border-black/20 placeholder:text-black/30"
                  style={{ WebkitAppearance: 'none', fontSize: '16px', lineHeight: '1.4' }}
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !isRecording) || sending}
                  className="w-11 h-11 rounded-xl bg-[#050505] flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-all active:scale-95 shrink-0 text-[10px] font-black uppercase"
                >
                  SEND
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAF8] relative overflow-hidden p-6">
            <div className="flex flex-col items-center gap-6 max-w-2xl text-center select-none relative z-10">
              
              <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white rounded-full border border-black/5 shadow-sm">
                 <img src="/official-whale-monochrome.png" alt="Whale" className="w-12 h-12 opacity-80" />
              </div>

              <div className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-black/5 rounded-full shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#00C076]">Sensors Secured</span>
              </div>

              <h2 className="text-[32px] md:text-[40px] font-black uppercase tracking-tighter text-[#0A0A0A] leading-none mt-2">
                <span className="text-black/20 block text-[12px] tracking-[0.4em] mb-3">Welcome to</span>
                Whale Chat.
              </h2>
              
              <p className="font-sans text-[13px] text-slate-400 leading-relaxed max-w-xl mx-auto mt-4 font-black tracking-widest uppercase">
                Peer-to-Peer Secure Terminal
              </p>

              <p className="font-mono text-[10px] text-black/10 uppercase tracking-[0.2em] mt-8">
                Awaiting connection initialization...
              </p>
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
                   <button onClick={() => setShowScanner(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[11px] font-black uppercase">
                     X
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
                   <button onClick={() => setShowMyQR(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[11px] font-black uppercase">
                     X
                   </button>
               </div>
               <QrScanner 
                   mode="project" 
                   projectValue={address} 
                   projectTitle="KYC Identity" 
                   projectDescription="Present this code to a peer. Once scanned, a zero-knowledge encrypted tunnel will be initialized between your identities." 
               />
           </div>
        </div>
      )}
    </div>
  );
}
