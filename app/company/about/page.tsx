import DocLayout from '@/components/layout/DocLayout';
import { Heart, Users, Target, Sparkles, Globe, Shield } from 'lucide-react';

export default function AboutPage() {
    return (
        <DocLayout
            title="About Us"
            description="Learn about WhaleAlert ID.fi's mission to democratize DeFi through privacy-preserving identity and professional-grade tools."
            lastUpdated="February 7, 2026"
            category="Company"
        >
            <div className="space-y-8">
                {/* Hero */}
                <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-white/10">
                    <h2 className="text-4xl font-bold mb-4">The Future of Human-Centric DeFi</h2>
                    <p className="text-lg text-white/80">
                        WhaleAlert ID.fi combines zero-knowledge identity verification with Elite-grade trading tools to create a DeFi platform that's powerful, private, and accessible to everyone.
                    </p>
                </section>

                {/* Mission */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Target className="text-blue-400" />
                        Our Mission
                    </h2>

                    <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                        <p className="text-lg mb-4">
                            To democratize access to decentralized finance by proving <strong>humanity</strong> without sacrificing <strong>privacy</strong>.
                        </p>
                        <p className="text-white/70">
                            We believe everyone deserves access to borderless financial tools, regardless of their location, wealth, or background. By leveraging zero-knowledge proofs and self-custody wallets, we're building a future where you control your identity, your data, and your money.
                        </p>
                    </div>
                </section>

                {/* Vision */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles className="text-yellow-400" />
                        Our Vision
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-purple-600/10 border border-purple-500/30 p-6 rounded-xl">
                            <Shield size={32} className="text-purple-400 mb-3" />
                            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                            <p className="text-sm text-white/70">
                                Zero-knowledge proofs let you prove you're human without revealing who you are. Your identity, your control.
                            </p>
                        </div>

                        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-xl">
                            <Users size={32} className="text-blue-400 mb-3" />
                            <h3 className="text-xl font-bold mb-2">Accessible to All</h3>
                            <p className="text-sm text-white/70">
                                Professional-grade tools shouldn't require a hedge fund budget. We start free and scale with you.
                            </p>
                        </div>

                        <div className="bg-green-600/10 border border-green-500/30 p-6 rounded-xl">
                            <Globe size={32} className="text-green-400 mb-3" />
                            <h3 className="text-xl font-bold mb-2">Globally Inclusive</h3>
                            <p className="text-sm text-white/70">
                                DeFi should work for everyone, everywhere. Multi-chain, multi-language, multi-network support.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Core Values</h2>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2"> Self-Custody is Non-Negotiable</h3>
                            <p className="text-white/70">
                                Your keys, your crypto. We will NEVER hold custody of your funds or private keys. This isn't a featureit's a principle.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2">️ Privacy is a Right, Not a Luxury</h3>
                            <p className="text-white/70">
                                Everyone deserves financial privacy. Zero-knowledge proofs let you participate in DeFi without becoming a data product.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2"> Open, Transparent, Community-Driven</h3>
                            <p className="text-white/70">
                                We publish audit reports, contribute to open-source, and listen to our community. No hidden agendas.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2"> Innovation with Responsibility</h3>
                            <p className="text-white/70">
                                Cutting-edge tech, battle-tested security. We move fast, but never at the expense of user safety.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Our Team</h2>

                    <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center">
                        <p className="text-lg mb-4">
                            WhaleAlert ID.fi is built by a team of crypto natives, privacy advocates, and DeFi power users who believe in a better financial future.
                        </p>
                        <p className="text-white/70">
                            We're backed by experience in blockchain infrastructure, zero-knowledge cryptography, and Elite tradingcombined with a deep commitment to user systemty.
                        </p>
                    </div>
                </section>

                {/* Technology Stack */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Technology</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Frontend</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400"></span>
                                    <span>Next.js 15 (React Server Components)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400"></span>
                                    <span>TypeScript for type safety</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400"></span>
                                    <span>Framer Motion for animations</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400"></span>
                                    <span>TailwindCSS + custom design system</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Backend & Infrastructure</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400"></span>
                                    <span>Node.js with Express</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400"></span>
                                    <span>PostgreSQL + Prisma ORM</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400"></span>
                                    <span>Vercel (edge hosting)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400"></span>
                                    <span>WebSocket for real-time data</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Blockchain & Web3</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400"></span>
                                    <span>Alchemy SDK (multi-chain data)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400"></span>
                                    <span>ethers.js & viem</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400"></span>
                                    <span>RainbowKit + Wagmi</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400"></span>
                                    <span>WalletConnect v2</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Security & Identity</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-red-400"></span>
                                    <span>World ID (Identity)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-400"></span>
                                    <span>Clerk (authentication)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-400"></span>
                                    <span>WebAuthn (passkeys)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-400"></span>
                                    <span>TLS 1.3 + AES-256 encryption</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Compliance */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Regulatory Compliance</h2>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-xl">
                        <p className="mb-4">
                            We're committed to operating within the law while pushing for smarter regulation:
                        </p>

                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400"></span>
                                <span><strong>GDPR & Spanish LOPD:</strong> Full data protection compliance</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400"></span>
                                <span><strong>MiCA Preparation:</strong> Ready for EU crypto regulation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400"></span>
                                <span><strong>AML/CTF:</strong> Risk-based KYC with World ID</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400"></span>
                                <span><strong>CNMV Registration:</strong> In progress for Spanish market</span>
                            </li>
                        </ul>

                        <p className="mt-4 text-sm text-white/70">
                            See our <a href="/legal/compliance" className="text-blue-400 hover:underline">Compliance page</a> for full details.
                        </p>
                    </div>
                </section>

                {/* Join Us */}
                <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-white/10">
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="text-red-400" />
                        Join the Movement
                    </h2>
                    <p className="text-lg mb-6">
                        We're building the future of financeone that's private, accessible, and truly yours. Join thousands of users who've already made the switch.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="/signup" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold hover:scale-105 transition-transform">
                            Get Started Free
                        </a>
                        <a href="https://discord.gg/WhaleAlert ID" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors">
                            Join Discord
                        </a>
                        <a href="https://twitter.com/WhaleAlert ID_fi" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors">
                            Follow on Twitter
                        </a>
                    </div>
                </section>
            </div>
        </DocLayout>
    );
}

