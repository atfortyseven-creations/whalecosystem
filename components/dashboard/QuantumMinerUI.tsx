"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Activity, Hash, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useWriteContract, useAccount, usePublicClient, useReadContract } from 'wagmi';
import { parseAbi, formatEther } from 'viem';

export default function QuantumMinerUI() {
    const [isMining, setIsMining] = useState(false);
    const [hashRate, setHashRate] = useState(0);
    const [totalHashes, setTotalHashes] = useState(0);
    const [latestHash, setLatestHash] = useState<string>('00000000000000000000000000000000');
    const [blockFound, setBlockFound] = useState(false);
    const [foundNonce, setFoundNonce] = useState<number | null>(null);
    const [targetDifficulty] = useState<number>(4); // Require 4 leading zeros for this demo

    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    
    // Fetch Tokenomics Data
    const { data: totalSupply } = useReadContract({
        address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as \`0x\${string}\`,
        abi: parseAbi(['function totalSupply() view returns (uint256)']),
        functionName: 'totalSupply',
    });
    
    const { data: userBalance } = useReadContract({
        address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as \`0x\${string}\`,
        abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
        functionName: 'balanceOf',
        args: [(address || "0x") as \`0x\${string}\`],
    });

    const currentSupplyFormatted = totalSupply ? Number(formatEther(totalSupply as bigint)) : 0;
    const maxSupply = 21000000;
    const userBalanceFormatted = userBalance ? Number(formatEther(userBalance as bigint)).toFixed(2) : '0.00';

    const workerRef = useRef<Worker | null>(null);

    // Initialize Web Worker for actual CPU mining without blocking the UI thread
    useEffect(() => {
        // We create an inline WebWorker blob to calculate SHA-256 natively in the CPU
        const workerCode = `
            async function sha256(buffer) {
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            function packForHashing(challengeHex, addressHex, nonceNum) {
                const buffer = new ArrayBuffer(84); // 32 + 20 + 32
                const uint8 = new Uint8Array(buffer);

                // 1. Challenge (32 bytes)
                const chalStr = challengeHex.replace('0x', '').padStart(64, '0');
                for (let i = 0; i < 32; i++) {
                    uint8[i] = parseInt(chalStr.substr(i*2, 2), 16);
                }
                
                // 2. Address (20 bytes)
                const addrStr = addressHex.replace('0x', '').padStart(40, '0');
                for (let i = 0; i < 20; i++) {
                    uint8[32 + i] = parseInt(addrStr.substr(i*2, 2), 16);
                }
                
                // 3. Nonce (32 bytes - uint256)
                const nonceBig = BigInt(nonceNum);
                for (let i = 0; i < 32; i++) {
                    const shift = BigInt((31 - i) * 8);
                    uint8[52 + i] = Number((nonceBig >> shift) & 255n);
                }
                return buffer;
            }

            let isMining = false;
            let currentChallenge = "";
            let walletAddress = "";

            self.onmessage = async function(e) {
                if (e.data.command === 'start') {
                    isMining = true;
                    currentChallenge = e.data.challenge;
                    walletAddress = e.data.wallet;
                    let nonce = Math.floor(Math.random() * 1000000);
                    let hashesThisSecond = 0;
                    let lastReportTime = Date.now();
                    const targetPrefix = '0'.repeat(e.data.difficulty);

                    while(isMining) {
                        const buffer = packForHashing(currentChallenge, walletAddress, nonce);
                        const hash = await sha256(buffer);
                        hashesThisSecond++;
                        nonce++;

                        // Check difficulty (e.g. 4 leading zeros)
                        if (hash.substring(0, e.data.difficulty) === targetPrefix) {
                            self.postMessage({ type: 'success', hash, nonce });
                            isMining = false;
                            break;
                        }

                        // Report HashRate every second
                        const now = Date.now();
                        if (now - lastReportTime >= 1000) {
                            self.postMessage({ type: 'report', hashRate: hashesThisSecond, latestHash: hash });
                            hashesThisSecond = 0;
                            lastReportTime = now;
                        }

                        // Small artificial yield to prevent full CPU lockup on some browsers
                        if (nonce % 500 === 0) {
                            await new Promise(r => setTimeout(r, 0));
                        }
                    }
                } else if (e.data.command === 'stop') {
                    isMining = false;
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        workerRef.current = new Worker(URL.createObjectURL(blob));

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'report') {
                setHashRate(e.data.hashRate);
                setTotalHashes(prev => prev + e.data.hashRate);
                setLatestHash(e.data.latestHash);
            } else if (e.data.type === 'success') {
                setIsMining(false);
                setHashRate(0);
                setLatestHash(e.data.hash);
                setFoundNonce(e.data.nonce);
                setBlockFound(true);
                toast.success('¡Bloque Cuántico Encontrado! Firma la transacción On-Chain.');
            }
        };

        return () => {
            if (workerRef.current) workerRef.current.terminate();
        };
    }, []);

    const toggleMining = () => {
        if (!isMining) {
            setBlockFound(false);
            setTotalHashes(0);
            setIsMining(true);
            toast.info('Iniciando clústeres de minería CPU...');
            // In a real app, wallet and challenge come from Web3 state/context
            workerRef.current?.postMessage({ 
                command: 'start', 
                difficulty: targetDifficulty,
                wallet: "0x8888888888888888888888888888888888888888", // To be replaced with real user address
                challenge: "0x0000000000000000000000000000000000000000000000000000000000000000" // To be replaced with contract state
            });
        } else {
            setIsMining(false);
            setHashRate(0);
            workerRef.current?.postMessage({ command: 'stop' });
            toast.warning('Minería detenida por el usuario.');
        }
    };

    const submitBlock = async () => {
        if (!foundNonce) return;
        
        try {
            const txPromise = async () => {
                const hash = await writeContractAsync({
                    address: (process.env.NEXT_PUBLIC_MINER_CONTRACT_ADDRESS || "0x") as \`0x\${string}\`,
                    abi: parseAbi(['function mine(uint256 nonce) external']),
                    functionName: 'mine',
                    args: [BigInt(foundNonce)]
                });
                if (publicClient) {
                    await publicClient.waitForTransactionReceipt({ hash });
                }
            };

            toast.promise(txPromise(), {
                loading: 'Enviando Prueba y confirmando bloque en la Mainnet...',
                success: 'Bloque validado On-Chain. Has recibido tu recompensa en QDs.',
                error: 'Error al enviar el bloque o nonce rechazado por la Mainnet.'
            });

            await txPromise();
            setBlockFound(false);
            setFoundNonce(null);
        } catch (error) {
            console.error(error);
            setBlockFound(false);
            setFoundNonce(null);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-black border border-white/20 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[150%] h-48 bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Tokenomics Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 relative z-10">
                <div>
                    <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Mi Balance QD</h3>
                    <p className="text-2xl font-mono text-white">{userBalanceFormatted} <span className="text-sm">QDs</span></p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Circulante / Hard Cap</h3>
                    <p className="text-lg font-mono text-white">
                        {currentSupplyFormatted.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {maxSupply.toLocaleString()}
                    </p>
                    <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-white h-full" style={{ width: `${(currentSupplyFormatted / maxSupply) * 100}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        {isMining && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                        <Cpu className={`text-white ${isMining ? 'animate-bounce' : ''}`} size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Nódulo Minero</h2>
                        <p className="text-xs font-bold text-white/60 tracking-widest uppercase">Proof-of-Work CPU</p>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-1">Dificultad Target</p>
                    <p className="text-xl font-mono text-white">0x{'0'.repeat(targetDifficulty)}...</p>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <Activity className="absolute right-4 top-4 text-white/5" size={48} />
                    <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-2">HashRate (CPU)</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                        {hashRate} <span className="text-sm font-medium text-white/60">H/s</span>
                    </p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <Hash className="absolute right-4 top-4 text-white/5" size={48} />
                    <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-2">Hashes Totales</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                        {totalHashes.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Terminal View */}
            <div className="bg-black border border-white/20 rounded-2xl p-4 font-mono text-xs mb-8 h-24 overflow-hidden relative flex flex-col justify-end">
                <div className="text-white/40 mb-1">&gt; QuantumMiner.exe --start</div>
                <div className="text-white/30 truncate mb-1">Target: {targetDifficulty} ceros iniciales</div>
                <AnimatePresence>
                    {isMining && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-white truncate break-all"
                        >
                            &gt; {latestHash}
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isMining && !blockFound && <div className="text-white/50 animate-pulse">&gt; _ SYSTEM IDLE</div>}
                {blockFound && <div className="text-white font-bold bg-white/20 px-2 py-1 rounded">&gt; NONCE ENCONTRADO: {latestHash}</div>}
            </div>

            {/* Controls */}
            {blockFound ? (
                <button 
                    onClick={submitBlock}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={20} /> Transmitir Bloque a Mainnet
                </button>
            ) : (
                <button 
                    onClick={toggleMining}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                        isMining 
                        ? 'bg-transparent text-white border border-white hover:bg-white/10'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    {isMining ? (
                        <><AlertTriangle size={20} /> Detener Minería</>
                    ) : (
                        <><Zap size={20} /> Iniciar Minado Cuántico</>
                    )}
                </button>
            )}
        </div>
    );
}
