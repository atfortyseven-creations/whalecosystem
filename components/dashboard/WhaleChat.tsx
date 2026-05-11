"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Send, MessageCircle, Plus, ArrowLeft, Shield, Lock, Activity, X, Camera } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import { getXMTPClient, canReceiveMessages, sendMessage, listConversations, getMessages, destroyXMTPClient } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/dashboard/QrScanner';
import type { Client, DecodedMessage } from '@xmtp/browser-sdk';

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
  const { address, isConnected } = useSovereignAccount();
  const { signMessageAsync } = useSignMessage();

  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState('');

  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [peerInput, setPeerInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<boolean>(false);

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
    }
  }, [isConnected, address, client]);

  // Initialize XMTP
  const initClient = async () => {
    if (!address) return;
    setIsInitializing(true);
    setInitError('');
    try {
      const signer = {
        getAddress: async () => address,
        signMessage: async (msg: string) => await signMessageAsync({ message: msg }),
      };
      const xmtp = await getXMTPClient(signer);
      setClient(xmtp);
      await loadConversations(xmtp);
      startMessageStream(xmtp);
    } catch (err: any) {
      console.error("[XMTP] Init Error:", err);
      if (err?.message?.includes("User rejected")) {
        setInitError("Signature rejected. You must sign the message to decrypt your session keys.");
      } else {
        setInitError("Failed to connect to XMTP network.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const loadConversations = async (xmtp: Client) => {
    const convos = await listConversations(xmtp);
    const metaList: ConversationMeta[] = [];
    
    // Sort by most recent message (XMTP SDK usually handles this, but we'll fetch latest)
    for (const c of convos) {
      const msgs = await c.messages({ limit: 1 });
      metaList.push({
        peerAddress: c.peerAddress,
        lastMessage: msgs.length > 0 ? msgs[0].content : undefined,
        lastAt: msgs.length > 0 ? msgs[0].sent : undefined,
      });
    }
    
    // Sort descending by date
    metaList.sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
    setConversations(metaList);
  };

  const startMessageStream = async (xmtp: Client) => {
    if (streamRef.current) return;
    streamRef.current = true;
    try {
      const stream = await xmtp.conversations.streamAllMessages();
      for await (const message of stream) {
        // If message is for active conversation, append it
        setActivePeer((currentPeer) => {
          if (currentPeer && message.conversation.peerAddress.toLowerCase() === currentPeer.toLowerCase()) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }
          return currentPeer;
        });

        // Update conversation list with new message
        setConversations(prev => {
          const peer = message.conversation.peerAddress;
          const existing = prev.filter(c => c.peerAddress.toLowerCase() !== peer.toLowerCase());
          return [
            { peerAddress: peer, lastMessage: message.content, lastAt: message.sent },
            ...existing
          ];
        });
      }
    } catch (e) {
      console.error("[XMTP] Stream error:", e);
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
        const msgs = await getMessages(client, activePeer);
        if (isMounted) setMessages(msgs);
      } catch (e) {
        console.error("Failed to load messages", e);
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
        alert("This address has not activated XMTP yet. They must log in to an XMTP client first.");
        setSending(false);
        return;
      }
      setActivePeer(peer);
      setShowList(false);
      setPeerInput('');
    } catch {
      alert("Invalid address.");
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

    try {
      await sendMessage(client, activePeer, content);
      // We don't need to manually append to messages array because streamAllMessages will catch it and update state!
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

  if (showScanner) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-2xl border border-black/8 overflow-y-auto">
         <div className="w-full max-w-sm">
             <div className="flex justify-between items-center mb-6 px-2">
                 <h3 className="font-mono font-bold uppercase tracking-widest text-lg">Scan PC Session</h3>
                 <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20}/></button>
             </div>
             <QrScanner mode="scan" />
         </div>
      </div>
    );
  }

  // Not initialized yet -> Prompt for signature
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-5 bg-white rounded-2xl border border-black/5 shadow-sm p-8 text-center">
        <div className="relative">
          <Shield size={40} strokeWidth={1} className="text-[#9945FF] mb-2" />
          <Lock size={16} className="absolute bottom-1 right-[-4px] text-[#050505] bg-white rounded-full p-0.5" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-widest text-[#050505]">Encrypted Channel Offline</h3>
        <p className="text-[11px] font-mono text-black/50 max-w-sm leading-relaxed">
          Whale Chat uses the XMTP protocol for military-grade End-to-End Encryption.
          Your private keys never leave your device.
        </p>
        
        {initError && (
          <div className="bg-red-50 text-red-600 text-[10px] font-mono p-3 rounded-lg border border-red-100 max-w-xs w-full">
            {initError}
          </div>
        )}

        <button
          onClick={initClient}
          disabled={isInitializing}
          className="mt-2 px-8 py-3.5 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#9945FF] hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          {isInitializing ? (
            <><Activity size={14} className="animate-spin" /> Generating Keys...</>
          ) : (
            <><Lock size={14} /> Authorize Session</>
          )}
        </button>
        <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">Requires gasless signature</p>
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
                  <span className="text-[11px] font-bold text-[#050505] font-mono">{shortAddr(activePeer)}</span>
                  <span className="text-[9px] text-[#00C076] font-medium flex items-center gap-1">
                    <Lock size={9} /> Zero-Knowledge E2EE
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
                  const isMe = msg.senderAddress.toLowerCase() === address?.toLowerCase();
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[78%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                        isMe
                          ? 'bg-[#050505] text-white rounded-br-sm'
                          : 'bg-white text-[#050505] rounded-bl-sm border border-black/8 shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-black/25 mt-1 px-1 font-mono">
                        {msg.sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
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
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-[#FAFAFA]">
            <div className="w-16 h-16 rounded-2xl bg-[#050505]/5 border border-black/10 flex items-center justify-center">
              <Shield size={28} className="text-[#050505]/40" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#050505]/80">Maximum Security</h3>
              <p className="text-[11px] text-black/40 mt-2 max-w-xs leading-relaxed font-mono">
                Decentralized protocol active. No server can intercept these messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
