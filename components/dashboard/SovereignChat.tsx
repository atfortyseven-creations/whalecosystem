'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Lock, Send, RefreshCw, MessageCircle, ChevronLeft, Zap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// ── XMTP SDK (browser-safe) ──────────────────────────────────────────────────
// We use dynamic import to avoid SSR issues with the XMTP browser SDK
let xmtpModule: any = null;

async function getXmtpModule() {
  if (!xmtpModule) {
    xmtpModule = await import('@xmtp/browser-sdk');
  }
  return xmtpModule;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  senderAddress: string;
  content: string;
  sent: Date;
}

interface Conversation {
  peerAddress: string;
  messages: Message[];
  lastMessage?: Message;
}

// ── Truncate wallet address for display ────────────────────────────────────
const truncAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Constants ─────────────────────────────────────────────────────────────
const XMTP_ENV = (process.env.NEXT_PUBLIC_XMTP_ENV as any) ?? 'production';

export function SovereignChat() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [xmtpClient, setXmtpClient] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newPeerAddress, setNewPeerAddress] = useState('');
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Create a compatible XMTP signer from wagmi ──────────────────────────
  const buildSigner = useCallback(() => {
    if (!address) return null;
    return {
      getAddress: async () => address,
      signMessage: async (message: string) => {
        const sig = await signMessageAsync({ message });
        return sig;
      },
    };
  }, [address, signMessageAsync]);

  // ── Initialize XMTP client ───────────────────────────────────────────────
  const initClient = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Connect your wallet to access Sovereign Chat');
      return;
    }
    setIsInitializing(true);
    try {
      const { Client } = await getXmtpModule();
      const signer = buildSigner();
      if (!signer) throw new Error('Signer unavailable');

      const client = await Client.create(signer, { env: XMTP_ENV });
      setXmtpClient(client);

      // Load existing conversations
      const convos = await client.conversations.list();
      const enriched: Conversation[] = await Promise.all(
        convos.map(async (c: any) => {
          const msgs = await c.messages({ limit: 1 });
          const lastMsg = msgs[0];
          return {
            peerAddress: c.peerAddress,
            messages: [],
            lastMessage: lastMsg
              ? {
                  id: lastMsg.id,
                  senderAddress: lastMsg.senderAddress,
                  content: lastMsg.content,
                  sent: new Date(lastMsg.sent),
                }
              : undefined,
          };
        })
      );
      setConversations(enriched);
      toast.success('Sovereign Channel Established — All messages are E2E Encrypted');
    } catch (err: any) {
      console.error('[XMTP] Init failed:', err);
      toast.error(`Sovereign Chat failed to initialise: ${err.message}`);
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, address, buildSigner]);

  // ── Open a conversation and stream messages ──────────────────────────────
  const openConversation = useCallback(
    async (peerAddress: string) => {
      if (!xmtpClient) return;
      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      try {
        const convo = await xmtpClient.conversations.newConversation(peerAddress);
        const raw = await convo.messages();
        const parsed: Message[] = raw.map((m: any) => ({
          id: m.id,
          senderAddress: m.senderAddress,
          content: m.content,
          sent: new Date(m.sent),
        }));
        setMessages(parsed);
        setActiveConvo({ peerAddress, messages: parsed });

        // ── Stream new messages in real-time ──────────────────────────────
        setStreamActive(true);
        (async () => {
          try {
            for await (const msg of await convo.streamMessages()) {
              if (controller.signal.aborted) break;
              setMessages((prev) => {
                if (prev.find((m) => m.id === msg.id)) return prev;
                return [
                  ...prev,
                  {
                    id: msg.id,
                    senderAddress: msg.senderAddress,
                    content: msg.content,
                    sent: new Date(msg.sent),
                  },
                ];
              });
            }
          } catch {
            // Stream ended (user navigated away)
          } finally {
            setStreamActive(false);
          }
        })();
      } catch (err: any) {
        toast.error(`Failed to open conversation: ${err.message}`);
      }
    },
    [xmtpClient]
  );

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!xmtpClient || !activeConvo || !inputMsg.trim()) return;
    setIsSending(true);
    try {
      const convo = await xmtpClient.conversations.newConversation(activeConvo.peerAddress);
      await convo.send(inputMsg.trim());
      setInputMsg('');
    } catch (err: any) {
      toast.error(`Send failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  }, [xmtpClient, activeConvo, inputMsg]);

  // ── Start a new conversation ─────────────────────────────────────────────
  const startNewConvo = useCallback(async () => {
    if (!newPeerAddress.trim() || !xmtpClient) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(newPeerAddress.trim())) {
      toast.error('Invalid Ethereum address');
      return;
    }
    const { Client } = await getXmtpModule();
    const canMsg = await Client.canMessage(newPeerAddress, { env: XMTP_ENV });
    if (!canMsg) {
      toast.error('This address has not activated XMTP. They must connect to an XMTP-enabled app first.');
      return;
    }
    setShowNewConvo(false);
    await openConversation(newPeerAddress.trim());
    setNewPeerAddress('');
  }, [newPeerAddress, xmtpClient, openConversation]);

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Not connected ────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] gap-4 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center">
          <Lock size={22} style={{ color: '#9945FF' }} strokeWidth={1.4} />
        </div>
        <h3 className="text-[15px] font-black text-[#050505] tracking-tight">Sovereign Chat Locked</h3>
        <p className="text-[12px] text-black/40 max-w-[300px] leading-relaxed">
          Connect your wallet to access End-to-End Encrypted messaging via the XMTP protocol. No server reads your messages — ever.
        </p>
      </div>
    );
  }

  // ── Not initialized ──────────────────────────────────────────────────────
  if (!xmtpClient) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] gap-6">
        <div className="w-14 h-14 rounded-2xl bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center">
          <Shield size={22} style={{ color: '#9945FF' }} strokeWidth={1.4} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-[15px] font-black text-[#050505] tracking-tight">E2E Encrypted Messaging</h3>
          <p className="text-[11.5px] text-black/40 max-w-[320px] leading-relaxed">
            All messages are encrypted with your wallet keys via the XMTP protocol. Not even we can read them.
          </p>
        </div>
        <button
          onClick={initClient}
          disabled={isInitializing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#050505] text-white text-[12px] font-black tracking-[0.08em] uppercase transition-all hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInitializing ? (
            <><RefreshCw size={14} className="animate-spin" /> Establishing Channel…</>
          ) : (
            <><Zap size={14} /> Activate Sovereign Chat</>
          )}
        </button>
      </div>
    );
  }

  // ── Main chat UI ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-[620px] rounded-2xl border border-black/[0.07] overflow-hidden bg-white/60">
      {/* Sidebar — conversation list */}
      <div className="w-[240px] shrink-0 flex flex-col border-r border-black/[0.06] bg-[#FAFAF9]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/[0.06]">
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#050505]">Channels</span>
          <button
            onClick={() => setShowNewConvo(true)}
            className="text-[10px] font-bold text-[#9945FF] hover:text-[#7733DD] transition-colors"
          >
            + New
          </button>
        </div>

        {/* New conversation input */}
        {showNewConvo && (
          <div className="px-3 py-3 border-b border-black/[0.06] bg-white">
            <input
              type="text"
              placeholder="0x… wallet address"
              value={newPeerAddress}
              onChange={(e) => setNewPeerAddress(e.target.value)}
              className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-black/10 bg-white/80 outline-none focus:border-[#9945FF]/40 font-mono"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={startNewConvo} className="flex-1 text-[10px] font-black py-1.5 rounded-lg bg-[#050505] text-white">Open</button>
              <button onClick={() => setShowNewConvo(false)} className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-black/5 text-black/50">Cancel</button>
            </div>
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
              <MessageCircle size={22} className="text-black/15" />
              <p className="text-[10px] text-black/30 leading-relaxed">No conversations yet. Start one above.</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.peerAddress}
                onClick={() => openConversation(c.peerAddress)}
                className={`w-full flex flex-col gap-0.5 px-4 py-3 text-left border-b border-black/[0.05] transition-colors ${
                  activeConvo?.peerAddress === c.peerAddress ? 'bg-[#9945FF]/5' : 'hover:bg-black/[0.02]'
                }`}
              >
                <span className="text-[11px] font-bold text-[#050505] font-mono">{truncAddr(c.peerAddress)}</span>
                {c.lastMessage && (
                  <span className="text-[10px] text-black/40 truncate max-w-[180px]">
                    {c.lastMessage.content}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer: connected address */}
        <div className="px-4 py-3 border-t border-black/[0.06] bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[10px] font-mono text-black/40 truncate">{truncAddr(address!)}</span>
          </div>
        </div>
      </div>

      {/* Main panel — messages */}
      <div className="flex flex-col flex-1 min-w-0">
        {!activeConvo ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <MessageCircle size={32} className="text-black/10" />
            <p className="text-[12px] text-black/30 font-medium">Select a conversation or start a new one</p>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.06] shrink-0">
              <button onClick={() => setActiveConvo(null)} className="md:hidden text-black/30 hover:text-black/60">
                <ChevronLeft size={16} />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-[#050505] font-mono">{truncAddr(activeConvo.peerAddress)}</span>
                <span className="text-[9.5px] text-black/35 flex items-center gap-1">
                  {streamActive ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />Live stream active</> : 'E2E Encrypted via XMTP'}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Lock size={10} className="text-black/25" />
                <span className="text-[9px] text-black/25 font-bold uppercase tracking-widest">Encrypted</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                  <Lock size={20} className="text-black/15" />
                  <p className="text-[11px] text-black/30">No messages yet. Send the first one.</p>
                </div>
              )}
              {messages.map((msg) => {
                const isSelf = msg.senderAddress.toLowerCase() === address?.toLowerCase();
                return (
                  <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                        isSelf
                          ? 'bg-[#050505] text-white'
                          : 'bg-black/[0.05] text-[#050505]'
                      }`}
                    >
                      <p className="text-[12.5px] leading-snug break-words">{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${isSelf ? 'text-white/40' : 'text-black/30'}`}>
                        {fmtTime(msg.sent)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 py-3.5 border-t border-black/[0.06] flex items-end gap-3 shrink-0">
              <textarea
                rows={1}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write an encrypted message…"
                className="flex-1 resize-none rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 text-[12.5px] text-[#050505] placeholder:text-black/25 outline-none focus:border-[#9945FF]/40 transition-colors font-medium min-h-[42px] max-h-[120px]"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !inputMsg.trim()}
                className="shrink-0 w-10 h-10 rounded-xl bg-[#050505] flex items-center justify-center text-white transition-all hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
