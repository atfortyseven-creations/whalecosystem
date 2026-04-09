"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Monitor } from 'lucide-react';

const COMMON_FAQS = [
  { q: "What is Whale Alert Network (HumanIDFi)?", a: "It is an institutional-grade, privacy-first on-chain intelligence platform that runs entirely on your local machine (Sovereign Vault), preventing third-party tracking." },
  { q: "Do I need to create an account?", a: "No. Authentication is handled via a Zero-Knowledge circuit and cryptographic signature from your wallet. We do not store your email or password." },
  { q: "What is the Sovereign Vault?", a: "A local daemon process running on your machine. It ensures all graph-pruning, aggregation, and querying happens in your local RAM." },
  { q: "What are EVM Thermodynamics?", a: "A methodology we use to measure the density and frequency of smart contract interactions (like EIP-2929 memory paths) to predict institutional accumulation before price action." },
  { q: "How much RAM is required?", a: "We recommend 8GB for complete mainnet indexing, or 4GB if running in LITE_MODE." },
  { q: "Is Base L2 supported?", a: "Yes, Base is natively integrated with mempool sonar running on 500ms intervals." },
  { q: "Do you store my portolio data?", a: "Absolutely not. All portfolio querying happens locally in the terminal. No portfolio data is ever transmitted to a central server." },
  { q: "What is a Golden Ticket?", a: "A permanent, zero-knowledge verifiable credential (NFT) that grants unrestricted local intelligence unlocking without doxing your main address." },
  { q: "How do I start the Local Worker?", a: "Run SovereignVault_RUN.bat on Windows, or use 'npm run dev' connected to your local Neo4j/Postgres instances." },
  { q: "Why use Aztec Network?", a: "To allow fractional rollups of intelligence data and verification processes while maintaining strict stealth protocols." }
];

export default function FAQPage() {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
        <div style={{ backgroundColor: "#020202", minHeight: "100vh" }} className="w-full font-sans text-[#E0E0E0] selection:bg-[#D4AF37]/30">
            <div className="w-full max-w-[900px] mx-auto pt-32 pb-40 px-6">
                
                <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] tracking-[0.4em] uppercase mb-8">
                    Database Query • System Archives
                </div>
                
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-5xl md:text-6xl font-light tracking-tight mb-16 text-white flex items-center gap-4">
                    <HelpCircle size={48} style={{ color: "#D4AF37" }} />
                    Frequently Asked Questions
                </h1>

                <div className="flex flex-col gap-4">
                    {COMMON_FAQS.map((faq, idx) => (
                        <div 
                            key={idx} 
                            style={{ backgroundColor: "rgba(10, 12, 15, 0.8)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
                            className="rounded-lg overflow-hidden transition-all duration-300"
                        >
                            <button 
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between outline-none"
                            >
                                <span className="font-medium text-lg leading-snug pr-8" style={{ color: openIdx === idx ? "#D4AF37" : "#F5F5F5" }}>
                                    {faq.q}
                                </span>
                                <ChevronDown 
                                    size={20} 
                                    className={`transition-transform duration-300 ${openIdx === idx ? 'rotate-180 text-[#D4AF37]' : 'text-[#8A94A6]'}`} 
                                />
                            </button>
                            
                            <div 
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out`}
                                style={{ 
                                    maxHeight: openIdx === idx ? '200px' : '0px',
                                    opacity: openIdx === idx ? 1 : 0,
                                    paddingBottom: openIdx === idx ? '1.25rem' : '0'
                                }}
                            >
                                <p style={{ color: "#8A94A6" }} className="font-light leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 p-8 rounded-xl border flex flex-col md:flex-row items-center gap-8 justify-between" style={{ backgroundColor: "#0A0C0F", borderColor: "#D4AF3720" }}>
                    <div>
                        <h3 className="text-xl font-medium text-white mb-2">Still have questions?</h3>
                        <p className="text-[#8A94A6] font-light">Join the community on Discord to discuss technical implementations.</p>
                    </div>
                    <Monitor size={32} style={{ color: "#D4AF37" }} />
                </div>
            </div>
        </div>
    );
}
