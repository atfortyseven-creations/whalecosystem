import DocLayout from '@/components/layout/DocLayout';
import { Heart, Users, Target, Sparkles, Globe, Shield, Activity, Lock, Cpu, Rocket, Award, Lightbulb, TrendingUp, Handshake, Leaf, BookOpen } from 'lucide-react';

export default function AboutPage() {
    return (
        <DocLayout
            title="About Whale Alert Network"
            description="Discover the mission, vision, and people behind Whale Alert Network, a platform committed to making advanced decentralized finance accessible, transparent, and secure for everyone globally."
            lastUpdated="May 25, 2026"
            category="Company"
        >
            <div className="space-y-16">
                {/* Hero Section */}
                <section className="bg-white p-10 md:p-16 rounded-3xl border border-black/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10" />
                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-[#050505] leading-tight">
                        Redefining the Future of Decentralized Finance
                    </h2>
                    <p className="text-xl md:text-2xl text-[#050505]/70 leading-relaxed max-w-4xl">
                        At Whale Alert Network, we believe that advanced financial tools should be accessible to everyone, not just institutional investors. We are building a comprehensive ecosystem that combines professional-grade trading insights with an unwavering commitment to user privacy, simplicity, and global security.
                    </p>
                </section>

                {/* Our Story Extended */}
                <section className="px-4 md:px-0">
                    <h2 className="text-3xl font-black mb-8 tracking-tight text-[#050505]">Our Origin Story</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Whale Alert Network was founded with a simple, profound realization: the technological tools and market analytics used by professional traders and large financial institutions were vastly superior to those available to everyday users. Moreover, the decentralized finance (DeFi) space, while promising absolute transparency and democratization, was becoming increasingly complex, fragmented, and fraught with security risks.
                        </p>
                        <p>
                            A specialized group of passionate software engineers, financial analysts, and user experience designers came together to bridge this growing gap. We set out to build a holistic platform that strips away the daunting complexity of blockchain technology, presenting users with a clean, intuitive, and highly professional interface that rivals the best consumer applications in the world.
                        </p>
                        <p>
                            From our early days developing simple portfolio trackers, we have rapidly evolved into a comprehensive global ecosystem. Today, we offer real-time market analysis, secure end-to-end encrypted communication channels, advanced asset management tools, and institutional-grade charting—all packaged into an accessible web application. Our fundamental commitment to never compromising on user privacy has guided every architectural decision we have made since day one.
                        </p>
                        <p>
                            We have grown from a small collective into a globally distributed organization, serving hundreds of thousands of users across continents. We are constantly expanding our feature set, refining our aesthetic design, and pushing the boundaries of what is technically possible in decentralized finance. However, our core mission remains unchanged: to empower individuals with the best financial tools available, in the most secure, transparent, and accessible way possible.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-slate-100 text-[#050505] rounded-2xl flex items-center justify-center mb-8">
                            <Target size={32} />
                        </div>
                        <h3 className="text-3xl font-black mb-6 tracking-tight text-[#050505]">Our Mission</h3>
                        <p className="text-[#050505]/70 text-lg leading-relaxed">
                            To democratize access to global financial markets by providing powerful, transparent, and easy-to-use analytical tools while stringently protecting user data. We aim to break down the traditional barriers of entry to decentralized finance, empowering individuals worldwide to take full, informed control of their economic future without needing a technical background.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-slate-100 text-[#050505] rounded-2xl flex items-center justify-center mb-8">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-3xl font-black mb-6 tracking-tight text-[#050505]">Our Vision</h3>
                        <p className="text-[#050505]/70 text-lg leading-relaxed">
                            We envision a global society where financial systems are open, inclusive, and built on verifiable trustless technology. A future where every person can verify their identity and manage their digital assets without compromising their privacy, accessing elite trading analytics and secure networks from their mobile device, anywhere in the world.
                        </p>
                    </div>
                </section>

                {/* Core Values Extended */}
                <section>
                    <h2 className="text-3xl font-black mb-10 tracking-tight text-[#050505]">Our Core Values</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <Lock />, title: 'Privacy First', desc: 'Your personal data is yours. We use advanced cryptography to verify authenticity without ever storing or selling sensitive user information.' },
                            { icon: <Shield />, title: 'Absolute Security', desc: 'We implement the highest security standards in the industry, undergoing regular public audits. Your funds remain in your custody at all times.' },
                            { icon: <Users />, title: 'Community Driven', desc: 'We build for our users. Every feature is meticulously designed with the feedback, needs, and safety of our global community in mind.' },
                            { icon: <Globe />, title: 'Global Accessibility', desc: 'Financial tools should not be limited by geography or hardware. We design our platform to be lightweight, responsive, and usable from any device, anywhere.' },
                            { icon: <Activity />, title: 'Transparency', desc: 'We believe trust is earned through complete transparency. From open-source components to clear documentation, we hide nothing from our users.' },
                            { icon: <Rocket />, title: 'Continuous Innovation', desc: 'We constantly iterate and improve our platform, adopting the latest proven technologies to provide the fastest and most reliable experience possible.' },
                            { icon: <Lightbulb />, title: 'Education & Empowerment', desc: 'We do not just provide tools; we provide knowledge. We are committed to educating our users to make informed, intelligent financial decisions.' },
                            { icon: <Handshake />, title: 'Integrity', desc: 'We operate with uncompromising ethical standards. We do not engage in hidden fees, deceptive practices, or user manipulation.' },
                            { icon: <Leaf />, title: 'Sustainability', desc: 'We are committed to building a platform that is not only economically sustainable but also environmentally conscious by selecting efficient blockchain networks.' }
                        ].map((val, i) => (
                            <div key={i} className="p-8 bg-white border border-black/5 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 group">
                                <div className="text-slate-400 mb-6 group-hover:scale-110 transition-transform origin-left">{val.icon}</div>
                                <h4 className="text-xl font-bold mb-4 text-[#050505]">{val.title}</h4>
                                <p className="text-[#050505]/60 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* The Team / Leadership section */}
                <section className="bg-white p-10 md:p-16 rounded-3xl border border-black/5">
                    <h2 className="text-3xl font-black mb-8 tracking-tight text-[#050505]">Leadership & Corporate Governance</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-1/3 shrink-0 flex flex-col items-center">
                                <img src="/system-shots/photo_2026-05-16_19-57-16.jpg" alt="Creator of the Network" className="rounded-2xl border border-black/10 w-full object-cover aspect-square shadow-sm" />
                                <span className="mt-4 text-sm font-bold text-black">Creator of the Network</span>
                            </div>
                            <div className="w-full md:w-2/3 space-y-6">
                                <p>
                                    The team behind Whale Alert Network is a diverse, globally distributed group of professionals. Our leadership brings together decades of combined experience from top-tier technology companies, traditional financial institutions, and leading blockchain research organizations. We operate in a flat, meritocratic structure where the best ideas win, regardless of who proposes them.
                                </p>
                                <p>
                                    We foster a culture of radical candor, continuous learning, and intense focus on user experience. We believe that building great software requires empathy for the end-user, rigorous engineering discipline, and an appreciation for beautiful, functional design. Our team is united by a shared passion for decentralization and a profound respect for individual privacy.
                                </p>
                                <p>
                                    Our corporate governance is structured to ensure absolute accountability and transparency. We employ an independent board of advisors composed of legal experts, cybersecurity veterans, and macroeconomists who rigorously audit our strategic direction. This ensures that every technological deployment strictly aligns with our foundational manifesto of user empowerment and ethical financial indexing.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Global Reach and ESG */}
                <section>
                    <h2 className="text-3xl font-black mb-8 tracking-tight text-[#050505]">Global Reach & ESG Commitment</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Whale Alert Network is not confined by geopolitical borders. Our infrastructure is deployed across multiple Enterprise regions, ensuring low-latency access and uninterrupted service for a truly global user base. We are actively localizing our analytics engine to support multiple international languages and region-specific regulatory frameworks.
                        </p>
                        <p>
                            Furthermore, Environmental, Social, and Governance (ESG) principles are embedded deep within our operational DNA. In an industry often criticized for its carbon footprint, we have strategically aligned our node infrastructure with data centers powered entirely by renewable energy sources. We actively subsidize research into energy-efficient cryptographic proofs and aggressively optimize our server-side computational load to minimize our environmental impact.
                        </p>
                    </div>
                </section>

                {/* Technology Extended */}
                <section>
                    <h2 className="text-3xl font-black mb-10 tracking-tight text-[#050505]">The Technology Powering Us</h2>
                    <div className="bg-white p-10 rounded-3xl border border-black/10 shadow-sm">
                        <p className="text-lg text-[#050505]/70 leading-relaxed mb-12 max-w-4xl">
                            We leverage a modern, robust, and heavily audited technology stack to deliver a seamless user experience, ensuring uncompromising performance, security, and scalability. Our architecture is meticulously designed to handle thousands of concurrent users while maintaining real-time data accuracy across global markets.
                        </p>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Cpu className="text-slate-600" size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-[#050505]">Frontend Architecture</h4>
                                <ul className="space-y-3 text-[#050505]/60 text-sm">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> React & Next.js for server-side rendering and high performance</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Tailwind CSS for precise, responsive, and accessible UI design</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Framer Motion for fluid, hardware-accelerated micro-animations</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Strict TypeScript implementations for robust, error-free codebases</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Globe className="text-slate-600" size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-[#050505]">Backend Systems</h4>
                                <ul className="space-y-3 text-[#050505]/60 text-sm">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Node.js & Edge Functions for ultra-low latency global distribution</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> PostgreSQL for highly reliable, ACID-compliant data storage</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Redis caching layers for instant real-time messaging delivery</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> GraphQL and REST APIs for highly efficient data querying</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Shield className="text-slate-600" size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-[#050505]">Security Infrastructure</h4>
                                <ul className="space-y-3 text-[#050505]/60 text-sm">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Zero-Knowledge Proofs (ZK-SNARKs) for absolute privacy preservation</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> End-to-end encrypted protocol layers for all communications</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> WebAuthn and secure biometric authentication integration</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Multi-layered automated DDoS protection and traffic filtering</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Activity className="text-slate-600" size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-[#050505]">Blockchain Integration</h4>
                                <ul className="space-y-3 text-[#050505]/60 text-sm">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> EVM-compatible, deeply audited smart contract infrastructure</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Viem & Wagmi for resilient, agnostic wallet connection layers</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Enterprise-tier node providers (Alchemy, Infura) for uptime</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-1.5 shrink-0"/> Advanced real-time mempool monitoring and transaction simulation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Join Us */}
                <section className="bg-[#050505] text-white p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
                    <Heart className="mx-auto mb-8 text-white/50" size={48} />
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Join Our Global Community</h2>
                    <p className="text-lg md:text-xl text-white/60 mb-10 max-w-3xl mx-auto leading-relaxed">
                        We are more than just a software platform; we are a dedicated movement towards a fairer, more transparent, and secure financial future for everyone. Become part of our journey today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <a href="/connect" className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-100 transition-colors shadow-xl">
                            Explore the Platform
                        </a>
                        <a href="/careers" className="px-10 py-5 bg-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
                            View Career Opportunities
                        </a>
                    </div>
                </section>
            </div>
        </DocLayout>
    );
}
