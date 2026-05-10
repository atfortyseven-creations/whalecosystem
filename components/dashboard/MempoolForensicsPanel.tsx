'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ShieldAlert, Zap, Eye, AlertTriangle, CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react';

// ── Threat Taxonomy ──────────────────────────────────────────────────────────
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export interface ForensicAlert {
  id: string;
  txHash: string;
  from: string;
  to: string;
  value: string;       // ETH
  gasPrice: string;    // Gwei
  threatLevel: ThreatLevel;
  threatType: string;
  reason: string;
  timestamp: Date;
  chain: string;
  contractFunctions?: string[];
}

// ── Known drainer function selectors (4-byte method IDs) ───────────────────
// Source: Forta, MevBlocker, and community research
const DRAINER_SELECTORS: Record<string, string> = {
  '0x095ea7b3': 'approve() — Unlimited token approval (common in phishing)',
  '0xa22cb465': 'setApprovalForAll() — NFT blanket approval (common in drainer kits)',
  '0x23b872dd': 'transferFrom() — Initiating pull transfer without user consent',
  '0x42842e0e': 'safeTransferFrom() — Possible NFT drainer pattern',
  '0x1cff79cd': 'execute() — Arbitrary execution delegate (high risk)',
  '0x3593564c': 'execute() — Uniswap Universal Router (verify legitimacy)',
  '0xac9650d8': 'multicall() — Batch execution (verify all nested calls)',
};

// ── Known malicious contract fragments (simplified heuristics) ─────────────
const MEV_BOT_PATTERNS = ['0x000000000', '0xEeeeeE', 'sandwich'];
const PHISHING_KEYWORDS = ['Claim', 'Reward', 'Airdrop', 'FreeMint', 'Approve'];

// ── Threat scoring engine ───────────────────────────────────────────────────
function scoreThreat(tx: any): { level: ThreatLevel; type: string; reason: string; functions: string[] } {
  const flags: string[] = [];
  const detectedFunctions: string[] = [];
  let score = 0;

  const inputData: string = tx.input ?? tx.data ?? '0x';
  const selector = inputData.slice(0, 10).toLowerCase();

  // 1. Check against known drainer selectors
  if (DRAINER_SELECTORS[selector]) {
    const desc = DRAINER_SELECTORS[selector];
    detectedFunctions.push(desc);
    if (selector === '0x095ea7b3' || selector === '0xa22cb465') {
      score += 70;
      flags.push('Approval function detected — verify contract is legitimate');
    } else if (selector === '0x1cff79cd') {
      score += 90;
      flags.push('Arbitrary execute() call — extremely high drainer risk');
    } else {
      score += 30;
      flags.push(`Known function: ${desc}`);
    }
  }

  // 2. Gas price anomaly (potential frontrun / MEV sandwich)
  const gasGwei = parseFloat(tx.gasPrice ?? '0') / 1e9;
  if (gasGwei > 200) {
    score += 40;
    flags.push(`Abnormal gas price: ${gasGwei.toFixed(1)} Gwei — possible MEV priority bribe`);
  }

  // 3. Zero-value transaction with input data (typical of approval phishing)
  const valueEth = parseFloat(tx.value ?? '0') / 1e18;
  if (valueEth === 0 && inputData !== '0x' && inputData.length > 10) {
    score += 20;
    flags.push('Zero ETH value with contract call — typical of token approval phishing');
  }

  // 4. To-address pattern matching
  const toAddr = (tx.to ?? '').toLowerCase();
  if (MEV_BOT_PATTERNS.some(p => toAddr.startsWith(p.toLowerCase()))) {
    score += 50;
    flags.push('Destination matches known MEV bot address pattern');
  }

  // 5. Derive threat level from score
  let level: ThreatLevel = 'SAFE';
  if (score >= 90) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 35) level = 'MEDIUM';
  else if (score >= 15) level = 'LOW';

  const type = score >= 60
    ? detectedFunctions[0]?.includes('approval') || detectedFunctions[0]?.includes('Approval')
      ? 'Phishing / Drainer Kit'
      : 'MEV Sandwich / Frontrun'
    : score >= 15 ? 'Suspicious Pattern' : 'Normal Transaction';

  return {
    level,
    type,
    reason: flags.length > 0 ? flags.join(' | ') : 'No threat indicators detected',
    functions: detectedFunctions,
  };
}

// ── Threat level styling ────────────────────────────────────────────────────
const THREAT_CONFIG: Record<ThreatLevel, { label: string; color: string; bg: string; border: string; icon: any }> = {
  CRITICAL: { label: 'CRITICAL', color: '#FF1744', bg: '#FFF0F0', border: '#FF174425', icon: XCircle },
  HIGH:     { label: 'HIGH',     color: '#FF6D00', bg: '#FFF5F0', border: '#FF6D0025', icon: AlertTriangle },
  MEDIUM:   { label: 'MEDIUM',   color: '#FFB300', bg: '#FFFBF0', border: '#FFB30025', icon: AlertTriangle },
  LOW:      { label: 'LOW',      color: '#00897B', bg: '#F0FAFA', border: '#00897B25', icon: Eye },
  SAFE:     { label: 'SAFE',     color: '#43A047', bg: '#F0FAF0', border: '#43A04725', icon: CheckCircle },
};

const truncAddr = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—';
const truncHash = (h: string) => h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '—';

// ── Chains to monitor ───────────────────────────────────────────────────────
const CHAINS = [
  { id: 'eth', label: 'Ethereum', rpc: process.env.NEXT_PUBLIC_ETH_RPC_URL ?? 'https://eth.llamarpc.com' },
  { id: 'op',  label: 'Optimism', rpc: process.env.NEXT_PUBLIC_OP_RPC_URL  ?? 'https://mainnet.optimism.io' },
];

export function MempoolForensicsPanel() {
  const { address } = useAccount();
  const [alerts, setAlerts] = useState<ForensicAlert[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [selectedChain, setSelectedChain] = useState('eth');
  const [filter, setFilter] = useState<ThreatLevel | 'ALL'>('ALL');
  const [scanCount, setScanCount] = useState(0);
  const [threatCount, setThreatCount] = useState({ CRITICAL: 0, HIGH: 0, MEDIUM: 0 });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch pending transactions from our backend mempool proxy
  const scanMempool = useCallback(async () => {
    try {
      const res = await fetch(`/api/mempool?chain=${selectedChain}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      const txs: any[] = data.transactions ?? data.result ?? [];

      setScanCount(c => c + txs.length);

      const newAlerts: ForensicAlert[] = [];
      for (const tx of txs) {
        const { level, type, reason, functions } = scoreThreat(tx);
        // Only store alerts that are not SAFE to avoid log flood
        if (level === 'SAFE') continue;

        const alert: ForensicAlert = {
          id: tx.hash ?? Math.random().toString(36).slice(2),
          txHash: tx.hash ?? '0x000…',
          from: tx.from ?? '0x000…',
          to: tx.to ?? '0x000…',
          value: ((parseFloat(tx.value ?? '0') / 1e18).toFixed(4)),
          gasPrice: ((parseFloat(tx.gasPrice ?? '0') / 1e9).toFixed(2)),
          threatLevel: level,
          threatType: type,
          reason,
          timestamp: new Date(),
          chain: selectedChain,
          contractFunctions: functions,
        };
        newAlerts.push(alert);
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 200)); // cap at 200 entries
        setThreatCount(prev => ({
          CRITICAL: prev.CRITICAL + newAlerts.filter(a => a.threatLevel === 'CRITICAL').length,
          HIGH: prev.HIGH + newAlerts.filter(a => a.threatLevel === 'HIGH').length,
          MEDIUM: prev.MEDIUM + newAlerts.filter(a => a.threatLevel === 'MEDIUM').length,
        }));
      }
    } catch (err) {
      // Graceful degradation
      console.warn('[Forensics] Mempool scan failed:', err);
    }
  }, [selectedChain]);

  // Start / stop the forensics engine
  useEffect(() => {
    if (isActive) {
      scanMempool(); // immediate first scan
      pollingRef.current = setInterval(scanMempool, 5_000); // every 5s
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [isActive, scanMempool]);

  const filteredAlerts = filter === 'ALL'
    ? alerts
    : alerts.filter(a => a.threatLevel === filter);

  return (
    <div className="flex flex-col gap-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Chain selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-black/[0.04]">
          {CHAINS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChain(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedChain === c.id ? 'bg-white shadow-sm text-[#050505]' : 'text-black/40'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filter by threat level */}
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all border ${
                filter === lvl
                  ? lvl === 'ALL'
                    ? 'bg-[#050505] text-white border-[#050505]'
                    : `text-white border-transparent`
                  : 'bg-transparent text-black/40 border-black/10 hover:border-black/20'
              }`}
              style={filter === lvl && lvl !== 'ALL' ? {
                backgroundColor: THREAT_CONFIG[lvl].color,
                borderColor: THREAT_CONFIG[lvl].color,
              } : {}}
            >
              {lvl} {lvl !== 'ALL' && threatCount[lvl as keyof typeof threatCount] !== undefined
                ? `(${threatCount[lvl as keyof typeof threatCount]})`
                : ''}
            </button>
          ))}
        </div>

        {/* Engine toggle */}
        <button
          onClick={() => setIsActive(a => !a)}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
            isActive
              ? 'bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/20'
              : 'bg-[#050505] text-white hover:bg-[#1a1a1a]'
          }`}
        >
          {isActive ? (
            <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Stop Engine</>
          ) : (
            <><Zap size={12} />Start Forensics</>
          )}
        </button>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Transactions Scanned', value: scanCount.toLocaleString(), icon: Activity, color: '#050505' },
          { label: 'Critical Threats', value: threatCount.CRITICAL, icon: XCircle, color: '#FF1744' },
          { label: 'High Threats', value: threatCount.HIGH, icon: AlertTriangle, color: '#FF6D00' },
          { label: 'Medium Threats', value: threatCount.MEDIUM, icon: Eye, color: '#FFB300' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-black/[0.07] bg-white/60 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              <Icon size={14} style={{ color }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[18px] font-black text-[#050505] leading-none">{value}</p>
              <p className="text-[9.5px] text-black/40 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert feed */}
      <div className="rounded-2xl border border-black/[0.07] overflow-hidden bg-white/40">
        {/* Table header */}
        <div className="grid grid-cols-[90px_130px_130px_80px_1fr_100px] gap-3 px-5 py-3 border-b border-black/[0.06] bg-[#FAFAF9]">
          {['Threat', 'TX Hash', 'From', 'Value', 'Reason', 'Time'].map(h => (
            <span key={h} className="text-[9px] font-black uppercase tracking-[0.22em] text-black/35">{h}</span>
          ))}
        </div>

        {/* Alert rows */}
        {!isActive && alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/[0.04] flex items-center justify-center">
              <ShieldAlert size={22} className="text-black/20" strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-black text-[#050505]/70">Forensics Engine Offline</p>
              <p className="text-[11px] text-black/30 mt-1">Activate to begin real-time mempool analysis</p>
            </div>
          </div>
        ) : isActive && alerts.length === 0 ? (
          <div className="flex items-center justify-center py-12 gap-3 text-black/30">
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-[11px] font-medium">Scanning mempool for threats…</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-black/30">
            <span className="text-[11px] font-medium">No alerts match the current filter</span>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[480px]">
            {filteredAlerts.map((alert) => {
              const cfg = THREAT_CONFIG[alert.threatLevel];
              const ThreatIcon = cfg.icon;
              return (
                <div
                  key={alert.id}
                  className="grid grid-cols-[90px_130px_130px_80px_1fr_100px] gap-3 px-5 py-3 border-b border-black/[0.04] hover:bg-black/[0.01] transition-colors items-center"
                  style={{ borderLeft: `3px solid ${cfg.color}` }}
                >
                  {/* Threat level badge */}
                  <div className="flex items-center gap-1.5">
                    <ThreatIcon size={11} style={{ color: cfg.color }} />
                    <span className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* TX hash */}
                  <a
                    href={`https://${alert.chain === 'op' ? 'optimistic.' : ''}etherscan.io/tx/${alert.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10.5px] font-mono text-[#050505] hover:underline"
                  >
                    {truncHash(alert.txHash)}
                  </a>

                  {/* From */}
                  <span className="text-[10.5px] font-mono text-black/50">{truncAddr(alert.from)}</span>

                  {/* Value */}
                  <span className="text-[10.5px] font-bold text-[#050505]">{alert.value} ETH</span>

                  {/* Reason */}
                  <span className="text-[10px] text-black/50 leading-snug truncate" title={alert.reason}>
                    {alert.threatType} — {alert.reason.split(' | ')[0]}
                  </span>

                  {/* Time */}
                  <span className="text-[10px] font-mono text-black/30">
                    {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
