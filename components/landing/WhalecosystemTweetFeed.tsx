"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, ExternalLink, RefreshCw, Repeat2, Heart, MessageCircle, BarChart2 } from "lucide-react";

interface WhalecosystemTweetFeedProps {
  height?: number;
  showHeader?: boolean;
  theme?: "dark" | "light";
}

const MOCK_TWEETS = [
  {
    id: "1",
    author: "Whale Ecosystem",
    handle: "@whalecosystem",
    time: "2m",
    content: "🚨 45,000 ETH ($136,500,000) transferred from unknown wallet to Binance.\n\nTransaction Hash: 0x9f8c...3b4a\n#Ethereum #WhaleAlert",
    likes: "2.4K",
    rts: "892",
    replies: "124",
    views: "45K",
    verified: true
  },
  {
    id: "2",
    author: "Whale Ecosystem",
    handle: "@whalecosystem",
    time: "15m",
    content: "⚠️ SYSTEMIC MOVEMENT: 120,000,000 USDT minted at Tether Treasury.\n\nLiquidity injection detected across tier-1 exchanges. Volatility incoming. 📊",
    likes: "5.1K",
    rts: "1.2K",
    replies: "340",
    views: "102K",
    verified: true
  },
  {
    id: "3",
    author: "Whale Ecosystem",
    handle: "@whalecosystem",
    time: "1h",
    content: "Dark forest mempool scan complete. Institutional accumulators have swept 8,400 BTC over the last 72 hours via OTC desks.\n\nAccumulation phase confirmed.",
    likes: "8.9K",
    rts: "3.4K",
    replies: "562",
    views: "210K",
    verified: true
  },
  {
    id: "4",
    author: "Whale Ecosystem",
    handle: "@whalecosystem",
    time: "3h",
    content: "Liquidations cascade: Over $450M in leveraged short positions wiped out in the last 45 minutes as BTC breaches critical resistance.\n\nStay solvent. 📉➡️📈",
    likes: "12K",
    rts: "4.1K",
    replies: "890",
    views: "340K",
    verified: true
  },
  {
    id: "5",
    author: "Whale Ecosystem",
    handle: "@whalecosystem",
    time: "5h",
    content: "On-chain analytics indicate a massive withdrawal of 1.2B DOGE from Robinhood cold storage.\n\nDestination wallet is completely new. Tracking initiated. 🐕",
    likes: "15.2K",
    rts: "5.5K",
    replies: "1.1K",
    views: "500K",
    verified: true
  }
];

export function WhalecosystemTweetFeed({
  height = 500,
  showHeader = true,
  theme = "dark",
}: WhalecosystemTweetFeedProps) {
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState(MOCK_TWEETS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Simulate network load for realism
    return () => clearTimeout(timer);
  }, []);

  const refreshFeed = () => {
    setLoading(true);
    setTimeout(() => {
      // Rotate tweets to simulate refresh
      setTweets(prev => {
        const newArr = [...prev];
        const first = newArr.shift();
        if (first) newArr.push(first);
        return newArr;
      });
      setLoading(false);
    }, 1000);
  };

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-black" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-black/10";
  const textClass = isDark ? "text-white" : "text-black";
  const mutedTextClass = isDark ? "text-white/50" : "text-black/50";
  const hoverBgClass = isDark ? "hover:bg-white/5" : "hover:bg-black/5";

  return (
    <div className="flex flex-col w-full h-full font-sans">
      {/* ── Header ── */}
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1d9bf0]/20 border border-[#1d9bf0]/30 flex items-center justify-center">
              <Twitter size={14} className="text-[#1d9bf0]" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                @whalecosystem
              </span>
              <span className={`text-[9px] font-mono flex items-center gap-1 ${isDark ? 'text-[#00f5ff]/60' : 'text-[#1d9bf0]/80'}`}>
                <span className={`w-1 h-1 rounded-full animate-pulse inline-block ${isDark ? 'bg-[#00f5ff]' : 'bg-[#1d9bf0]'}`} />
                Live Feed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshFeed}
              disabled={loading}
              className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/40' : 'bg-black/5 hover:bg-black/10 border-black/10 text-black/40'} disabled:opacity-50`}
              title="Refresh Feed"
            >
              <RefreshCw size={11} className={`currentColor ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="https://twitter.com/whalecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 hover:bg-[#1d9bf0]/20 border-white/10 hover:border-[#1d9bf0]/30 text-white/40' : 'bg-black/5 hover:bg-[#1d9bf0]/10 border-black/10 hover:border-[#1d9bf0]/30 text-black/40'}`}
              title="Open @whalecosystem on X"
            >
              <ExternalLink size={11} className="hover:text-[#1d9bf0] currentColor" />
            </a>
          </div>
        </div>
      )}

      {/* ── Widget Container ── */}
      <div
        className={`relative flex-1 rounded-xl overflow-hidden border ${bgClass} ${borderClass} flex flex-col`}
        style={{ height }}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md ${isDark ? 'bg-black/60' : 'bg-white/60'}`}
            >
              <div className="flex flex-col gap-4 w-full px-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full animate-pulse shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <div className="flex flex-col gap-2 w-full pt-1">
                      <div className={`h-2.5 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-black/10'} w-1/3`} />
                      <div className={`h-2 rounded-full animate-pulse ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'} w-full`} />
                      <div className={`h-2 rounded-full animate-pulse ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'} w-5/6`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Native Feed ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {tweets.map((tweet) => (
            <div key={tweet.id} className={`p-4 border-b ${borderClass} ${hoverBgClass} transition-colors cursor-pointer`}>
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    W
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`font-bold text-[15px] ${textClass} hover:underline truncate`}>
                        {tweet.author}
                      </span>
                      {tweet.verified && (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] shrink-0" fill="currentColor">
                          <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.727 2.73 1.83 3.42-.032.18-.052.37-.052.56 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25C9.184 21.585 10.49 22.5 12 22.5s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.792 3.918-4 0-.19-.02-.38-.052-.56 1.103-.69 1.83-1.96 1.83-3.42zm-9.102 3.14l-4.14-4.14 1.414-1.415 2.726 2.727 5.656-5.657 1.415 1.414-7.07 7.07z"></path></g>
                        </svg>
                      )}
                      <span className={`text-[14px] ${mutedTextClass} truncate`}>
                        {tweet.handle}
                      </span>
                      <span className={`text-[14px] ${mutedTextClass}`}>·</span>
                      <span className={`text-[14px] hover:underline ${mutedTextClass} shrink-0`}>
                        {tweet.time}
                      </span>
                    </div>
                    <button className={`p-1.5 rounded-full ${isDark ? 'hover:bg-[#1d9bf0]/10 text-white/40 hover:text-[#1d9bf0]' : 'hover:bg-[#1d9bf0]/10 text-black/40 hover:text-[#1d9bf0]'} transition-colors`}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Tweet Text */}
                  <p className={`text-[15px] leading-normal whitespace-pre-wrap mb-3 ${textClass}`}>
                    {tweet.content}
                  </p>
                  
                  {/* Action Bar */}
                  <div className={`flex items-center justify-between max-w-md text-[13px] ${mutedTextClass}`}>
                    <button className={`flex items-center gap-2 group transition-colors ${isDark ? 'hover:text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}>
                      <div className={`p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors`}>
                        <MessageCircle size={16} />
                      </div>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className={`flex items-center gap-2 group transition-colors ${isDark ? 'hover:text-[#00ba7c]' : 'hover:text-[#00ba7c]'}`}>
                      <div className={`p-1.5 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors`}>
                        <Repeat2 size={16} />
                      </div>
                      <span>{tweet.rts}</span>
                    </button>
                    <button className={`flex items-center gap-2 group transition-colors ${isDark ? 'hover:text-[#f91880]' : 'hover:text-[#f91880]'}`}>
                      <div className={`p-1.5 rounded-full group-hover:bg-[#f91880]/10 transition-colors`}>
                        <Heart size={16} />
                      </div>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className={`flex items-center gap-2 group transition-colors ${isDark ? 'hover:text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}>
                      <div className={`p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors`}>
                        <BarChart2 size={16} />
                      </div>
                      <span>{tweet.views}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className={`p-4 text-center text-[13px] ${mutedTextClass} hover:bg-black/5 cursor-pointer`}>
            Show more
          </div>
        </div>
      </div>
    </div>
  );
}
