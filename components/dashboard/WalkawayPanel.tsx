'use client';

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';

const WALKAWAY_ADDRESS = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a'; // Placeholder or actual deployed address
const ABI = [
    "function lastHeartbeat() view returns (uint256)",
    "function sendHeartbeat() external",
    "function checkWalkaway() external",
    "function owner() view returns (address)"
];

export const WalkawayPanel = () => {
    const [daysLeft, setDaysLeft] = useState(180);
    const [isFounder, setIsFounder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastBeat, setLastBeat] = useState<number | null>(null);

    // Initial on-chain sync
    useEffect(() => {
        const syncStatus = async () => {
            if (!(window as any).ethereum) return;
            try {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length === 0) return;
                
                const currentAddress = accounts[0].address;
                const contract = new ethers.Contract(WALKAWAY_ADDRESS, ABI, provider);
                
                const [hb, owner] = await Promise.all([
                    contract.lastHeartbeat(),
                    contract.owner()
                ]);

                const hbValue = Number(hb);
                setLastBeat(hbValue * 1000);
                
                // Calculate remaining days
                const expiry = hbValue + (180 * 24 * 60 * 60);
                const now = Math.floor(Date.now() / 1000);
                const diff = Math.max(0, expiry - now);
                setDaysLeft(Math.floor(diff / (24 * 60 * 60)));

                setIsFounder(currentAddress.toLowerCase() === owner.toLowerCase());
            } catch (e) {
                console.error("Failed to sync Walkaway contract:", e);
                // Fallback for demo if contract not deployed
                setLastBeat(Date.now() - 3600000);
            }
        };

        syncStatus();
    }, []);

    const handleHeartbeat = async () => {
        if (!(window as any).ethereum) {
            toast.error("Web3 Provider Required", { description: "Install MetaMask or use an institutional browser." });
            return;
        }

        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(WALKAWAY_ADDRESS, ABI, signer);
            
            toast.loading("Broadcasting Heartbeat Signal...", { id: "hb-load" });
            const tx = await contract.sendHeartbeat();
            await tx.wait();
            
            toast.success("Vitality Confirmed", { id: "hb-load", description: "Walkaway timer has been reset to 180 days." });
            setDaysLeft(180);
            setLastBeat(Date.now());
        } catch (error: any) {
            console.error(error);
            toast.error("Handover Failed", { id: "hb-load", description: error?.reason || "Execution failed on-chain." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-red-500/20 bg-black/60 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between border-b border-red-500/10 pb-6">
                <div className="space-y-1">
                    <CardTitle className="text-red-400/90 tracking-widest text-sm uppercase font-black flex items-center gap-2">
                        <Shield size={14} /> Walkaway Switch v3
                    </CardTitle>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        Decentralized Ownership Handover
                    </p>
                </div>
                <Badge variant="red" className="px-3 py-1 font-black opacity-80">
                    PROTECTED
                </Badge>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
                <div className="flex flex-col items-center justify-center py-6 border border-white/5 rounded-2xl bg-black/40">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-2 font-black">Time until Auto-Handover</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-red-400 tracking-tighter">
                            {daysLeft}
                        </span>
                        <span className="text-sm font-bold text-red-500/40 uppercase">Days</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400/70">
                            <AlertTriangle size={12} />
                            Governance Clause
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/40">
                            If no heartbeat is detected for 180 consecutive days, all protocol administrative privileges are automatically transferred to the community-governed multi-signature vault.
                        </p>
                    </div>

                    {isFounder ? (
                        <Button 
                            onClick={handleHeartbeat}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs h-12 gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                            Confirm Founder Vitality
                        </Button>
                    ) : (
                        <div className="text-center space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 font-black uppercase tracking-widest text-xs h-12"
                            >
                                Verify Threshold Status
                            </Button>
                            <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                                Only the founding identity can reset the timer via ECDSA signature.
                            </p>
                        </div>
                    )}
                </div>

                {lastBeat && (
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-white/20 font-bold border-t border-white/5 pt-4">
                        <span>Last Signal Trace</span>
                        <span>{new Date(lastBeat).toLocaleString()}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
