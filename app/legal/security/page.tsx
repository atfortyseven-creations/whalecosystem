import DocLayout from '@/components/layout/DocLayout';
import { Shield, Lock, FileKey, Server, Cpu, Key, AlertCircle } from 'lucide-react';

export default function SecurityPolicy() {
    return (
        <DocLayout
            title="Security Architecture"
            description="A detailed overview of the robust security protocols, cryptographic measures, and zero-trust infrastructure protecting the Whale Alert Network ecosystem."
            lastUpdated="May 25, 2026"
            category="Legal"
        >
            <div className="space-y-16 text-[#050505]">
                {/* Introduction */}
                <section>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">Institutional-Grade Security at Our Core</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            At Whale Alert Network, security is not an afterthought or a compliance checkbox; it is the fundamental pillar upon which our entire architecture is built. We understand that in the realm of decentralized finance, the integrity of data and the protection of user assets are absolutely paramount.
                        </p>
                        <p>
                            We employ a defense-in-depth strategy, combining cutting-edge cryptographic protocols, a strict zero-trust operational model, and continuous third-party auditing to ensure that our platform remains impervious to emerging threats. This document outlines the exhaustive measures we take to secure our infrastructure and protect your digital sovereignty.
                        </p>
                    </div>
                </section>

                {/* Core Security Pillars */}
                <section>
                    <h2 className="text-3xl font-black mb-10 tracking-tight">Core Security Pillars</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Lock />, title: 'Zero-Knowledge Architecture', desc: 'We utilize advanced zk-SNARKs to cryptographically verify human uniqueness and identity without ever storing or transmitting personally identifiable information.' },
                            { icon: <Shield />, title: 'Non-Custodial Design', desc: 'We never hold, store, or have access to your private cryptographic keys. Your funds remain entirely in your custody, secured by your local device enclave.' },
                            { icon: <Server />, title: 'Distributed Infrastructure', desc: 'Our backend operates on a globally distributed, highly redundant server architecture equipped with multi-layered, automated DDoS mitigation systems.' },
                            { icon: <FileKey />, title: 'End-to-End Encryption', desc: 'All data transmitted between your device and our servers, including chat messages, is secured using TLS 1.3 and advanced AES-256 encryption at rest.' },
                            { icon: <Cpu />, title: 'Immutable Audit Trails', desc: 'Critical system changes, smart contract deployments, and administrative actions are cryptographically signed and logged on an immutable ledger.' },
                            { icon: <Key />, title: 'Hardware Authentication', desc: 'Internal access to production environments strictly requires FIDO2 hardware security keys. We do not rely on vulnerable SMS or email-based multi-factor authentication.' }
                        ].map((pillar, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-black/10 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-[#050505]">
                                    {pillar.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-4">{pillar.title}</h4>
                                <p className="text-[#050505]/70 leading-relaxed text-sm">{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Smart Contract Security */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Smart Contract & On-Chain Security</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            The decentralized components of our platform are built with the highest standards of smart contract engineering. Given the immutable nature of blockchains, preventing vulnerabilities before deployment is our highest priority.
                        </p>
                        <ul className="list-disc pl-6 space-y-4 text-[#050505]/80">
                            <li><strong>Rigorous Independent Auditing:</strong> Every smart contract deployed by Whale Alert Network undergoes exhaustive security audits by tier-1 independent blockchain security firms (e.g., Trail of Bits, OpenZeppelin, ConsenSys Diligence) prior to mainnet launch.</li>
                            <li><strong>Formal Verification:</strong> We utilize formal mathematical verification techniques to mathematically prove the correctness of our critical smart contract logic, ensuring immunity to common attack vectors such as reentrancy and integer overflow.</li>
                            <li><strong>Bug Bounty Program:</strong> We operate a continuous, high-reward public bug bounty program via Immunefi, incentivizing the global white-hat hacker community to scrutinize our codebase.</li>
                            <li><strong>Multi-Signature Governance:</strong> Administrative controls over protocol parameters are secured by decentralized, multi-signature wallets requiring consensus from geographically distributed keyholders.</li>
                        </ul>
                    </div>
                </section>

                {/* Incident Response */}
                <section>
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Incident Response & Transparency</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            While we engineer our systems to be resilient against all known attack vectors, we maintain a highly structured, battle-tested Incident Response Plan (IRP) to address potential zero-day vulnerabilities or systemic anomalies rapidly and effectively.
                        </p>
                        <p>
                            In the event of a severe security incident, our protocol mandates immediate transparency. Users will be notified through all official channels within 24 hours, accompanied by a preliminary technical post-mortem and actionable guidance to protect their assets. We believe that hiding vulnerabilities is a greater risk than the vulnerabilities themselves.
                        </p>
                    </div>
                </section>

                {/* Penetration Testing */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Continuous Penetration Testing</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Our infrastructure is subjected to continuous, aggressive penetration testing by specialized red teams mimicking advanced persistent threats (APTs). These simulated cyberattacks target every layer of our technology stack, from our cloud infrastructure and APIs down to individual smart contracts. By proactively hunting for vulnerabilities, we ensure our defensive measures evolve faster than offensive capabilities.
                        </p>
                        <p>
                            All discovered vulnerabilities are immediately patched, and the mitigation strategies are independently verified before any updates are pushed to the production environment. We adhere strictly to the principle of "secure by default" in every architectural decision.
                        </p>
                    </div>
                </section>

                {/* Cryptographic Key Lifecycle */}
                <section>
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Cryptographic Key Management Lifecycle</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            The generation, storage, and rotation of cryptographic keys form the backbone of our data protection strategy. We employ Hardware Security Modules (HSMs) with FIPS 140-2 Level 3 certification to manage all root cryptographic material. 
                        </p>
                        <p>
                            Our key rotation protocols are fully automated and trigger strictly on a regular temporal schedule or instantly in the event of suspected compromise. Furthermore, no single employee possesses the clearance or the technical capability to extract private keys from the HSM enclaves, ensuring total mitigation against insider threats.
                        </p>
                    </div>
                </section>

                {/* Employee Clearance */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Employee Security Clearances and Training</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Technology is only as secure as the personnel operating it. Every member of the Whale Alert Network engineering and infrastructure team undergoes a rigorous, multi-stage background check before being granted access to internal systems.
                        </p>
                        <p>
                            Access to critical production databases and deployment pipelines operates on a strict Principle of Least Privilege (PoLP) and requires multi-party computation approvals. Additionally, all employees participate in mandatory, quarterly security awareness training focused on mitigating advanced social engineering and phishing campaigns.
                        </p>
                    </div>
                </section>

                {/* Disaster Recovery */}
                <section>
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Disaster Recovery and Business Continuity</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We operate a highly resilient, globally distributed infrastructure engineered to withstand catastrophic failures, natural disasters, and coordinated regional attacks. Our databases are synchronously replicated across multiple independent geographical zones to ensure zero data loss (RPO = 0) and near-instantaneous failover capabilities (RTO &lt; 60 seconds).
                        </p>
                        <p>
                            Regular failover drills are conducted quarterly to validate our Business Continuity Plan (BCP) in real-world scenarios, ensuring that our analytics platforms and communication networks remain fully operational under any circumstances.
                        </p>
                    </div>
                </section>

                {/* Reporting */}
                <section className="bg-[#050505] text-white p-10 md:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-4">
                            <AlertCircle className="text-white/50" size={32} />
                            Report a Vulnerability
                        </h2>
                        <p className="text-white/70 leading-relaxed max-w-2xl">
                            If you are a security researcher and believe you have discovered a vulnerability in our platform, API, or smart contracts, we strongly encourage you to disclose it to us responsibly.
                        </p>
                    </div>
                    <a href="mailto:security@whalealert.network" className="shrink-0 px-8 py-4 bg-white text-[#050505] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-slate-200 transition-colors shadow-xl">
                        Contact Security Team
                    </a>
                </section>
            </div>
        </DocLayout>
    );
}
