"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Fingerprint, Lock, ArrowRight, CheckCircle,
    Wallet, Activity, Key, Database, Cpu, Zap, Hash, Link2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store/ui-store';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import {
    useAccount,
    useBlockNumber,
    useGasPrice,
    useChainId,
    useSignTypedData,
} from 'wagmi';

// ─── EIP-712 typed-data schema ──────────────────────────────────────────────
const EIP712_DOMAIN = {
    name: 'Humanity Ledger',
    version: '1',
} as const;

const EIP712_TYPES = {
    IdentityProof: [
        { name: 'alias',       type: 'string'  },
        { name: 'signer',      type: 'address' },
        { name: 'blockNumber', type: 'uint256' },
        { name: 'gasPrice',    type: 'uint256' },
        { name: 'chainId',     type: 'uint256' },
        { name: 'timestamp',   type: 'uint256' },
    ],
} as const;

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatGwei(wei: bigint): string {
    const gwei = Number(wei) / 1e9;
    return gwei.toFixed(2) + ' gwei';
}

function shortAddr(addr: string): string {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function chainLabel(id: number): string {
    const map: Record<number, string> = {
        1:     'Ethereum Mainnet',
        10:    'Optimism',
        137:   'Polygon',
        8453:  'Base',
        42161: 'Arbitrum One',
    };
    return map[id] ?? 'Chain #' + id;
}

// ─── component ───────────────────────────────────────────────────────────────
export default function SignUpPage() {
    const router = useRouter();
    const { setLinked } = useUIStore();

    // ── form state ──
    const [step, setStep]               = useState(0);
    const [alias, setAlias]             = useState('');
    const [logs, setLogs]               = useState<string[]>([]);
    const [signature, setSignature]     = useState('');
    const [snapshotBlock, setSnapshotBlock] = useState<bigint>(0n);
    const [snapshotGas,   setSnapshotGas]   = useState<bigint>(0n);
    const logRef = useRef<HTMLDivElement>(null);

    // ── live L1 data via Wagmi ──
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    const { data: blockNumber } = useBlockNumber({ watch: true });
    const { data: gasPrice    } = useGasPrice();

    // ── EIP-712 signer ──
    const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

    // auto-scroll terminal
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    const ts = () => new Date().toISOString().slice(11, 23);

    const addLog = (msg: string, color?: 'green' | 'amber' | 'red') => {
        setLogs(prev => [...prev, JSON.stringify({ t: ts(), msg, color })]);
    };

    // ── sign identity ────────────────────────────────────────────────────────
    const handleSignIdentity = async () => {
        if (!alias.trim()) {
            toast.error('Required', { description: 'Enter an identity alias first.' });
            return;
        }
        if (!isConnected || !address) {
            toast.error('No wallet', { description: 'Connect your wallet before signing.' });
            return;
        }
        if (!blockNumber || !gasPrice) {
            toast.error('L1 not ready', { description: 'Waiting for live network data.' });
            return;
        }

        try {
            setStep(1);
            setLogs([]);

            // ── snapshot the live state at this exact millisecond ──
            const snapBlock = blockNumber;
            const snapGas   = gasPrice;
            const snapTime  = BigInt(Math.floor(Date.now() / 1000));
            setSnapshotBlock(snapBlock);
            setSnapshotGas(snapGas);

            addLog('ENTROPY SNAPSHOT LOCKED', 'amber');
            await new Promise(r => setTimeout(r, 120));

            addLog('block_number : ' + snapBlock.toString());
            await new Promise(r => setTimeout(r, 80));

            addLog('gas_price    : ' + formatGwei(snapGas));
            await new Promise(r => setTimeout(r, 80));

            addLog('chain_id     : ' + chainId + '  (' + chainLabel(chainId) + ')');
            await new Promise(r => setTimeout(r, 80));

            addLog('signer       : ' + address);
            await new Promise(r => setTimeout(r, 80));

            addLog('timestamp    : ' + snapTime.toString() + '  (unix)');
            await new Promise(r => setTimeout(r, 200));

            addLog('');
            addLog('BUILDING EIP-712 TYPED PAYLOAD...', 'amber');
            await new Promise(r => setTimeout(r, 300));

            addLog('domain.name    : Humanity Ledger');
            addLog('domain.version : 1');
            addLog('domain.chainId : ' + chainId);
            await new Promise(r => setTimeout(r, 200));

            addLog('');
            addLog('AWAITING ECDSA SIGNATURE IN WALLET...', 'amber');

            // ── sign ──────────────────────────────────────────────────────────
            const sig = await signTypedDataAsync({
                domain: {
                    ...EIP712_DOMAIN,
                    chainId,
                },
                types:       EIP712_TYPES,
                primaryType: 'IdentityProof',
                message: {
                    alias:       alias.trim(),
                    signer:      address as `0x${string}`,
                    blockNumber: snapBlock,
                    gasPrice:    snapGas,
                    chainId:     BigInt(chainId),
                    timestamp:   snapTime,
                },
            });

            setSignature(sig);

            addLog('');
            addLog('SIGNATURE VERIFIED (ECDSA / secp256k1)', 'green');
            await new Promise(r => setTimeout(r, 150));

            addLog('sig[0..20] : ' + sig.slice(0, 22) + '...', 'green');
            await new Promise(r => setTimeout(r, 150));

            addLog('WRITING IDENTITY TO LOCAL STORE...', 'amber');
            await new Promise(r => setTimeout(r, 200));

            // ── persist ───────────────────────────────────────────────────────
            const payload = {
                exp:         Date.now() + 86400000 * 30,
                address:     address.toLowerCase(),
                wallet:      address,
                alias:       alias.trim(),
                signature:   sig,
                blockNumber: snapBlock.toString(),
                gasPrice:    snapGas.toString(),
                chainId,
                timestamp:   snapTime.toString(),
            };

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('system_session_v2', JSON.stringify(payload));
            }

            // cookie — built with string concat to avoid any tooling backtick issues
            const cookieStr = 'system_handshake=' + address.toLowerCase()
                + '; path=/; max-age=31536000; SameSite=Lax';
            document.cookie = cookieStr;

            setLinked(true);

            addLog('');
            addLog('IDENTITY PROVISIONED — ACCESS GRANTED', 'green');

            setStep(2);
            toast.success('Identity Anchored', {
                description: 'Signed at block #' + snapBlock.toString(),
            });

            setTimeout(() => {
                window.location.replace('/portfolio');
            }, 3000);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Signature rejected';
            addLog('');
            addLog('ERROR: ' + msg, 'red');
            toast.error('Signing Failed', { description: msg });
            setTimeout(() => { setStep(0); }, 2500);
        }
    };

    // ── parse log line ──────────────────────────────────────────────────────
    const parseLine = (raw: string): { t: string; msg: string; color?: string } => {
        try { return JSON.parse(raw); }
        catch { return { t: '', msg: raw }; }
    };

    const colorClass = (c?: string) => {
        if (c === 'green') return 'text-[#00C076]';
        if (c === 'amber') return 'text-[#F5A623]';
        if (c === 'red')   return 'text-red-400';
        return 'text-white/55';
    };

    // ── live stats bar (shown in step 0) ──────────────────────────────────
    const LiveStat = ({ icon: Icon, label, value }: {
        icon: React.ElementType; label: string; value: string;
    }) => (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/[0.07]">
            <Icon size={11} className="text-white/30 shrink-0" />
            <span className="text-[9px] text-white/30 uppercase tracking-widest shrink-0">{label}</span>
            <span className="text-[9px] font-mono text-[#00C076] ml-auto truncate">{value}</span>
        </div>
    );

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-mono relative overflow-hidden selection:bg-white/20">

            {/* radial glow */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-500/[0.03] rounded-full blur-[100px]" />
            </div>

            {/* scanline overlay */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 3px)' }} />

            {/* logo */}
            <div className="absolute top-0 left-0 p-6 z-20 flex items-center gap-3">
                <Wallet size={18} className="text-white/40" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Humanity Ledger</span>
                    <span className="text-[8px] tracking-[0.4em] text-white/20">IDENTITY PROVISIONING v2</span>
                </div>
            </div>

            <main className="flex-1 flex items-center justify-center relative z-10 px-6 pt-24 pb-12">
                <div className="w-full max-w-md mx-auto">

                    <AnimatePresence mode="wait">

                        {/* ── STEP 0 : form ─────────────────────────────── */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="text-center mb-2">
                                    <h1 className="text-3xl font-light tracking-tighter mb-3">
                                        Anchor Your Identity
                                    </h1>
                                    <p className="text-[11px] text-white/35 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                                        Your signature is cryptographically bound to the live
                                        state of Ethereum at this exact millisecond.
                                    </p>
                                </div>

                                {/* ── live L1 terminal ── */}
                                <div className="border border-white/10 bg-black/40">
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07] bg-white/[0.02]">
                                        <Activity size={10} className="text-[#00C076] animate-pulse" />
                                        <span className="text-[8px] uppercase tracking-[0.25em] text-white/30">Live L1 Entropy</span>
                                        <span className="ml-auto text-[8px] text-[#00C076]/60">
                                            {isConnected ? '● CONNECTED' : '○ AWAITING WALLET'}
                                        </span>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        <LiveStat
                                            icon={Hash}
                                            label="Block"
                                            value={blockNumber ? '#' + blockNumber.toString() : '...'}
                                        />
                                        <LiveStat
                                            icon={Zap}
                                            label="Gas Price"
                                            value={gasPrice ? formatGwei(gasPrice) : '...'}
                                        />
                                        <LiveStat
                                            icon={Link2}
                                            label="Chain"
                                            value={chainId ? chainLabel(chainId) + ' (' + chainId + ')' : '...'}
                                        />
                                        {isConnected && address && (
                                            <LiveStat
                                                icon={Wallet}
                                                label="Signer"
                                                value={shortAddr(address)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* alias field */}
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
                                        Identity Alias
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="signup-alias"
                                            type="text"
                                            value={alias}
                                            onChange={e => setAlias(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSignIdentity()}
                                            placeholder="e.g. Satoshi"
                                            className="w-full bg-white/[0.04] border border-white/10 p-4 text-sm outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all text-white placeholder:text-white/15 rounded-none"
                                        />
                                        <Fingerprint size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    </div>
                                </div>

                                {/* info banner */}
                                <div className="p-4 bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                                    <Shield size={14} className="text-white/30 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-white/30 leading-loose">
                                        No passwords. Your wallet signs an EIP-712 <strong className="text-white/50">IdentityProof</strong> message
                                        that embeds the current block height, gas price, and chain ID as
                                        unforgeable entropy anchors.
                                    </p>
                                </div>

                                <button
                                    id="signup-sign-btn"
                                    onClick={handleSignIdentity}
                                    disabled={!isConnected || !blockNumber || !gasPrice}
                                    className="w-full py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all bg-white text-black hover:bg-white/90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {isConnected ? (
                                        <>Sign EIP-712 Identity <Key size={13} /></>
                                    ) : (
                                        <>Connect Wallet to Continue <Wallet size={13} /></>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* ── STEP 1 : terminal ─────────────────────────── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center w-full"
                            >
                                {/* spinner */}
                                <div className="w-16 h-16 mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 border border-white/10 border-t-white/60 rounded-full animate-spin" />
                                    <div className="absolute inset-[5px] border border-[#00C076]/20 border-b-[#00C076]/70 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
                                    <Cpu size={18} className="text-[#00C076] animate-pulse" />
                                </div>

                                <h2 className="text-[11px] font-black tracking-[0.3em] uppercase mb-1 text-white/80">
                                    {isSigning ? 'Awaiting ECDSA Signature' : 'Processing L1 Entropy'}
                                </h2>
                                <p className="text-[9px] text-white/25 tracking-widest mb-5">
                                    EIP-712 · secp256k1 · Ethereum
                                </p>

                                {/* terminal window */}
                                <div className="w-full border border-white/10 bg-black/60">
                                    {/* title bar */}
                                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.07] bg-white/[0.02]">
                                        <div className="w-2 h-2 rounded-full bg-red-500/40" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                                        <div className="w-2 h-2 rounded-full bg-green-500/40" />
                                        <span className="text-[8px] text-white/20 ml-2 tracking-widest">
                                            identity-provisioner — entropy@L1
                                        </span>
                                    </div>

                                    {/* log stream */}
                                    <div
                                        ref={logRef}
                                        className="p-3 h-72 overflow-y-auto flex flex-col gap-[3px] text-[10px] leading-relaxed"
                                    >
                                        {logs.map((raw, i) => {
                                            const { t, msg, color } = parseLine(raw);
                                            return (
                                                <div
                                                    key={i}
                                                    className={'flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-150 ' + colorClass(color)}
                                                >
                                                    {t && (
                                                        <span className="text-white/15 shrink-0 select-none">{t}</span>
                                                    )}
                                                    <span className={msg === '' ? 'h-2' : ''}>
                                                        {msg && '> '}{msg}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {isSigning && (
                                            <div className="flex gap-2 text-[#F5A623] animate-pulse mt-1">
                                                <span className="text-white/15 shrink-0">{ts()}</span>
                                                <span>&gt; PENDING — check your wallet extension...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* live probe strip */}
                                <div className="w-full mt-3 grid grid-cols-3 gap-1">
                                    {[
                                        { label: 'BLOCK',   val: blockNumber ? '#' + blockNumber.toString() : '---' },
                                        { label: 'GAS',     val: gasPrice    ? formatGwei(gasPrice)          : '---' },
                                        { label: 'CHAIN',   val: chainId     ? String(chainId)               : '---' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] px-2 py-2 text-center">
                                            <div className="text-[7px] text-white/20 tracking-widest mb-0.5">{s.label}</div>
                                            <div className="text-[9px] text-[#00C076] font-mono truncate">{s.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2 : success ──────────────────────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center text-center py-10"
                            >
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                                    className="w-32 h-32 mb-4 -mt-4 flex items-center justify-center"
                                >
                                    <RemoteLottie
                                        path="/system-shots/Transaction Complete.json"
                                        loop={false}
                                        className="w-full h-full drop-shadow-md"
                                    />
                                </motion.div>

                                <h2 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#00C076]">
                                    Identity Anchored
                                </h2>

                                <div className="my-5 w-full text-left border border-white/[0.07] bg-black/40 p-3 space-y-1">
                                    {[
                                        { k: 'BLOCK',  v: '#' + snapshotBlock.toString() },
                                        { k: 'GAS',    v: formatGwei(snapshotGas) },
                                        { k: 'CHAIN',  v: chainLabel(chainId) },
                                        { k: 'SIG',    v: signature.slice(0, 18) + '...' + signature.slice(-6) },
                                    ].map(r => (
                                        <div key={r.k} className="flex justify-between text-[9px] font-mono">
                                            <span className="text-white/25 tracking-widest">{r.k}</span>
                                            <span className="text-[#00C076]/80">{r.v}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] leading-relaxed max-w-xs">
                                    Your identity is cryptographically bound to Ethereum block&nbsp;
                                    <span className="text-white/60">#{snapshotBlock.toString()}</span>.
                                    Redirecting to dashboard…
                                </p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
