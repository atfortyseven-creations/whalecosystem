import DocLayout from '@/components/layout/DocLayout';
import { Network, Smartphone, KeyRound, Shield, MessageSquare, HardDrive, Scan, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ArchitecturePage() {
    return (
        <DocLayout
            title="System Architecture Guide"
            description="A comprehensive technical breakdown of how Whale Alert Network operates under the hood, ensuring security, privacy, and seamless cross-device synchronization."
            lastUpdated="May 25, 2026"
            category="Technical"
        >
            <div className="space-y-16 text-[#050505]">
                {/* 1. What this page explains */}
                <section>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">1. What This Page Explains</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Welcome to the Whale Alert Network Architecture Guide. This document provides a transparent, in-depth explanation of the technological infrastructure that powers our ecosystem. Unlike traditional web applications that rely on centralized databases to manage user identities and data, our platform is built on decentralized protocols, cryptographic verification, and local execution environments.
                        </p>
                        <p>
                            Whale Alert Network operates as a <strong>non-custodial</strong> browser and mobile interface, available as a Progressive Web App (PWA) and as native iOS and Android applications. We never hold, custody, or have access to your private keys at any point. Here, you will learn exactly how your wallet connects to our systems, how we manage sessions securely without passwords, how our cross-device QR synchronization works, and precisely what data never leaves your personal device.
                        </p>
                    </div>
                </section>

                {/* 2. Connecting your wallet */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <Network size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">2. Connecting Your Wallet</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            The core of our authentication system replaces traditional username/password combinations with cryptographic wallet signatures. When you click "Connect Wallet," our frontend interface (built with React and Viem) establishes a secure communication channel with your browser extension (e.g., MetaMask) or mobile wallet (via WalletConnect).
                        </p>
                        <p>
                            We request a cryptographic signature of a specific, time-stamped message. This signature proves that you control the private key associated with your public address without ever exposing the private key to our servers. Once the signature is verified, your public address becomes your unique identifier within our ecosystem.
                        </p>
                    </div>
                </section>

                {/* 3. Sessions, cookies, and API verification */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505]">
                            <KeyRound size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">3. Sessions, Cookies, and API Verification</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Once your wallet signature is cryptographically verified on our backend, we issue a strictly scoped JSON Web Token (JWT). This token is securely stored in an HTTP-only, secure cookie (`system_handshake`). Because the cookie is HTTP-only, it is entirely inaccessible to client-side JavaScript, rendering it immune to Cross-Site Scripting (XSS) attacks.
                        </p>
                        <p>
                            Every subsequent request you make to our internal APIs (such as retrieving premium analytics or accessing your secure chat) includes this cookie automatically. Our edge network verifies the JWT's signature against our internal public keys, checks its expiration, and authorizes the request in milliseconds, ensuring a seamless yet highly secure session.
                        </p>
                    </div>
                </section>

                {/* 4. QR code: linking phone and desktop */}
                <section className="bg-[#050505] text-white p-10 md:p-14 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                            <Smartphone size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">4. QR Code: Linking Phone and Desktop</h2>
                    </div>
                    <div className="prose prose-lg prose-invert max-w-none text-white/70 space-y-6">
                        <p>
                            To provide a frictionless multi-device experience, we developed a proprietary QR-based handshake protocol using Elliptic Curve Diffie-Hellman (ECDH) key exchange. When you wish to log into your desktop using your mobile device:
                        </p>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>The desktop generates an ephemeral public/private keypair and displays a QR code containing the public key and a unique session UUID.</li>
                            <li>Your mobile device (which is already authenticated) scans the QR code.</li>
                            <li>The mobile device generates its own ephemeral keypair and uses ECDH to derive a shared secret with the desktop's public key.</li>
                            <li>The mobile device encrypts your active session JWT using AES-GCM and the shared secret, then sends this encrypted payload to our signaling server via the UUID.</li>
                            <li>The desktop polls the signaling server, receives the encrypted payload, and decrypts it locally using its ephemeral private key, seamlessly logging you in without the JWT ever being exposed in transit.</li>
                        </ul>
                    </div>
                </section>

                {/* 5. Whale Chat and XMTP */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505]">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">5. Whale Chat and XMTP Integration</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Whale Chat is powered by the Extensible Message Transport Protocol (XMTP), an open network and standard for secure, private Web3 messaging. Unlike traditional messaging apps, messages sent over Whale Chat are fully end-to-end encrypted (E2EE) and tied directly to your wallet address.
                        </p>
                        <p>
                            When you initialize Whale Chat, you sign a payload that generates your XMTP identity keys. These keys are used to encrypt messages locally on your device before they are broadcasted to the decentralized XMTP network. We merely provide the interface; we cannot read, censor, or modify your communications.
                        </p>
                        <p>
                            At the on-chain layer, Whale Chat leverages <strong>Aztec Network's encrypted logs and private state variables</strong>. Only the sender and recipient, holding the corresponding viewing keys, can decrypt the message payloads stored on-chain, ensuring absolute communication confidentiality beyond what the transport layer alone provides.
                        </p>
                    </div>
                </section>

                {/* 6. What stays on your device vs our servers */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <HardDrive size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">6. Data Locality: Device vs. Server</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We maintain strict boundaries regarding data locality to protect your privacy:
                        </p>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="bg-white p-6 border border-black/10 rounded-2xl">
                                <h4 className="font-bold text-[#050505] mb-4 text-lg">On Your Device (Local)</h4>
                                <ul className="space-y-2 text-sm text-[#050505]/70">
                                    <li>• Wallet Private Keys (Never exposed)</li>
                                    <li>• Biometric Templates (FaceID/TouchID)</li>
                                    <li>• XMTP Decryption Keys</li>
                                    <li>• Ephemeral Handshake Keys</li>
                                    <li>• UI Preferences (Local Storage)</li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 border border-black/10 rounded-2xl">
                                <h4 className="font-bold text-[#050505] mb-4 text-lg">On Our Servers</h4>
                                <ul className="space-y-2 text-sm text-[#050505]/70">
                                    <li>• Public Wallet Addresses</li>
                                    <li>• Encrypted Session Cookies</li>
                                    <li>• Analytical News Aggregations</li>
                                    <li>• Public Forum Posts</li>
                                    <li>• Platform Usage Analytics (Anonymized)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Product labels and universal scan */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505]">
                            <Scan size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">7. Product Labels and Universal Scan</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Our platform integrates a Universal Scanner capable of parsing multiple data formats dynamically. The scanner utilizes advanced image recognition libraries to process camera feeds entirely client-side.
                        </p>
                        <p>
                            When you scan a product label (like a GS1 Digital Link or a proprietary item QR code), the application extracts the Global Trade Item Number (GTIN) or specific product slug. It then queries our public registry to fetch product provenance, authenticity verifications, and historical supply chain data, displaying it directly within your dashboard.
                        </p>
                    </div>
                </section>

                {/* 8. Aztec Private State & Open Source Noir Integrations */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <Cpu size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">8. Aztec Private State & Open Source Noir Integrations</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            As an entirely <strong>open-source</strong> public good, we are deeply integrating with the Aztec Network to introduce profound privacy to our smart contract interactions. We employ Aztec’s Noir framework to write custom zero-knowledge circuits that facilitate private state transitions across our core modules.
                        </p>
                        <p>
                            <strong>Whale Chat:</strong> Our wallet-to-wallet messaging utilizes Aztec’s encrypted logs and private state variables. Only the sender and recipient, holding the corresponding viewing keys, can decrypt the message payloads, ensuring absolute communication confidentiality on-chain.
                        </p>
                        <p>
                            <strong>Humanity Ledger:</strong> Functions as a highly secure, private block explorer and portfolio tracker. By interacting with our custom Aztec account contracts, users can privately view their balances and transaction history without exposing their financial footprint to the public network.
                        </p>
                        <p>
                            <strong>QR-Code Synchronization:</strong> We are developing custom Aztec account contracts that natively support our multi-device synchronization. This allows users to initiate a secure session on a desktop, authenticated by a mobile device, without exposing private keys over the network, utilizing ZK proofs for session validation.
                        </p>
                        <p>
                            All Aztec integrations are developed and tested locally using the <strong>Aztec Sandbox</strong>, which replicates the full Aztec network environment on a developer machine, enabling rigorous testing of private state transitions before any testnet deployment.
                        </p>
                    </div>
                </section>

                {/* 9. Useful Links */}
                <section className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-black/10">
                    <Link href="/legal/privacy" className="flex-1 p-8 bg-white border border-black/10 rounded-2xl hover:bg-white transition-all group flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-[#050505] text-lg mb-1">Legal Privacy Policy</h4>
                            <p className="text-[#050505]/60 text-sm">Read our full regulatory framework.</p>
                        </div>
                        <ArrowRight className="text-[#050505]/30 group-hover:text-[#050505] transition-colors" />
                    </Link>
                    <Link href="/whitepaper" className="flex-1 p-8 bg-white border border-black/10 rounded-2xl hover:bg-white transition-all group flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-[#050505] text-lg mb-1">Technical Whitepaper</h4>
                            <p className="text-[#050505]/60 text-sm">Deep dive into our mathematics.</p>
                        </div>
                        <ArrowRight className="text-[#050505]/30 group-hover:text-[#050505] transition-colors" />
                    </Link>
                </section>
            </div>
        </DocLayout>
    );
}
