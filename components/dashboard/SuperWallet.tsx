"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Users, Settings, X, Gift, CreditCard, Wifi, Shield, Zap, Network, BarChart2 } from 'lucide-react';

import ReceiveHub from '@/components/wallet/ReceiveHub';
import QRScannerModal from '@/components/wallet/QRScannerModal';
import FiatOnRamp from '@/components/wallet/FiatOnRamp';
import PortfolioDashboard from '@/components/dashboard/PortfolioDashboard';
import WalletAnalyticsPanel from '@/components/premium/WalletAnalyticsPanel';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import ReferralDashboard from '@/components/wallet/ReferralDashboard';
import useSWR, { mutate } from 'swr';
import { useOmniInfrastructure } from '@/lib/api-client';
import AIConcierge from '@/components/wallet/AIConcierge';
import SecurityVault from '@/components/wallet/SecurityVault';
import NFCHardware from '@/components/wallet/NFCHardware';
import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletActions } from '@/components/wallet/WalletActions';
import { useRealWalletData } from '@/hooks/useRealWalletData';
import SettingsPanel from '@/components/wallet/SettingsPanel';
import AddressBook from '@/components/wallet/AddressBook';
import AccountSwitcher from '@/components/wallet/AccountSwitcher';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import WatchOnlyInput from '@/components/wallet/WatchOnlyInput';
import AppChainStatus from '@/components/dashboard/AppChainStatus';
import { getAccountColor, type WalletAccount } from '@/lib/wallet/accounts';
import { resolveENSName } from '@/lib/wallet/ens';
import { isAddress } from 'viem';
import { type NewsItem } from '@/types/wallet';

import LanguageSwitcher from '@/components/wallet/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// [PRODUCTION] Strict typing for news items from external feeds
export default function SuperWallet({ recentNews = [] }: { recentNews?: NewsItem[] }) {
    return (
        <LanguageProvider>
            <SuperWalletContent recentNews={recentNews} />
        </LanguageProvider>
    );
}

function SuperWalletContent({ recentNews = [] }: { recentNews?: NewsItem[] }) {
    const { t } = useLanguage();
    const [activeView, setActiveView] = useState<'portfolio' | 'analytics' | 'activity' | 'contacts' | 'settings' | 'referrals' | 'cards' | 'vault' | 'nfc' | 'network'>('portfolio');
    const [showWatchInput, setShowWatchInput] = useState(false);
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [accountBalances, setAccountBalances] = useState<Record<string, string>>({});

    // =========================================================================
    // INJECTED DATA HOOK — Zero-Mock Mandate
    // News endpoint injected via REGISTRY.OMNI_INFRA.news
    // =========================================================================
    const { data: newsData } = useOmniInfrastructure('news');
    const news: NewsItem[] = newsData?.news || newsData?.articles || recentNews;


    const {
        usdcBalance,
        totalBalance,
        portfolioValue,
        positions,
        transactions,
        stats,
        assets,
        perps,
        predictions,
        claimables,
        isLoading,
        isAssetsLoading,
        isHistoryLoading,
        isConnected,
        change24hUSD,
        change24hPercent,
        legendaryScore,
        strategicInsight,
        address: hookAddress,
        backendAccounts
    } = useRealWalletData(news, currentAddress);

    const [isInitialized, setIsInitialized] = useState(false);

    // 🔥 GLOBAL REACTIVE SYNC: Using SWR for watched wallets
    const { data: premiumData, mutate: globalMutate } = useSWR(
        hookAddress ? `/api/premium/watched-wallets?address=${hookAddress}` : null,
        async (url) => {
            const res = await fetch(url, {
                headers: { 'x-web3-address': hookAddress! }
            });
            return res.json();
        }
    );

    // 0. [LEGENDARY] Auto-Creation Guard: Create wallet on signup if missing
    useEffect(() => {
        const autoCreateWallet = async () => {
            // Only auto-create if authenticated and no address found yet
            if (isLoading === false && !hookAddress && isConnected === false) {
                console.log("[Auto-Creation] No managed wallet found. Initiating secure generation...");
                try {
                    const res = await fetch('/api/wallet/create', { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        console.log("[Auto-Creation] Wallet created successfully:", data.address);
                        // Trigger a global revalidation
                        mutate('/api/user/wallet');
                        window.location.reload(); // Hard reload to sync entire stack for the first time
                    }
                } catch (e) {
                    console.error("[Auto-Creation] Failed to auto-generate wallet:", e);
                }
            }
        };

        if (!isLoading) {
            autoCreateWallet();
        }
    }, [hookAddress, isLoading, isConnected]);

    // 1. Initial Load: Sync SWR data into local accounts state
    useEffect(() => {
        if (!premiumData?.wallets) return;

        const dbWallets = premiumData.wallets.map((w: any) => ({
            id: w.id,
            address: w.address,
            name: w.label,
            type: (w.isWhale || w.isSmart) ? 'WATCH_ONLY' : 'DERIVED', // Heuristic mapping
            color: getAccountColor(w.address)
        }));

        // Merge and deduplicate
        setAccounts(prev => {
            const merged = [...dbWallets];
            prev.filter(p => p.type === 'PRIMARY' || p.type === 'DERIVED').forEach(local => {
                if (!merged.some(m => m.address.toLowerCase() === local.address.toLowerCase())) {
                    merged.push(local);
                }
            });

            // Ensure primary is present, only if we have a real address
            if (hookAddress && !merged.some(m => m.address.toLowerCase() === hookAddress.toLowerCase())) {
                merged.unshift({
                    address: hookAddress,
                    name: 'Main Vault (Primary)',
                    type: 'PRIMARY' as const,
                    index: 0,
                    color: getAccountColor(hookAddress)
                });
            }
            return merged;
        });

        if (!currentAddress && dbWallets.length > 0) {
            setCurrentAddress(dbWallets[0].address);
        }
        setIsInitialized(true);
    }, [premiumData, hookAddress]);

    // 2. Persistence: Save to Storage whenever accounts change (Legacy fallback)
    useEffect(() => {
        if (isInitialized && accounts.length > 0) {
            localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
        }
    }, [accounts, isInitialized]);

    const [showReceive, setShowReceive] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Background balance fetching for all accounts to support filtering
    useEffect(() => {
        if (accounts.length === 0) return;

        const fetchAllBalances = async () => {
            const balances: Record<string, string> = {};
            await Promise.all(accounts.map(async (acc) => {
                try {
                    // [LEGENDRY PRE-WARM] Fire and forget background portfolio fetch
                    // This populates the server-side PortfolioService cache (60s TTL)
                    fetch(`/api/wallet/portfolio?address=${acc.address}`).catch(() => {});

                    const res = await fetch(`/api/wallet/portfolio?address=${acc.address}`);
                    if (res.ok) {
                        const data = await res.json();
                        // We use totalValueUsd as a proxy for 'balance' if specific native balance isn't returned
                        balances[acc.address.toLowerCase()] = safeToFixed(data.totalValueUsd, 2) || "0.00";
                    }
                } catch (e) {
                    console.error("Failed to fetch balance for", acc.address);
                }
            }));
            setAccountBalances(prev => ({ ...prev, ...balances }));
        };

        fetchAllBalances();
        // Auto-sync disabled per user request
        return () => {};
    }, [accounts.length]); // Only re-warm if account list changes length

    const handleAddAccount = async () => {        
        // [INSTITUTIONAL GRADE] Erradicación de Mocking. Ya no generamos strings falsos.
        // Llamada real al backend para generar un nuevo Managed Wallet asociado a este usuario.
        try {
            const res = await fetch('/api/wallet/create', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create real wallet');
            
            const data = await res.json();
            if (!data.address) throw new Error('No address returned');
            
            const newAccount: WalletAccount = {
                address: data.address,
                name: `Sovereign Vault ${accounts.length + 1}`,
                type: 'DERIVED',
                index: accounts.length,
                color: getAccountColor(data.address)
            };

            const updated = [...accounts, newAccount];
            setAccounts(updated);
            setCurrentAddress(data.address);
            localStorage.setItem('wallet_accounts', JSON.stringify(updated));
            
            // Force global mutation to align everything
            globalMutate();
            mutate('/api/user/wallet');
        } catch (e) {
            console.error("[CRITICAL_FAILURE] Failed to provision real managed wallet:", e);
            alert("No se pudo generar una cartera on-chain real.");
        }
    };

    const handleAddWatchWallet = async (address: string, name?: string) => {
        try {
            let resolvedAddress = address;
            let displayLabel = name;

            if (address.toLowerCase().endsWith('.eth')) {
                const resolved = await resolveENSName(address);
                if (resolved && isAddress(resolved)) {
                    resolvedAddress = resolved;
                    displayLabel = address;
                } else {
                    alert('Could not resolve ENS name.');
                    return;
                }
            } else if (!isAddress(address)) {
                alert('Please enter a valid address.');
                return;
            }

            if (accounts.some(a => a.address.toLowerCase() === resolvedAddress.toLowerCase())) {
                alert('Account already exists.');
                return;
            }

            const watchAccount: WalletAccount = {
                address: resolvedAddress,
                name: displayLabel || `Watch ${resolvedAddress.slice(0, 6)}...`,
                type: 'WATCH_ONLY',
                color: getAccountColor(resolvedAddress)
            };

            // [PERSISTENCE] Save watch wallet to premium backend
            try {
                // CSRF Handshake
                const csrfRes = await fetch('/api/auth/csrf', {
                    headers: { 'x-web3-address': hookAddress }
                });
                const { token: csrfToken } = await csrfRes.json();

                const res = await fetch('/api/premium/watched-wallets', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-web3-address': hookAddress,
                        'x-csrf-token': csrfToken
                    },
                    body: JSON.stringify({
                        address: resolvedAddress,
                        label: watchAccount.name
                    })
                });
                const data = await res.json();
                if (data.id) {
                    watchAccount.id = data.id;
                    // 🔥 INSTANT GLOBAL SYNC
                    globalMutate();
                }
            } catch (e) {
                console.error("Failed to persist watch wallet", e);
            }

            const updatedAccounts = [...accounts, watchAccount];
            setAccounts(updatedAccounts);
            setCurrentAddress(resolvedAddress);
            setShowWatchInput(false);
            localStorage.setItem('wallet_accounts', JSON.stringify(updatedAccounts));
        } catch (error) {
            alert('Failed to add wallet');
        }
    };

    const handleDeleteAccount = async (address: string) => {
        const account = accounts.find(a => a.address.toLowerCase() === address.toLowerCase());
        if (!account) return;

        if (!confirm(`Remove account "${account.name}"?`)) return;

        try {
            // If it has a DB ID, use the correct DELETE endpoint
            if (account.id) {
                // CSRF Handshake
                const csrfRes = await fetch('/api/auth/csrf', {
                    headers: { 'x-web3-address': hookAddress }
                });
                const { token: csrfToken } = await csrfRes.json();

                const res = await fetch(`/api/premium/watched-wallets?id=${account.id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-web3-address': hookAddress,
                        'x-csrf-token': csrfToken
                    }
                });
                if (!res.ok) throw new Error("Backend deletion failed");
                // 🔥 INSTANT GLOBAL SYNC
                globalMutate();
            }

            const updated = accounts.filter(a => a.address.toLowerCase() !== address.toLowerCase());
            setAccounts(updated);
            localStorage.setItem('wallet_accounts', JSON.stringify(updated));
            
            if (currentAddress.toLowerCase() === address.toLowerCase()) {
                setCurrentAddress(updated[0]?.address || hookAddress);
            }
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete account from server. It might still reappear on refresh.");
        }
    };

    const handleSwitchAccount = (address: string) => {
        setCurrentAddress(address);
    };

    // Use current address or fallback to connected address
    const displayAddress = currentAddress || hookAddress || '';

    // Always show the wallet interface
    return (
        <div className="min-h-screen bg-[#EAEADF] text-[#1F1F1F] font-sans selection:bg-[#1F1F1F] selection:text-[#EAEADF] pb-20 relative overflow-hidden">
             {/* Background Noise/Void Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
            </div>

            {/* Header Navigation */}
            <header className="px-4 py-4 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#EAEADF]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {/* Account Switcher Removed per User Request for Clean UI */}
                </div>
                
                {/* Center Tabs - ABSOLUTELY CENTERED FOR PERFECT ALIGNMENT WITH CARD */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/50 rounded-full p-1.5 border border-[#1F1F1F]/5 shadow-sm overflow-x-auto max-w-[600px] scrollbar-hide">
                    <ViewTab icon={<PieChart size={18}/>} label="Portfolio" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                    <ViewTab icon={<BarChart2 size={18}/>} label="Analytics" active={activeView==='analytics'} onClick={()=>setActiveView('analytics')} />
                    <ViewTab icon={<Network size={18} className={activeView === 'network' ? 'text-[#00f2ea]' : ''} />} label="Network" active={activeView==='network'} onClick={()=>setActiveView('network')} />
                    <ViewTab icon={<Zap size={18}/>} label="Activity" active={activeView==='activity'} onClick={()=>setActiveView('activity')} />
                    <ViewTab icon={<Gift size={18}/>} label="Referrals" active={activeView==='referrals'} onClick={()=>setActiveView('referrals')} />
                    <ViewTab icon={<Settings size={18}/>} label="Settings" active={activeView==='settings'} onClick={()=>setActiveView('settings')} />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <NotificationCenter />
                </div>
            </header>

             {/* Mobile Tab Bar (Bottom) */}
             <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-lg border border-[#1F1F1F]/5 shadow-2xl rounded-full p-2 flex gap-1">
                 <ViewTab icon={<PieChart size={20}/>} label="" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                 <ViewTab icon={<Network size={20} className={activeView === 'network' ? 'text-[#00f2ea]' : ''} />} label="" active={activeView==='network'} onClick={()=>setActiveView('network')} />
                 <ViewTab icon={<Gift size={20}/>} label="" active={activeView==='referrals'} onClick={()=>setActiveView('referrals')} />
                 <ViewTab icon={<Settings size={20}/>} label="" active={activeView==='settings'} onClick={()=>setActiveView('settings')} />
            </div>

            <main className="max-w-xl mx-auto p-4 space-y-4 relative z-10 min-h-[80vh]">

                {activeView === 'portfolio' && displayAddress && (
                    <div className="animate-fade-in space-y-12">
                        {/* Elite Analytics Section - Expanded Width */}
                        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                            <div className="max-w-6xl mx-auto px-4 pt-12">
                                <PortfolioDashboard walletAddress={displayAddress} />
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'analytics' && displayAddress && (
                    <div className="animate-fade-in space-y-6">
                        <WalletAnalyticsPanel 
                            address={displayAddress} 
                            label={accounts.find(a => a.address === displayAddress)?.name || "Wallet Analytics"}
                            onClose={() => setActiveView('portfolio')}
                        />
                    </div>
                )}

                {activeView === 'activity' && displayAddress && (
                    <div className="animate-fade-in shadow-sm bg-white p-6 rounded-2xl border border-[#1F1F1F]/5">
                        <TransactionHistory 
                            authUserId={displayAddress} 
                            transactions={transactions}
                            stats={stats}
                            isLoading={isLoading} 
                        />
                    </div>
                )}

                {activeView === 'contacts' && displayAddress && (
                    <div className="animate-fade-in">
                        <AddressBook authUserId={displayAddress} />
                    </div>
                )}

                {activeView === 'referrals' && (
                    <div className="animate-fade-in">
                        <ReferralDashboard />
                    </div>
                )}
                
                {activeView === 'vault' && (
                    <div className="animate-fade-in">
                        <SecurityVault />
                    </div>
                )}

                 {activeView === 'nfc' && (
                    <div className="animate-fade-in">
                        <NFCHardware />
                    </div>
                )}

                 {activeView === 'network' && (
                    <div className="animate-fade-in pt-8 pb-12">
                        <AppChainStatus />
                    </div>
                )}

                {activeView === 'settings' && (
                    <div className="animate-fade-in">
                        <SettingsPanel />
                    </div>
                )}
            </main>

            {/* MODALS - Outside main to avoid z-index trapping */}
            {showWatchInput && (
                <WatchOnlyInput 
                    onAdd={handleAddWatchWallet} 
                    onCancel={() => setShowWatchInput(false)} 
                />
            )}

            {showReceive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowReceive(false)}>
                    <div className="w-full max-w-4xl bg-[#EAEADF] rounded-[40px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold ml-4">Receive Assets</h2>
                            <button onClick={() => setShowReceive(false)} className="p-2 rounded-full hover:bg-black/5"><X size={24}/></button>
                        </div>
                        <ReceiveHub addresses={[
                            { network: 'Ethereum', address: displayAddress, token: 'ETH', chainId: 1 },
                            { network: 'Base', address: displayAddress, token: 'ETH', chainId: 8453 },
                            { network: 'Polygon', address: displayAddress, token: 'MATIC', chainId: 137 },
                        ]} />
                    </div>
                </div>
            )}

            <QRScannerModal 
                isOpen={showScanner} 
                onClose={() => setShowScanner(false)}
                onScan={(data) => {
                    console.log("Scanned:", data);
                    alert(`Scanned: ${data}`);
                    setShowScanner(false);
                }}
            />

            <AIConcierge 
                portfolioData={{
                    assets,
                    totalValue: parseFloat(totalBalance),
                    legendaryScore,
                    strategicInsight
                }} 
            />
        </div>
    );
}


function ViewTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
           onClick={onClick}
           className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${active ? 'bg-[#1F1F1F] text-[#EAEADF] shadow-md' : 'text-[#1F1F1F]/50 hover:bg-white/80'}`}
           title={label}
        >
            {icon}
            {active && <span className="text-xs font-bold pr-1 hidden md:block">{label}</span>}
        </button>
    )
}

