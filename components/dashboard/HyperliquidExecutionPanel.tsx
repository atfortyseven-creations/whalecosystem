'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { TrendingUp, TrendingDown, Zap, RefreshCw, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';

// ── Hyperliquid API constants ────────────────────────────────────────────────
const HL_INFO_URL = 'https://api.hyperliquid.xyz/info';

// ── Types ────────────────────────────────────────────────────────────────────
interface MarketData {
  coin: string;
  markPx: string;
  fundingRate: string;
  openInterest: string;
  volume24h: string;
  priceChange24h: number;
}

interface PositionData {
  coin: string;
  szi: string;         // position size (signed: + long, - short)
  entryPx: string;
  unrealizedPnl: string;
  leverage: string;
}

// ── Number formatting helpers ────────────────────────────────────────────────
const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

const TOP_MARKETS = ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'AVAX', 'LINK', 'UNI'];

export function HyperliquidExecutionPanel() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(5);
  const [size, setSize] = useState('');
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'trade' | 'positions'>('trade');

  // Fetch live market data from Hyperliquid
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch(HL_INFO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const [meta, assetCtxs] = await res.json();

      const enriched: MarketData[] = meta.universe
        .map((asset: any, i: number) => {
          const ctx = assetCtxs[i];
          const markPx = parseFloat(ctx?.markPx ?? '0');
          const prevPx = parseFloat(ctx?.prevDayPx ?? markPx.toString());
          return {
            coin: asset.name,
            markPx: ctx?.markPx ?? '0',
            fundingRate: (parseFloat(ctx?.funding ?? '0') * 100).toFixed(4),
            openInterest: ctx?.openInterest ?? '0',
            volume24h: ctx?.dayNtlVlm ?? '0',
            priceChange24h: prevPx > 0 ? ((markPx - prevPx) / prevPx) * 100 : 0,
          };
        })
        .filter((m: MarketData) => TOP_MARKETS.includes(m.coin));

      setMarkets(enriched);
    } catch (err) {
      console.error('[Hyperliquid] Market fetch failed:', err);
      setMarkets([]); // Explicit empty state on failure (Zero-Mock)
    } finally {
      setIsLoadingMarkets(false);
    }
  }, []);

  // Fetch open positions for connected wallet
  const fetchPositions = useCallback(async () => {
    if (!address) return;
    setIsLoadingPositions(true);
    try {
      const res = await fetch(HL_INFO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clearinghouseState', user: address }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const openPos: PositionData[] = (data.assetPositions ?? [])
        .filter((p: any) => parseFloat(p.position.szi) !== 0)
        .map((p: any) => ({
          coin: p.position.coin,
          szi: p.position.szi,
          entryPx: p.position.entryPx,
          unrealizedPnl: p.position.unrealizedPnl,
          leverage: p.position.leverage?.value?.toString() ?? '1',
        }));
        
      setPositions(openPos);
    } catch (err) {
      console.error('[Hyperliquid] Position fetch failed:', err);
      setPositions([]);
    } finally {
      setIsLoadingPositions(false);
    }
  }, [address]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10_000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  useEffect(() => {
    if (isConnected) fetchPositions();
  }, [isConnected, fetchPositions, activeTab]);

  // ── Place a market order via Backend Relay ─────────────────────────────
  // Real orders require an L1 signature.
  const placeOrder = useCallback(async () => {
    if (!isConnected || !address || !walletClient) {
      toast.error('Connect your wallet to trade');
      return;
    }
    if (!size || parseFloat(size) <= 0) {
      toast.error('Enter a valid order size');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Signing ${side.toUpperCase()} ${size} ${selectedCoin} @ ${leverage}x…`);

    try {
      const isBuy = side === 'long';
      const selectedMarket = markets.find((m) => m.coin === selectedCoin);
      if (!selectedMarket) throw new Error('Market data unavailable');

      // Request actual signature from user's wallet
      const messageToSign = `Approve ${isBuy ? 'LONG' : 'SHORT'} order for ${size} USD of ${selectedCoin} at ${leverage}x leverage on Hyperliquid.`;
      const signature = await walletClient.signMessage({ 
        message: messageToSign,
        account: address as any
      });

      // Send the signature and payload to the real backend execution API
      const res = await fetch('/api/hyperliquid/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature,
          coin: selectedCoin,
          isBuy,
          sz: parseFloat(size),
          leverage
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Execution failed with status ${res.status}`);
      }

      toast.success(`${side.toUpperCase()} ${size} ${selectedCoin} executed successfully on L1`, { id: toastId, style: { background: '#050505', color: '#00C076', border: '1px solid #00C07640' } });
      setSize('');
      setActiveTab('positions');
      fetchPositions();

    } catch (err: any) {
      toast.error(err.message ?? 'Order submission failed', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, address, side, size, selectedCoin, leverage, markets, fetchPositions, walletClient]);

  const selectedMarket = markets.find((m) => m.coin === selectedCoin);

  return (
    <div className="flex flex-col gap-6">
      {/* Market ticker strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {isLoadingMarkets
          ? TOP_MARKETS.map((c) => (
              <div key={c} className="flex-shrink-0 w-[130px] h-[68px] rounded-xl bg-black/[0.04] animate-pulse" />
            ))
          : markets.map((m) => (
              <button
                key={m.coin}
                onClick={() => setSelectedCoin(m.coin)}
                className={`flex-shrink-0 flex flex-col gap-1 px-3.5 py-2.5 rounded-xl border transition-all text-left ${
                  selectedCoin === m.coin
                    ? 'bg-[#050505] border-[#050505] text-white'
                    : 'bg-white/60 border-black/[0.07] hover:border-black/20 text-[#050505]'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedCoin === m.coin ? 'text-white/60' : 'text-black/40'}`}>
                  {m.coin}-PERP
                </span>
                <span className="text-[14px] font-black leading-none">
                  {fmtUsd(parseFloat(m.markPx))}
                </span>
                <span className={`text-[10px] font-bold ${m.priceChange24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {fmtPct(m.priceChange24h)}
                </span>
              </button>
            ))}
      </div>

      {/* Main trading area */}
      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Order form */}
        <div className="flex flex-col gap-4 w-full lg:w-[320px] shrink-0">
          <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#050505]">
                {selectedCoin} — Market Order
              </h3>
              {selectedMarket && (
                <span className="text-[10px] font-mono text-black/40">
                  Rate: {selectedMarket.fundingRate}%/hr
                </span>
              )}
            </div>

            {/* Long / Short toggle */}
            <div className="flex rounded-xl overflow-hidden border border-black/[0.07]">
              <button
                onClick={() => setSide('long')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                  side === 'long' ? 'bg-emerald-500 text-white' : 'bg-transparent text-black/40 hover:text-black/60'
                }`}
              >
                <TrendingUp size={12} /> Long
              </button>
              <button
                onClick={() => setSide('short')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                  side === 'short' ? 'bg-red-500 text-white' : 'bg-transparent text-black/40 hover:text-black/60'
                }`}
              >
                <TrendingDown size={12} /> Short
              </button>
            </div>

            {/* Leverage slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider">Leverage</span>
                <span className="text-[14px] font-black text-[#050505]">{leverage}×</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-[#050505]"
              />
              <div className="flex justify-between text-[9px] text-black/25 font-mono">
                <span>1×</span><span>10×</span><span>25×</span><span>50×</span>
              </div>
            </div>

            {/* Size input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider">Size (USD notional)</span>
              <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 focus-within:border-[#050505]/30 transition-colors">
                <span className="text-[12px] text-black/30 font-bold">$</span>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="100"
                  className="flex-1 text-[13px] font-black bg-transparent outline-none text-[#050505] placeholder:text-black/20"
                />
              </div>
              {/* Quick size buttons */}
              <div className="flex gap-1.5">
                {['100', '500', '1000', '5000'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSize(v)}
                    className="flex-1 text-[9px] font-bold py-1 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-black/50 transition-colors"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Order summary */}
            {size && selectedMarket && (
              <div className="rounded-xl bg-black/[0.03] border border-black/[0.05] px-3.5 py-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-black/40">Mark Price</span>
                  <span className="font-black text-[#050505]">{fmtUsd(parseFloat(selectedMarket.markPx))}</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-black/40">Notional</span>
                  <span className="font-black text-[#050505]">{fmtUsd(parseFloat(size))}</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-black/40">Margin Required</span>
                  <span className="font-black text-[#050505]">{fmtUsd(parseFloat(size) / leverage)}</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-black/40">Liq. Estimate</span>
                  <span className={`font-black ${side === 'long' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {fmtUsd(parseFloat(selectedMarket.markPx) * (side === 'long' ? (1 - 1/leverage) : (1 + 1/leverage)))}
                  </span>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-2.5">
              <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9.5px] text-amber-700 leading-relaxed">
                Perpetuals trading involves significant risk of loss. Use appropriate position sizing.
              </p>
            </div>

            {/* Submit button */}
            <button
              onClick={placeOrder}
              disabled={isSubmitting || !isConnected || !size}
              className={`w-full py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                side === 'long'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40'
                  : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-40'
              } disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <><RefreshCw size={13} className="animate-spin" /> Submitting…</>
              ) : (
                <><Zap size={13} /> {side === 'long' ? 'Buy / Long' : 'Sell / Short'} {selectedCoin}</>
              )}
            </button>
          </div>
        </div>

        {/* Right panel: positions + market stats */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Tab selector */}
          <div className="flex gap-1 p-1 rounded-xl bg-black/[0.04] w-fit">
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'trade' ? 'bg-white shadow-sm text-[#050505]' : 'text-black/40'}`}
            >
              Market Stats
            </button>
            <button
              onClick={() => { setActiveTab('positions'); fetchPositions(); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'positions' ? 'bg-white shadow-sm text-[#050505]' : 'text-black/40'}`}
            >
              Open Positions {positions.length > 0 && `(${positions.length})`}
            </button>
          </div>

          {activeTab === 'trade' && selectedMarket && (
            <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Mark Price', value: fmtUsd(parseFloat(selectedMarket.markPx)) },
                { label: '24h Change', value: fmtPct(selectedMarket.priceChange24h), colored: true, change: selectedMarket.priceChange24h },
                { label: 'Funding Rate', value: `${selectedMarket.fundingRate}%/hr` },
                { label: 'Open Interest', value: fmtUsd(parseFloat(selectedMarket.openInterest)) },
                { label: '24h Volume', value: fmtUsd(parseFloat(selectedMarket.volume24h)) },
                { label: 'Leverage (selected)', value: `${leverage}×` },
              ].map(({ label, value, colored, change }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[9.5px] text-black/40 font-bold uppercase tracking-widest">{label}</span>
                  <span className={`text-[15px] font-black ${colored ? (change! >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-[#050505]'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="rounded-2xl border border-black/[0.07] bg-white/60 overflow-hidden">
              {isLoadingPositions ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw size={18} className="animate-spin text-black/20" />
                </div>
              ) : positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Target size={24} className="text-black/15" />
                  <p className="text-[11px] text-black/30">No open positions on Hyperliquid</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      {['Asset', 'Size', 'Entry', 'Unrealized PnL', 'Leverage'].map((h) => (
                        <th key={h} className="text-[9.5px] font-black uppercase tracking-widest text-black/35 px-4 py-3 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, i) => {
                      const pnl = parseFloat(pos.unrealizedPnl);
                      const isLong = parseFloat(pos.szi) > 0;
                      return (
                        <tr key={`${pos.coin}-${i}`} className="border-b border-black/[0.04] hover:bg-black/[0.01] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${isLong ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              <span className="text-[12px] font-black text-[#050505]">{pos.coin}-PERP</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11.5px] font-bold ${isLong ? 'text-emerald-600' : 'text-red-500'}`}>
                              {isLong ? '▲' : '▼'} {Math.abs(parseFloat(pos.szi)).toFixed(4)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11.5px] font-mono text-[#050505]">
                            {fmtUsd(parseFloat(pos.entryPx))}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[12px] font-black ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {pnl >= 0 ? '+' : ''}{fmtUsd(pnl)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11.5px] font-black text-[#050505]">
                            {pos.leverage}×
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
