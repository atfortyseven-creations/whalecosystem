import React, { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { toast } from 'sonner';
import { Settings, Lock, Unlock, Copy, Key, Shield, ShieldCheck, ShieldAlert, Check, Plus, Trash2, Globe, Wifi } from 'lucide-react';
import { NETWORKS, NetworkId } from '@/lib/store/wallet-store';

export function SettingsView({ onBack }: { onBack: () => void }) {
    const { address, privateKey, mnemonic, isLocked, passwordHash, setupPassword, lockVault, contacts, addContact, removeContact, activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl } = useWalletStore();
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'NETWORKS' | 'CONTACTS' | 'SITES' | 'SNAPS'>('SECURITY');

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center pt-16 pb-12 overflow-y-auto selection:bg-black selection:text-white">
            <div className="w-full max-w-[480px] px-6">
                <header className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="text-black/40 hover:text-black uppercase tracking-widest text-[10px] font-bold">Close</button>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2"><Settings size={14}/> System Settings</h2>
                    <div className="w-8"></div>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-black/10 mb-8 overflow-x-auto">
                    {['SECURITY', 'GENERAL', 'NETWORKS', 'CONTACTS', 'SITES', 'SNAPS'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-black/30 hover:text-black/60'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'SECURITY' && (
                    <SecurityTab 
                        passwordHash={passwordHash} 
                        setupPassword={setupPassword} 
                        lockVault={lockVault}
                        privateKey={privateKey}
                        mnemonic={mnemonic}
                    />
                )}
                {activeTab === 'GENERAL' && (
                    <div className="text-center py-12 text-black/40 text-[10px] uppercase tracking-widest border border-black/10">
                        General settings coming soon.
                    </div>
                )}
                {activeTab === 'NETWORKS' && (
                    <NetworkTab 
                        activeNetwork={activeNetwork}
                        setNetwork={setNetwork}
                        customRpcUrl={customRpcUrl}
                        setCustomRpcUrl={setCustomRpcUrl}
                    />
                )}
                {activeTab === 'CONTACTS' && (
                    <ContactsTab 
                        contacts={contacts}
                        addContact={addContact}
                        removeContact={removeContact}
                    />
                )}
                {activeTab === 'SITES' && (
                    <ConnectedSitesTab />
                )}
                {activeTab === 'SNAPS' && (
                    <SnapsTab />
                )}
            </div>
        </div>
    );
}

function SecurityTab({ passwordHash, setupPassword, lockVault, privateKey, mnemonic }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [showPk, setShowPk] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    if (!passwordHash) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-6 text-center">
                    <ShieldAlert size={32} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2">Vault Unsecured</h3>
                    <p className="text-red-500/80 text-[10px] leading-relaxed mb-6">Your keys are currently stored in plaintext. Set a master password to enable AES-256-GCM encryption.</p>
                    
                    <input 
                        type="password"
                        placeholder="Master Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-red-200 text-black px-4 py-3 text-center tracking-widest text-xs mb-3 focus:outline-none focus:border-red-500"
                    />
                    <button 
                        onClick={() => setupPassword(newPassword)}
                        disabled={!newPassword || newPassword.length < 6}
                        className="w-full bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] py-4 disabled:opacity-50"
                    >
                        Encrypt Vault Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-green-600" />
                    <span className="text-green-700 font-bold uppercase tracking-widest text-[10px]">Vault Secured (AES-256)</span>
                </div>
                <button onClick={lockVault} className="text-[10px] uppercase font-bold tracking-widest text-green-700 bg-green-200/50 px-3 py-1.5 rounded-sm hover:bg-green-200 transition-colors">
                    Lock Now
                </button>
            </div>

            <div className="border border-black/10 p-6 space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Secret Entropy</h3>
                
                {privateKey && (
                    <div className="pt-4 border-t border-black/10">
                        <button onClick={() => setShowPk(!showPk)} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black/60 hover:text-black transition-colors mb-2">
                            {showPk ? <Unlock size={12} /> : <Lock size={12} />}
                            {showPk ? "Hide Private Key" : "Reveal Private Key"}
                        </button>
                        {showPk && (
                            <div className="bg-black text-white p-4 font-mono text-[10px] break-all border border-black/20 selection:bg-white/20 relative group">
                                {privateKey}
                                <button onClick={() => { navigator.clipboard.writeText(privateKey); toast.success("Key Copied"); }} className="absolute top-2 right-2 opacity-30 hover:opacity-100">
                                    <Copy size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {mnemonic && (
                    <div className="pt-4 border-t border-black/10">
                        <button onClick={() => setShowMnemonic(!showMnemonic)} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black/60 hover:text-black transition-colors mb-2">
                            {showMnemonic ? <Unlock size={12} /> : <Lock size={12} />}
                            {showMnemonic ? "Hide Seed Phrase" : "Reveal Seed Phrase"}
                        </button>
                        {showMnemonic && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {mnemonic.split(' ').map((word: string, i: number) => (
                                    <div key={i} className="border border-black/10 p-2 flex items-center gap-2 bg-black/5">
                                        <span className="text-[8px] text-black/40 w-3">{i + 1}.</span>
                                        <span className="text-[10px] font-bold tracking-widest text-black uppercase">{word}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function NetworkTab({ activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl }: any) {
    const [rpcInput, setRpcInput] = useState(customRpcUrl || '');

    return (
        <div className="space-y-6">
            <div className="border border-black/10 p-6 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2 mb-4"><Globe size={12}/> Select Network</h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(NETWORKS).map(([id, net]) => (
                        <button
                            key={id}
                            onClick={() => setNetwork(id)}
                            className={`p-3 text-[10px] uppercase font-bold tracking-widest border text-left flex items-center justify-between ${activeNetwork === id ? 'border-black bg-black text-white' : 'border-black/10 text-black/40 hover:border-black/30'}`}
                        >
                            {net.name}
                            {activeNetwork === id && <Check size={12} />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-black/10 p-6 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2 mb-4"><Wifi size={12}/> Custom RPC Node</h3>
                <p className="text-[10px] text-black/50 leading-relaxed mb-4">Override the default public RPC with your own Alchemy/Infura private node for better resilience.</p>
                
                <input 
                    type="text"
                    placeholder="https://..."
                    value={rpcInput}
                    onChange={e => setRpcInput(e.target.value)}
                    className="w-full bg-black/5 border border-black/10 text-black px-4 py-3 text-[10px] font-mono tracking-widest mb-3 focus:outline-none focus:border-black"
                />
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCustomRpcUrl(rpcInput)}
                        disabled={!rpcInput.startsWith('http')}
                        className="flex-1 bg-black text-white font-bold uppercase tracking-widest text-[10px] py-3 disabled:opacity-50"
                    >
                        Save RPC
                    </button>
                    <button 
                        onClick={() => { setRpcInput(''); setCustomRpcUrl(null); }}
                        className="px-4 border border-black/10 text-black/40 font-bold uppercase tracking-widest text-[10px] hover:bg-black/5"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

function ContactsTab({ contacts, addContact, removeContact }: any) {
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');

    return (
        <div className="space-y-6">
            <div className="border border-black/10 p-6 space-y-4 bg-black/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4">Add Contact</h3>
                <input 
                    type="text"
                    placeholder="Label (e.g. OTC Desk)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-white border border-black/10 text-black px-4 py-3 text-[10px] font-bold tracking-widest focus:outline-none focus:border-black"
                />
                <input 
                    type="text"
                    placeholder="0x..."
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    className="w-full bg-white border border-black/10 text-black px-4 py-3 text-[10px] font-mono focus:outline-none focus:border-black"
                />
                <button 
                    onClick={() => {
                        addContact(newName, newAddress);
                        setNewName('');
                        setNewAddress('');
                    }}
                    disabled={!newName || !newAddress.startsWith('0x')}
                    className="w-full bg-black text-white font-bold uppercase tracking-widest text-[10px] py-3 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Plus size={12}/> Save Address
                </button>
            </div>

            <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4 px-2">Saved Addresses</h3>
                {contacts.length === 0 ? (
                    <div className="text-center py-6 text-black/30 text-[10px] uppercase tracking-widest border border-black/10 border-dashed">
                        Address book is empty
                    </div>
                ) : (
                    contacts.map((c: any) => (
                        <div key={c.address} className="border border-black/10 p-4 flex items-center justify-between group">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-black mb-1">{c.name}</div>
                                <div className="text-[10px] font-mono text-black/50">{c.address.slice(0, 8)}...{c.address.slice(-6)}</div>
                            </div>
                            <button onClick={() => removeContact(c.address)} className="text-red-500 opacity-50 hover:opacity-100 p-2">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function ConnectedSitesTab() {
    const [sites, setSites] = useState([
        { domain: 'app.uniswap.org', icon: '', connectedAt: '2 days ago' },
        { domain: 'polymarket.com', icon: '', connectedAt: '5 hours ago' },
        { domain: 'opensea.io', icon: '', connectedAt: '1 week ago' }
    ]);

    const removeSite = (domain: string) => {
        setSites(sites.filter(s => s.domain !== domain));
        toast.success("Disconnected from " + domain);
    };

    return (
        <div className="space-y-6">
            <div className="border border-black/10 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Globe size={14} className="text-black/40" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Connected Sites</h3>
                </div>
                <p className="text-[10px] text-black/50 leading-relaxed mb-6">These are the external dApps and websites that currently have permission to view your account address and request signatures.</p>
                
                {sites.length === 0 ? (
                    <div className="text-center py-8 border border-black/10 border-dashed text-black/30 text-[10px] uppercase tracking-widest">
                        No connected sites
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sites.map(site => (
                            <div key={site.domain} className="flex items-center justify-between p-4 border border-black/10 hover:border-black/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-lg">
                                        {site.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-black">{site.domain}</div>
                                        <div className="text-[9px] uppercase tracking-widest text-black/40 mt-1">Connected {site.connectedAt}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeSite(site.domain)}
                                    className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Disconnect"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SnapsTab() {
    return (
        <div className="space-y-6">
            <div className="border border-black/10 p-6 space-y-4 bg-black/5 text-center">
                <div className="w-12 h-12 rounded-full border border-black/20 bg-white mx-auto flex items-center justify-center text-lg mb-4">
                    
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-black">Snaps & Plugins</h3>
                <p className="text-[10px] text-black/50 leading-relaxed max-w-[280px] mx-auto">
                    Extend your wallet's functionality with third-party Snaps. Add support for non-EVM chains, custom security insights, and new notifications.
                </p>
                <div className="pt-4">
                    <button className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black/90 transition-colors">
                        Discover Snaps
                    </button>
                </div>
            </div>

            <div className="border border-black/10 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4">Installed Snaps</h3>
                <div className="text-center py-8 border border-black/10 border-dashed text-black/30 text-[10px] uppercase tracking-widest bg-white">
                    No snaps installed
                </div>
            </div>
        </div>
    );
}
