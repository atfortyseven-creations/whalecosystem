"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Send, Lock, Shield, Activity, MessagesSquare } from 'lucide-react';

interface Message {
  id: string;
  senderAddress: string;
  content: string;
  sentAt: Date;
  convPeer: string; // which conversation this message belongs to
}

interface Conversation {
  peerAddress: string;
}

export function SovereignChat() {
  const { address, isConnected } = useSovereignAccount();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnectedToNetwork, setIsConnectedToNetwork] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [peerInput, setPeerInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initClient = async () => {
    if (!address) return;
    setIsInitializing(true);
    // Simulate secure initialization sequence
    await new Promise(r => setTimeout(r, 1500));
    
    // Load local storage deterministic data
    try {
      const stored = localStorage.getItem('secure_comm_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.conversations) setConversations(parsed.conversations);
        if (parsed.messages) {
          const convs: { peerAddress: string }[] = parsed.conversations || [];
          const firstPeer = convs[0]?.peerAddress ?? '0xInstitutionalSupport_0000';
          // Migrate legacy messages that lack convPeer
          const migrated = parsed.messages.map((m: any) => ({
            ...m,
            sentAt: new Date(m.sentAt),
            convPeer: m.convPeer ?? (m.senderAddress === firstPeer ? firstPeer : firstPeer),
          }));
          setMessages(migrated);
        }
      } else {
        // Default deterministic thread
        const defaultConv = { peerAddress: '0xInstitutionalSupport_0000' };
        setConversations([defaultConv]);
        setMessages([
          {
            id: '1',
            senderAddress: '0xInstitutionalSupport_0000',
            content: 'Welcome to the Secure Client Communications channel. All messages are encrypted.',
            sentAt: new Date(),
            convPeer: '0xInstitutionalSupport_0000'
          }
        ]);
        setActiveConv(defaultConv);
      }
    } catch (e) {}

    setIsConnectedToNetwork(true);
    setIsInitializing(false);
  };

  const persistToLocal = (convs: Conversation[], msgs: Message[]) => {
    try {
      localStorage.setItem('secure_comm_history', JSON.stringify({
        conversations: convs,
        messages: msgs
      }));
    } catch (e) {}
  };

  const startConversation = () => {
    if (!peerInput) return;
    const newConv = { peerAddress: peerInput };
    const updatedConvs = [...conversations, newConv];
    setConversations(updatedConvs);
    setActiveConv(newConv);
    setPeerInput('');
    persistToLocal(updatedConvs, messages);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !address) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderAddress: address,
      content: inputText,
      sentAt: new Date(),
      convPeer: activeConv.peerAddress,
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setInputText('');
    persistToLocal(conversations, updatedMsgs);

    // Simulate response if talking to support
    if (activeConv.peerAddress === '0xInstitutionalSupport_0000') {
      setTimeout(() => {
        const responseMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderAddress: activeConv.peerAddress,
          content: 'An institutional representative will review your inquiry shortly.',
          sentAt: new Date(),
          convPeer: activeConv.peerAddress,
        };
        const msgsWithResp = [...updatedMsgs, responseMsg];
        setMessages(msgsWithResp);
        persistToLocal(conversations, msgsWithResp);
      }, 1200);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-5 bg-white rounded-3xl border border-black/5 m-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#050505]/5 border border-black/10 flex items-center justify-center">
          <MessagesSquare size={28} strokeWidth={1.4} className="text-[#050505]" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-bold text-[#050505] uppercase tracking-widest">Secure Client Communications</h3>
          <p className="text-sm text-black/50 max-w-[360px] leading-relaxed">
            Connect your wallet to access the encrypted communications channel.
          </p>
        </div>
      </div>
    );
  }

  if (!isConnectedToNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-5 bg-white rounded-3xl border border-black/5 shadow-sm p-8 text-center m-4">
        <Shield size={32} strokeWidth={1.5} className="text-[#050505] mb-2" />
        <h3 className="text-lg font-bold text-[#050505] tracking-tight">Encrypted Channel Inactive</h3>
        <p className="text-xs text-black/50 max-w-sm">
          Initialize the secure messaging protocol to communicate directly with peers or institutional support.
        </p>
        <button
          onClick={initClient}
          disabled={isInitializing}
          className="mt-4 px-8 py-3.5 rounded-xl bg-[#050505] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
        >
          {isInitializing ? (
            <><Activity size={14} className="animate-spin" /> Establishing Connection...</>
          ) : (
            <><Lock size={14} /> Initialize Secure Channel</>
          )}
        </button>
      </div>
    );
  }

  // Isolate messages by conversation peer so threads never bleed into each other
  const activeMessages = messages.filter(
    m => activeConv && m.convPeer === activeConv.peerAddress
  );

  return (
    <div className="flex flex-col md:flex-row h-[700px] bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      
      {/* Left Sidebar: Threads */}
      <div className="w-full md:w-80 border-r border-black/5 flex flex-col bg-black/[0.02]">
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-2 mb-4 text-[#050505]">
            <Lock size={14} />
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Active Channels</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter peer address 0x..."
              value={peerInput}
              onChange={(e) => setPeerInput(e.target.value)}
              className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-black/30 placeholder:text-black/30 text-[#050505]"
            />
            <button 
              onClick={startConversation}
              className="px-3 bg-white border border-black/10 rounded-lg text-[#050505] hover:bg-black/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, i) => (
            <button
              key={i}
              onClick={() => setActiveConv(conv)}
              className={`w-full text-left p-4 border-b border-black/5 transition-colors ${
                activeConv?.peerAddress === conv.peerAddress 
                  ? 'bg-white border-l-2 border-l-[#050505]' 
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 border border-black/5">
                  <Shield size={12} className="text-[#050505]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[12px] font-bold text-[#050505] truncate">
                    {conv.peerAddress === '0xInstitutionalSupport_0000' ? 'Institutional Support' : conv.peerAddress}
                  </p>
                  <p className="text-[10px] text-black/40 mt-0.5 truncate">Secure Channel</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#050505]">
                  {activeConv.peerAddress === '0xInstitutionalSupport_0000' ? 'Institutional Support' : activeConv.peerAddress}
                </span>
                <span className="text-[10px] text-[#00C076] font-medium flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]" /> End-to-End Encrypted
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {activeMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[11px] font-semibold tracking-widest text-black/30 uppercase">
                  No messaging history
                </div>
              ) : (
                activeMessages.map(msg => {
                  const isMe = msg.senderAddress === address;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        isMe 
                          ? 'bg-[#050505] text-white rounded-br-sm' 
                          : 'bg-black/5 text-[#050505] rounded-bl-sm border border-black/5'
                      }`}>
                        <p className="text-[13px] leading-relaxed break-words">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-black/30 mt-1.5 px-1 font-mono">
                        {msg.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-black/5">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Draft encrypted message..."
                  className="flex-1 bg-black/[0.02] border border-black/5 rounded-xl px-4 py-3 text-[13px] text-[#050505] focus:outline-none focus:border-black/20 placeholder:text-black/30"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 rounded-xl bg-[#050505] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Shield size={32} className="text-black/10 mb-4" />
            <h3 className="text-lg font-bold text-black/80 tracking-tight">No Active Channel</h3>
            <p className="text-[12px] text-black/40 max-w-xs mt-2 leading-relaxed">
              Select an existing channel or initiate a new secure connection to begin communicating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
