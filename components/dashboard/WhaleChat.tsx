"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Send, MessageCircle, Plus, ArrowLeft, Shield, Lock, Activity, X, Camera, Zap } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import { getXMTPClient, canReceiveMessages, sendMessage, listConversations, getMessages, destroyXMTPClient, getDmId, nsToDate } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/dashboard/QrScanner';
import type { Client } from '@xmtp/browser-sdk';

interface ConversationMeta {
  peerAddress: string;
  lastMessage?: string;
  lastAt?: Date;
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

export function WhaleChat() {
  const { address, isConnected, isSovereignHandshake } = useSovereignAccount();
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
  const [peerStatus, setPeerStatus] = useState<{ online: boolean, lastSeen: number | null, isTyping: boolean }>({ online: false, lastSeen: null, isTyping: false });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<boolean>(false);
  const activePeerRef = useRef<string | null>(null);
  const activePeerDmIdRef = useRef<string | null>(null);
  const peerToConvId = useRef<Map<string, string>>(new Map());
  const convIdToPeer = useRef<Map<string, string>>(new Map());

  // Keep refs in sync with activePeer
  useEffect(() => {
    activePeerRef.current = activePeer;
    if (activePeer) {
      const dmId = peerToConvId.current.get(activePeer.toLowerCase());
      if (dmId) activePeerDmIdRef.current = dmId;
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
      streamRef.current = false;
    }
  }, [isConnected, address, client]);

  // ── AUTO-INITIALIZE: When wallet is connected and XMTP not yet started, ──────
  // auto-call initClient so the user doesn't have to tap a button.
  // XMTP v3 stores session keys in IndexedDB — after the first sign,
  // subsequent loads are silent (no wallet prompt needed).
  useEffect(() => {
    if (isConnected && address && !client && !isInitializing) {
      initClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

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
      localStorage.setItem(draftKey, btoa(encodeURIComponent(inputText))); // Basic obfuscation for local drafts
    } else {
      localStorage.removeItem(draftKey);
    }

    // Typing telemetry (debounced)
    const sendTyping = async () => {
        if (!inputText.trim()) return;
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

  // Initialize XMTP
  const initClient = async () => {
    if (!address) return;
    // QR Handshake sessions cannot sign via wagmi — requires direct wallet connection
    if (isSovereignHandshake) {
      setInitError('Para usar Whale Chat, conecta tu cartera directamente (MetaMask / WalletConnect) en lugar del puente QR.');
      return;
    }
    setIsInitializing(true);
    setInitError('');
    try {
      const signer = {
        getAddress: async () => address,
        // signMessage must return a hex string; XMTP client.ts converts it to Uint8Array
        signMessage: async (msg: string | Uint8Array): Promise<string> => {
          try {
            if (typeof msg === 'string') {
              // Plain text message (first-time key generation)
              return await signMessageAsync({ message: msg, account: address as `0x${string}` });
            } else {
              // Raw bytes — wrap as typed data array for wagmi
              return await signMessageAsync({ message: { raw: msg as Uint8Array }, account: address as `0x${string}` });
            }
          } catch (err: any) {
            console.error('[XMTP] Signature Error:', err);
            throw err;
          }
        },
      };
      const xmtp = await getXMTPClient(signer);
      setClient(xmtp);
      await loadConversations(xmtp);
      startMessageStream(xmtp);
    } catch (err: any) {
      console.error('[XMTP] Init Error:', err);
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setInitError('Authentication declined. A gasless cryptographic signature is required to derive your XMTP session keys. No transaction is submitted to the network.');
      } else {
        setInitError(`Connection failure: ${err?.message || 'Unknown error'}. Please verify your wallet connection and retry.`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const loadConversations = async (xmtp: Client) => {
    const convos = await listConversations(xmtp);
    const metaList: ConversationMeta[] = [];

    for (const c of (convos as any[])) {
      try {
        // v5.3.0: DMs have peerInboxId() async method, no peerAddress property
        const peerInboxId: string = typeof c.peerInboxId === 'function'
          ? await c.peerInboxId()
          : (c.id || 'unknown');

        // Use cached wallet address if we have it, otherwise show truncated inboxId
        const peerKey = convIdToPeer.current.get(c.id) || peerInboxId;

        // Store bidirectional mapping
        peerToConvId.current.set(peerKey.toLowerCase(), c.id);
        convIdToPeer.current.set(c.id, peerKey);

        // v5.3.0: use lastMessage() method
        const lastMsg = typeof c.lastMessage === 'function' ? await c.lastMessage() : null;

        metaList.push({
          peerAddress: peerKey,
          lastMessage: lastMsg
            ? (typeof lastMsg.content === 'string' ? lastMsg.content : 'Encrypted Data')
            : undefined,
          lastAt: lastMsg ? nsToDate(lastMsg.sentAtNs) : undefined,
        });
      } catch (e) {
        console.warn('Failed to load conversation', e);
      }
    }

    metaList.sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
    setConversations(metaList);
  };

  const startMessageStream = async (xmtp: Client) => {
    if (streamRef.current) return;
    streamRef.current = true;
    try {
      const stream = await xmtp.conversations.streamAllMessages();
      for await (const message of stream as any) {
        // v5.3.0: messages have conversationId, senderInboxId, sentAtNs, content (decoded)
        const convId = message.conversationId;
        const msgContent = typeof message.content === 'string' ? message.content : (message.fallback || 'Encrypted Data');
        const msgSent = nsToDate(message.sentAtNs);

        // Resolve peer wallet address from conversation ID mapping
        const msgPeer = convIdToPeer.current.get(convId) || convId;

        // Append to active chat if it matches the current conversation
        if (activePeerDmIdRef.current && convId === activePeerDmIdRef.current) {
          setMessages(prev => {
            if (prev.find(m => m.id === message.id)) return prev;
            const filtered = prev.filter(m => !(String(m.id).startsWith('opt_') && m.content === msgContent));
            return [...filtered, message];
          });
        }

        // Update conversation list preview
        setConversations(prev => {
          const existing = prev.filter(c => peerToConvId.current.get(c.peerAddress.toLowerCase()) !== convId);
          return [{ peerAddress: msgPeer, lastMessage: msgContent, lastAt: msgSent }, ...existing];
        });
      }
    } catch (e) {
      console.error('[XMTP] Stream error:', e);
      streamRef.current = false;
    }
  };

  // Load messages when active peer changes
  useEffect(() => {
    if (!client || !activePeer) return;
    let isMounted = true;

    const loadChat = async () => {
      setMessages([]);
      try {
        // v5.3.0: get/create DM and store conversation ID mapping
        const dmId = await getDmId(client, activePeer);
        activePeerDmIdRef.current = dmId;
        peerToConvId.current.set(activePeer.toLowerCase(), dmId);
        convIdToPeer.current.set(dmId, activePeer);

        const msgs = await getMessages(client, activePeer);
        if (isMounted) setMessages(msgs);
      } catch (e) {
        console.error('Failed to load messages', e);
      }
    };

    loadChat();
    return () => { isMounted = false; };
  }, [client, activePeer]);

  const handleStartConversation = async () => {
    if (!client || !peerInput.trim() || sending) return;
    setSending(true);
    try {
      const peer = peerInput.trim();
      const canMsg = await canReceiveMessages(client, peer);
      if (!canMsg) {
        alert('This address has not activated XMTP yet. They must log in to an XMTP client first.');
        setSending(false);
        return;
      }
      // v5.3.0: pre-create DM and store mapping before switching view
      const dmId = await getDmId(client, peer);
      peerToConvId.current.set(peer.toLowerCase(), dmId);
      convIdToPeer.current.set(dmId, peer);
      activePeerDmIdRef.current = dmId;

      setActivePeer(peer);
      setShowList(false);
      setPeerInput('');
    } catch {
      alert('Invalid address.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !activePeer || !inputText.trim() || sending) return;
    setSending(true);
    const content = inputText.trim();
    setInputText(''); // Optimistic clear
    
    // Clear draft explicitly
    if (address) {
        localStorage.removeItem(`whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`);
    }

    try {
      await sendMessage(client, activePeer, content);
      // Optimistic update — use inboxId so isMe check works
      const newMsg = {
        id: `opt_${Date.now()}`,
        senderInboxId: client?.inboxId,
        content: content,
        sentAtNs: BigInt(Date.now()) * 1_000_000n,
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message.");
      setInputText(content); // Restore
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

  // ── QR Scanner overlay (accessible at any time when connected) ───────────
  if (showScanner) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-2xl border border-black/8 overflow-y-auto">
         <div className="w-full max-w-sm">
             <div className="flex justify-between items-center mb-6 px-2">
                 <h3 className="font-mono font-bold uppercase tracking-widest text-lg">Scan PC Session</h3>
                 <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20}/></button>
             </div>
             <p className="text-[11px] text-black/50 text-center mb-4 px-4 font-mono">Scan the QR code displayed on your desktop dashboard to link your secure E2EE chat session.</p>
             <QrScanner mode="scan" />
         </div>
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
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#9945FF]/5 border border-[#9945FF]/15">
                <Activity size={18} className="text-[#9945FF] animate-spin shrink-0" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#9945FF]">Establishing Secure Channel</p>
                  <p className="text-[9px] text-black/40 font-mono mt-0.5">Retrieving session keys from local storage. If this is your first session, approve the signature prompt in your wallet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className="flex w-full h-full bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      {/* ── Sidebar: Conversation List ── */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/6 bg-[#FAFAFA]`}>
        <div className="p-4 border-b border-black/6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#9945FF]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]">E2EE Secured</span>
            </div>
            <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[9px] font-bold uppercase tracking-widest text-black/60 transition-colors"
                title="Scan PC QR to link session"
            >
                <Camera size={12} /> Link PC
            </button>
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
                <Avatar address={activePeer} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#050505] font-mono flex items-center gap-1.5">
                    {shortAddr(activePeer)}
                    {peerStatus.online && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Online" />}
                  </span>
                  <span className="text-[9px] font-medium flex items-center gap-1">
                    {peerStatus.isTyping ? (
                        <span className="text-[#9945FF] font-black tracking-widest uppercase animate-pulse">Decrypting Keystrokes...</span>
                    ) : peerStatus.online ? (
                        <span className="text-green-600">Active Connection</span>
                    ) : peerStatus.lastSeen ? (
                        <span className="text-black/40">Last seen: {new Date(peerStatus.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    ) : (
                        <span className="text-[#00C076]"><Lock size={9} className="inline" /> Zero-Knowledge E2EE</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#FAFAFA]">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <Shield size={32} className="mb-2" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#050505]">Cryptographic Tunnel Established</p>
                  <p className="text-[10px] text-[#050505] max-w-xs text-center mt-2">Only you and {shortAddr(activePeer)} can read these messages.</p>
                </div>
              ) : (
                messages.map(msg => {
                  // v5.3.0: senderInboxId (not senderAddress), sentAtNs (BigInt ns), content (decoded)
                  const isMe = msg.senderInboxId
                    ? msg.senderInboxId === client?.inboxId
                    : (msg.senderAddress || '').toLowerCase() === address?.toLowerCase();
                  const content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
                  const sentTime = msg.sentAtNs != null ? nsToDate(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
                  
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
                })
              )}
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
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0D0D0D] to-[#050505]">
            {/* Ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#00C076]/6 blur-[100px]" />
            </div>
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(rgba(0,192,118,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,192,118,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }} />
            <div className="relative z-10 flex flex-col items-center gap-5 p-8 max-w-xs text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#00C076]/25 blur-xl scale-150 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-[#00C076]/20 flex items-center justify-center backdrop-blur-sm">
                  <Zap size={24} className="text-[#00C076]" />
                </div>
              </div>
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.22em] text-white mb-2">Select a Channel</h3>
                <p className="text-[10px] text-white/30 leading-relaxed font-mono">
                  Enter an Ethereum address to open a zero-knowledge encrypted channel. Only you and your peer can read these messages.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#00C076]">XMTP Protocol Active</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07]">
                  <Lock size={9} className="text-white/30 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Zero-Knowledge E2EE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
