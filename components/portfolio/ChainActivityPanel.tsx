"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownLeft, Repeat2, ExternalLink,
  RefreshCw, ChevronDown, ChevronRight, Loader2, Hash,
  Clock, Fuel, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

const BG     = "#FAF9F6";
const INK    = "#050505";
const MUTED  = "rgba(5,5,5,0.45)";
const BORDER = "rgba(5,5,5,0.08)";
const CARD   = "#FFFFFF";

const CHAINS = [
  { id: 1,     name: "Ethereum",    slug: "ethereum", color: "#627EEA", symbol: "ETH",  explorer: "https://etherscan.io" },
  { id: 8453,  name: "Base",        slug: "base",     color: "#0052FF", symbol: "ETH",  explorer: "https://basescan.org" },
  { id: 42161, name: "Arbitrum",    slug: "arbitrum", color: "#12AAFF", symbol: "ETH",  explorer: "https://arbiscan.io" },
  { id: 10,    name: "Optimism",    slug: "optimism", color: "#FF0420", symbol: "ETH",  explorer: "https://optimistic.etherscan.io" },
  { id: 137,   name: "Polygon",     slug: "polygon",  color: "#8247E5", symbol: "POL",  explorer: "https://polygonscan.com" },
  { id: 480,   name: "World Chain", slug: null,       color: "#000000", symbol: "ETH",  explorer: "https://worldscan.org" },
];

type Tx = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  txreceipt_status: string;
  gasUsed: string;
  gasPrice: string;
  input: string;
  functionName?: string;
};

function txType(tx: Tx, address: string): "send" | "receive" | "contract" {
  if (tx.input && tx.input !== "0x") return "contract";
  if (!address || !tx.from) return "receive"; // Fallback to prevent crash
  if (tx.from.toLowerCase() === address.toLowerCase()) return "send";
  return "receive";
}

function formatAge(ts: string) {
  const diff = Date.now() / 1000 - parseInt(ts);
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatETH(wei: string) {
  const val = parseFloat(wei) / 1e18;
  if (val === 0) return "0";
  if (val < 0.0001) return "<0.0001";
  return val.toFixed(4);
}

function formatGwei(gasPrice: string) {
  return (parseFloat(gasPrice) / 1e9).toFixed(1) + " Gwei";
}

function shortHash(h: string) {
  return h.slice(0, 8) + "…" + h.slice(-6);
}
function shortAddr(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

// ── Single chain row ──────────────────────────────────────────────────────────
function ChainRow({
  chain, address,
}: {
  chain: typeof CHAINS[0];
  address: string;
}) {
  const [open, setOpen] = useState(false);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const load = useCallback(async () => {
    if (!chain.slug || !address) return;
    setLoading(true);
    try {
      const base = `/api/portfolio/chain-activity?address=${address}&chain=${chain.slug}`;
      const [balRes, txRes] = await Promise.all([
        fetch(`${base}&type=balance`),
        fetch(`${base}&type=txlist`),
      ]);
      const balData = await balRes.json();
      const txData  = await txRes.json();

      if (balData.status === '1') setBalance(balData.result);
      if (txData.status === '1' && Array.isArray(txData.result)) setTxs(txData.result);
      setFetched(true);
    } catch (e) {
      console.warn(`[ChainActivity] ${chain.name}:`, e);
    } finally {
      setLoading(false);
    }
  }, [chain, address]);

  // Load when expanded, or immediately on mount for World Chain (no API)
  useEffect(() => {
    if (!chain.slug) { setFetched(true); return; } // World Chain: no Etherscan yet
    if (open && !fetched) load();
  }, [open, fetched, load, chain.slug]);

  const ethBal = balance !== null ? formatETH(balance) : '—';
  const hasActivity = fetched && txs.length > 0;

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      {/* Chain header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-black/[0.02] transition-colors text-left"
      >
        {/* Color dot */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 border"
          style={{ background: `${chain.color}14`, borderColor: `${chain.color}25`, color: chain.color }}
        >
          {chain.symbol}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-black text-sm" style={{ color: INK }}>{chain.name}</div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: MUTED }}>
            Chain ID: {chain.id}
          </div>
        </div>

        {/* Native balance */}
        <div className="text-right mr-3">
          <div className="font-black text-sm font-mono" style={{ color: INK }}>
            {ethBal} {chain.symbol}
          </div>
          {fetched && (
            <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: hasActivity ? "#10b981" : MUTED }}>
              {hasActivity ? `${txs.length} txns` : "No activity"}
            </div>
          )}
        </div>

        {loading
          ? <Loader2 size={14} className="animate-spin shrink-0" style={{ color: MUTED }} />
          : open
            ? <ChevronDown size={14} className="shrink-0" style={{ color: MUTED }} />
            : <ChevronRight size={14} className="shrink-0" style={{ color: MUTED }} />
        }
      </button>

      {/* Transaction list — expanded */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t" style={{ borderColor: BORDER }}>
              {/* Sub-header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ background: BG }}>
                <span className="text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>
                  Recent Transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={load}
                    className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                    style={{ color: MUTED }}
                  >
                    <RefreshCw size={11} />
                  </button>
                  {chain.explorer && (
                    <a
                      href={`${chain.explorer}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity"
                      style={{ color: chain.color }}
                    >
                      <ExternalLink size={10} />
                      Explorer
                    </a>
                  )}
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="py-10 flex items-center justify-center gap-2" style={{ color: MUTED }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">Fetching on-chain data...</span>
                </div>
              )}

              {/* No activity */}
              {!loading && fetched && txs.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>No transactions found</p>
                </div>
              )}

              {/* No API for this chain */}
              {!loading && !fetched && !chain.slug && (
                <div className="py-10 text-center">
                  <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>World Chain explorer coming soon</p>
                </div>
              )}

              {/* Transaction rows */}
              {!loading && txs.map((tx, i) => {
                const type = txType(tx, address);
                const isErr = tx.isError === "1";
                const typeColor = type === "send" ? "#f43f5e" : type === "receive" ? "#10b981" : "#8247e5";
                const typeLabel = type === "send" ? "Sent" : type === "receive" ? "Received" : "Contract";
                const TypeIcon = type === "send" ? ArrowUpRight : type === "receive" ? ArrowDownLeft : Repeat2;
                const ethVal = formatETH(tx.value);

                return (
                  <div
                    key={tx.hash}
                    className="flex items-center gap-3 px-5 py-3 border-t hover:bg-black/[0.02] transition-colors"
                    style={{ borderColor: BORDER }}
                  >
                    {/* Type icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${typeColor}14`, color: typeColor }}
                    >
                      {isErr ? <XCircle size={14} /> : <TypeIcon size={14} />}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black" style={{ color: isErr ? "#f43f5e" : typeColor }}>
                          {isErr ? "Failed" : typeLabel}
                        </span>
                        {!isErr && (
                          <span className="text-[10px] font-mono" style={{ color: INK }}>
                            {ethVal !== "0" ? `${ethVal} ${chain.symbol}` : tx.functionName ? tx.functionName.split("(")[0] : "—"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono" style={{ color: MUTED }}>
                          {type === "send" ? `→ ${shortAddr(tx.to || "?")}` : `← ${shortAddr(tx.from)}`}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: MUTED }}>·</span>
                        <span className="text-[9px] font-mono flex items-center gap-0.5" style={{ color: MUTED }}>
                          <Clock size={8} />
                          {formatAge(tx.timeStamp)}
                        </span>
                        <span className="text-[9px] font-mono hidden sm:flex items-center gap-0.5" style={{ color: MUTED }}>
                          <Fuel size={8} />
                          {formatGwei(tx.gasPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Hash link */}
                    <a
                      href={`${chain.explorer}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono hover:opacity-100 opacity-40 transition-opacity flex items-center gap-1 shrink-0"
                      style={{ color: INK }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Hash size={9} />
                      {shortHash(tx.hash)}
                      <ExternalLink size={8} />
                    </a>
                  </div>
                );
              })}

              {/* Footer link */}
              {!loading && fetched && txs.length > 0 && (
                <div className="px-5 py-3 border-t flex items-center justify-center" style={{ borderColor: BORDER, background: BG }}>
                  <a
                    href={`${chain.explorer}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: chain.color }}
                  >
                    View all on {chain.name} Explorer
                    <ExternalLink size={9} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function ChainActivityPanel({ address }: { address: string }) {
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
        <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
        <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Chain Activity</h2>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black border"
          style={{ borderColor: BORDER, color: MUTED }}
        >
          {CHAINS.length} networks
        </span>
      </div>

      {/* Chain list */}
      <div className="p-4 flex flex-col gap-2">
        {CHAINS.map(chain => (
          <ChainRow
            key={chain.id}
            chain={chain}
            address={address}
          />
        ))}
      </div>

    </div>
  );
}
