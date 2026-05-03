"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface WhalecosystemTweetFeedProps {
  /** Restrict height of the timeline widget. Default: 500px */
  height?: number;
  /** Show header with title and Twitter link */
  showHeader?: boolean;
  /** Dark or light theme */
  theme?: "dark" | "light";
}

/**
 * WhalecosystemTweetFeed
 *
 * Embeds the official Twitter/X Timeline widget for @whalecosystem using
 * the platform.twitter.com/widgets.js embed API.
 * - No API key required
 * - Updates in real-time as new tweets are posted
 * - Respects the platform's official Terms of Service
 * - Works in Next.js without SSR issues (client-only via useEffect)
 */
export function WhalecosystemTweetFeed({
  height = 500,
  showHeader = true,
  theme = "dark",
}: WhalecosystemTweetFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");

    const loadWidget = async () => {
      try {
        if (!containerRef.current) return;

        // Clear any previous widget instance
        containerRef.current.innerHTML = "";

        // Build the anchor element that Twitter Widgets API transforms
        const anchor = document.createElement("a");
        anchor.className = "twitter-timeline";
        anchor.setAttribute("href", "https://twitter.com/whalecosystem");
        anchor.setAttribute("data-screen-name", "whalecosystem");
        anchor.setAttribute("data-tweet-limit", "5");
        anchor.setAttribute("data-theme", theme);
        anchor.setAttribute("data-chrome", "noheader nofooter noborders transparent");
        anchor.setAttribute("data-link-color", "#00f5ff");
        anchor.setAttribute("data-width", "100%");
        anchor.setAttribute("data-height", String(height));
        anchor.setAttribute("data-aria-polite", "assertive");
        anchor.textContent = "Tweets by @whalecosystem";
        containerRef.current.appendChild(anchor);

        // Load or reload the Twitter Widgets script
        const existingScript = document.getElementById("twitter-wjs");
        if (existingScript) existingScript.remove();

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.id = "twitter-wjs";
          script.src = "https://platform.twitter.com/widgets.js";
          script.async = true;
          script.charset = "utf-8";
          script.crossOrigin = "anonymous";

          script.onload = () => {
            // Give the widgets a moment to render
            const checkReady = setInterval(() => {
              if (!isMounted) { clearInterval(checkReady); return; }
              const iframe = containerRef.current?.querySelector("iframe");
              if (iframe) {
                clearInterval(checkReady);
                if (isMounted) setStatus("ready");
                resolve();
              }
            }, 300);

            // Timeout after 10 seconds
            setTimeout(() => {
              clearInterval(checkReady);
              if (isMounted && status !== "ready") {
                setStatus("error");
              }
              resolve();
            }, 10000);
          };

          script.onerror = () => {
            if (isMounted) setStatus("error");
            reject(new Error("Twitter script failed to load"));
          };

          document.head.appendChild(script);
        });

        // Trigger widget render if twttr is already loaded (second render)
        if (typeof (window as any).twttr !== "undefined") {
          try {
            await (window as any).twttr.widgets.load(containerRef.current);
            if (isMounted) setStatus("ready");
          } catch {}
        }
      } catch (e) {
        if (isMounted) {
          console.warn("[TweetFeed] Widget load failed:", e);
          setStatus("error");
        }
      }
    };

    loadWidget();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, theme]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* ── Header ── */}
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1d9bf0]/20 border border-[#1d9bf0]/30 flex items-center justify-center">
              <Twitter size={14} className="text-[#1d9bf0]" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                @whalecosystem
              </span>
              <span className={`text-[9px] font-mono flex items-center gap-1 ${theme === 'dark' ? 'text-[#00f5ff]/60' : 'text-[#1d9bf0]/80'}`}>
                <span className={`w-1 h-1 rounded-full animate-pulse inline-block ${theme === 'dark' ? 'bg-[#00f5ff]' : 'bg-[#1d9bf0]'}`} />
                Live Feed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "error" && (
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className={`p-1.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/40' : 'bg-black/5 hover:bg-black/10 border-black/10 text-black/40'}`}
                title="Retry loading tweets"
              >
                <RefreshCw size={11} className="currentColor" />
              </button>
            )}
            <a
              href="https://twitter.com/whalecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-[#1d9bf0]/20 border-white/10 hover:border-[#1d9bf0]/30 text-white/40' : 'bg-black/5 hover:bg-[#1d9bf0]/10 border-black/10 hover:border-[#1d9bf0]/30 text-black/40'}`}
              title="Open @whalecosystem on Twitter"
            >
              <ExternalLink size={11} className="hover:text-[#1d9bf0] currentColor" />
            </a>
          </div>
        </div>
      )}

      {/* ── Widget Container ── */}
      <div
        className={`relative flex-1 rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-black/5 bg-[#FDFCF8]'}`}
        style={{ minHeight: height }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/40' : 'bg-white/60'}`}
            >
              {/* Skeleton tweet lines */}
              <div className="flex flex-col gap-3 w-full px-4">
                {[0.9, 0.7, 0.8, 0.6, 0.75].map((w, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div
                      className={`h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}
                      style={{ width: `${w * 100}%`, animationDelay: `${i * 0.1}s` }}
                    />
                    <div
                      className={`h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}
                      style={{ width: `${(w - 0.15) * 100}%`, animationDelay: `${i * 0.1 + 0.05}s` }}
                    />
                  </div>
                ))}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest mt-2 ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>
                Loading feed…
              </span>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-6"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/50">
                  Feed Unavailable
                </p>
                <p className="text-[9px] font-mono text-white/30 max-w-[180px] leading-relaxed">
                  Could not load Twitter widget. Check your network or ad-blocker settings.
                </p>
              </div>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 transition-colors"
              >
                <RefreshCw size={11} />
                Retry
              </button>
              <a
                href="https://twitter.com/whalecosystem"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-mono text-[#1d9bf0]/60 hover:text-[#1d9bf0] transition-colors"
              >
                <Twitter size={10} />
                View on Twitter directly
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The actual Twitter timeline div — transformed by widgets.js */}
        <div
          ref={containerRef}
          className="w-full h-full [&>iframe]:!rounded-none [&>iframe]:!border-0"
          style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
        />
      </div>
    </div>
  );
}
