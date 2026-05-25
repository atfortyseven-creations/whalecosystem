import DocLayout from '@/components/layout/DocLayout';
import { Scale, CheckCircle, FileText, Globe, Landmark, Eye } from 'lucide-react';

export default function CompliancePolicy() {
    return (
        <DocLayout
            title="Regulatory Compliance"
            description="Our unwavering commitment to adhering to global financial regulations, anti-money laundering (AML) directives, and international data protection laws."
            lastUpdated="May 25, 2026"
            category="Legal"
        >
            <div className="space-y-16 text-[#050505]">
                {/* Introduction */}
                <section>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">Global Regulatory Alignment</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Whale Alert Network is fundamentally committed to operating within the highest standards of international law. As a provider of advanced decentralized finance analytics and blockchain indexation services, we recognize the critical importance of regulatory compliance in fostering a mature, stable, and trustworthy digital asset ecosystem.
                        </p>
                        <p>
                            We actively monitor and adapt to the rapidly evolving global regulatory landscape surrounding cryptocurrencies, decentralized finance (DeFi), and data privacy. Our legal and compliance teams work continuously to ensure that our platform not only meets current statutory requirements but is also proactively aligned with anticipated future regulatory frameworks across major jurisdictions.
                        </p>
                    </div>
                </section>

                {/* Key Compliance Areas */}
                <section>
                    <h2 className="text-3xl font-black mb-10 tracking-tight">Key Areas of Compliance</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { icon: <Landmark />, title: 'Anti-Money Laundering (AML)', desc: 'We strictly adhere to the European Union\'s Anti-Money Laundering Directives (AMLD) and FATF guidelines. While we operate in a non-custodial capacity, we implement robust transaction monitoring systems to detect and prevent illicit financial flows across our analytics networks.' },
                            { icon: <Scale />, title: 'Sanctions Compliance', desc: 'We maintain strict compliance with global sanctions lists, including the US Treasury\'s OFAC, the UN Security Council, and the EU Consolidated List. We employ advanced IP filtering and blockchain analytics to prevent sanctioned entities from utilizing our premium services.' },
                            { icon: <FileText />, title: 'MiCA Regulation', desc: 'We are fully prepared and aligned with the EU\'s Markets in Crypto-Assets (MiCA) regulation. We ensure transparent operational practices, clear communication of technological risks, and strict separation of analytical tools from custodial or brokerage services.' },
                            { icon: <Globe />, title: 'Data Privacy (GDPR & CCPA)', desc: 'Our data architecture is meticulously designed around the principles of the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), ensuring profound user rights regarding data access, portability, and verifiable erasure.' }
                        ].map((area, i) => (
                            <div key={i} className="p-8 border border-black/10 rounded-3xl bg-white hover:shadow-lg transition-all duration-300 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505] group-hover:scale-110 transition-transform origin-left">
                                        {area.icon}
                                    </div>
                                    <h4 className="text-xl font-bold">{area.title}</h4>
                                </div>
                                <p className="text-[#050505]/70 leading-relaxed text-sm">{area.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* KYC & Non-Custodial Nature */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <h2 className="text-3xl font-black mb-8 tracking-tight flex items-center gap-4">
                        <Eye className="text-slate-400" size={32} />
                        Non-Custodial Operational Model
                    </h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            It is imperative to understand the precise legal nature of our operations. <strong>Whale Alert Network is entirely non-custodial.</strong> We do not hold, manage, transfer, or possess our users' digital assets or fiat currency at any point. Our software simply provides an interface for users to interact directly with public, decentralized blockchain networks via their own self-managed cryptographic keys.
                        </p>
                        <p>
                            Because we do not act as a financial intermediary, custodian, or exchange, certain traditional Know Your Customer (KYC) requirements applicable to custodial institutions do not apply to our core analytical services. However, we voluntarily implement Zero-Knowledge Proof (ZKP) identity verification for premium features to prevent Sybil attacks and ensure platform integrity, without compromising the inherent privacy of decentralized networks.
                        </p>
                    </div>
                </section>

                {/* Law Enforcement */}
                <section>
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Cooperation with Law Enforcement</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Whale Alert Network respects the rule of law and will cooperate fully with valid, legally binding requests from verified law enforcement agencies and judicial authorities. We require formal legal process (such as a subpoena, court order, or search warrant) issued by an authorized court of competent jurisdiction before considering the disclosure of any limited user data we may possess.
                        </p>
                        <p>
                            We conduct rigorous legal reviews of all requests to ensure they are narrowly tailored and legally sound. We actively push back against overly broad or procedurally invalid demands to protect the constitutional and fundamental rights of our users.
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-[#050505] text-white p-10 md:p-12 rounded-3xl text-center">
                    <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Compliance & Legal Inquiries</h2>
                    <p className="mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
                        For official communications from regulatory bodies, law enforcement agencies, or compliance-related inquiries, please direct correspondence to our legal department.
                    </p>
                    <a href="mailto:legal@whalealert.network" className="inline-block px-10 py-5 bg-white text-[#050505] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-slate-200 transition-colors shadow-xl">
                        Contact Legal Department
                    </a>
                </section>
            </div>
        </DocLayout>
    );
}
