"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, User, Fingerprint, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    // Read address from sovereign cookie — same source of truth as the forum.
    // wagmi's useAccount may not have reconnected yet, but the cookie is always set.
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
        const addr = match?.[1]?.toLowerCase() ?? null;
        setAddress(addr);
        setIsConnected(!!addr);
    }, [isOpen]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (isOpen && address) {
            fetchProfile();
        }
    }, [isOpen, address]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/user/profile?walletAddress=${address}`);
            const data = await res.json();
            if (data.success && data.data) {
                setDisplayName(data.data.displayName || '');
                setAvatarUrl(data.data.avatarUrl || '');
                setBio(data.data.bio || '');
            }
        } catch (e) {
            console.error('Failed to fetch profile', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!address) {
            toast.error("Connect wallet to save profile.");
            return;
        }

        setIsSaving(true);
        const tid = toast.loading("Encrypting and saving profile data...");
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    displayName,
                    avatarUrl,
                    bio
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile fully synchronized.", { id: tid });
                onClose();
            } else {
                toast.error(data.error || "Failed to update profile.", { id: tid });
            }
        } catch (e) {
            toast.error("Network error.", { id: tid });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ y: 20, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 20, scale: 0.95 }}
                    className="w-full max-w-lg bg-white border border-[#E5E5E5] rounded shadow-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                        <div className="flex items-center gap-3">
                            <Fingerprint size={18} className="text-[#050505]" />
                            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#050505]">
                                IDENTITY CONFIGURATION
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-[#E5E5E5] rounded transition-colors text-[#888888] hover:text-[#050505]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-8">
                        {!isConnected ? (
                            <div className="text-center py-10 space-y-4">
                                <User size={48} className="mx-auto text-[#E5E5E5]" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888888]">
                                    WALLET CONNECTION REQUIRED
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-[#888888]" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full border border-[#E5E5E5] overflow-hidden bg-[#FAF9F6] flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img 
                                                    src={avatarUrl} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                                                />
                                            ) : (
                                                <User size={32} className="text-[#888888]" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] mb-2">Avatar URL</label>
                                        <input 
                                            type="text" 
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://example.com/avatar.png"
                                            className="w-full p-3 border border-[#E5E5E5] rounded text-[12px] font-mono focus:border-[#050505] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] mb-2">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Sovereign Identity"
                                            maxLength={50}
                                            className="w-full p-3 border border-[#E5E5E5] rounded text-[14px] font-bold focus:border-[#050505] outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] mb-2">Bio / Status</label>
                                        <textarea 
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Enter your cryptographic status..."
                                            maxLength={250}
                                            className="w-full p-3 border border-[#E5E5E5] rounded text-[12px] font-mono h-24 resize-none focus:border-[#050505] outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-[#E5E5E5] bg-[#FAF9F6] flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={!isConnected || isSaving}
                            className="bg-[#050505] text-white px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#888888] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'SYNCING...' : 'SAVE IDENTITY'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
