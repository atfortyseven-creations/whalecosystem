import DocLayout from '@/components/layout/DocLayout';

export default function PrivacyPolicy() {
    return (
        <DocLayout
            title="Privacy Policy"
            description="Comprehensive guide on how we collect, use, and safeguard your personal data in strict compliance with GDPR, LOPDGDD, and international standards."
            lastUpdated="May 25, 2026"
            category="Legal"
        >
            <div className="space-y-12 text-[#050505]">
                {/* 1. Introduction */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">1. Introduction and Scope</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Welcome to Whale Alert Network ("we," "our," "us," or the "Company"). We are unequivocally committed to protecting your privacy, maintaining your trust, and ensuring the absolute security of your personal data. This comprehensive Privacy Policy explains in detail how we collect, use, disclose, transfer, and safeguard your information when you access our decentralized finance platform, mobile applications, APIs, and any related services (collectively, the "Services").
                        </p>
                        <p>
                            This policy has been drafted in strict compliance with the European Union General Data Protection Regulation (GDPR) 2016/679, the Spanish Organic Law 3/2018 on Data Protection and Guarantee of Digital Rights (LOPDGDD), the California Consumer Privacy Act (CCPA), and other applicable global data protection frameworks.
                        </p>
                        <p>
                            By accessing or using our Services, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy. If you do not agree with our policies and practices, your choice is not to use our Services.
                        </p>
                    </div>
                </section>

                {/* 2. Data Controller */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">2. Identity of the Data Controller</h2>
                    <div className="bg-white p-8 rounded-3xl border border-black/10">
                        <p className="font-bold mb-4 text-[#050505]">For the purposes of the GDPR and other applicable data protection laws, the Data Controller is:</p>
                        <ul className="space-y-3 text-[#050505]/70">
                            <li><strong>Legal Entity:</strong> Whale Alert Network, S.L.</li>
                            <li><strong>Registered Office:</strong> Paseo de la Castellana, Madrid, 28046, Spain</li>
                            <li><strong>Company Registration Number:</strong> B-12345678</li>
                            <li><strong>General Email:</strong> contact@whalealert.network</li>
                            <li><strong>Data Protection Officer (DPO):</strong> dpo@whalealert.network</li>
                        </ul>
                        <p className="mt-6 text-sm text-[#050505]/50">
                            Our DPO is responsible for overseeing questions in relation to this privacy policy. If you have any questions, including any requests to exercise your legal rights, please contact the DPO using the details set out above.
                        </p>
                    </div>
                </section>

                {/* 3. Data We Collect */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">3. Extensive Breakdown of Data We Collect</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We adhere strictly to the principle of data minimization. We only collect personal data that is adequate, relevant, and limited to what is necessary in relation to the purposes for which it is processed. We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        
                        <h3 className="text-2xl font-bold mt-10 mb-4 text-[#050505]">3.1. Identity and Contact Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Email address:</strong> Collected via our authentication provider when you create an account.</li>
                            <li><strong>Public Blockchain Wallet Addresses:</strong> Cryptographic public keys used to interact with decentralized networks.</li>
                            <li><strong>Zero-Knowledge Proof Identifiers:</strong> We utilize advanced cryptographic zero-knowledge proofs to verify that you are a unique human without ever knowing your real-world identity. This data is purely mathematical and fully anonymized.</li>
                            <li><strong>Optional Profile Data:</strong> Usernames, display names, or avatars that you explicitly choose to provide.</li>
                        </ul>

                        <h3 className="text-2xl font-bold mt-10 mb-4 text-[#050505]">3.2. Biometric Authentication Data (Client-Side Only)</h3>
                        <div className="bg-[#050505] text-white p-6 rounded-2xl">
                            <p className="mb-2 font-black uppercase tracking-widest text-[11px] text-white/60">Critical Privacy Notice</p>
                            <p className="leading-relaxed">
                                When you opt to use biometric authentication (such as Touch ID, Face ID, or Windows Hello), this data is processed <strong>exclusively on your local device</strong> utilizing standard WebAuthn/FIDO2 protocols. <strong>We NEVER receive, store, transmit, or have access to your biometric templates or raw biometric data.</strong> Our servers only receive cryptographic signatures confirming successful local authentication.
                            </p>
                        </div>

                        <h3 className="text-2xl font-bold mt-10 mb-4 text-[#050505]">3.3. Financial and Transactional Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Public Ledger Data:</strong> Wallet balances, transaction history, token transfers, and smart contract interactions fetched from public blockchains (e.g., Ethereum, Base, Polygon). This data is inherently public by the nature of decentralized networks.</li>
                            <li><strong>Trading Analytics:</strong> Aggregated trading performance metrics, risk preferences, and simulated trading orders within our platform environment.</li>
                        </ul>

                        <h3 className="text-2xl font-bold mt-10 mb-4 text-[#050505]">3.4. Technical and Device Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Network Information:</strong> IP addresses (anonymized where legally required), internet service provider details.</li>
                            <li><strong>Device Fingerprinting:</strong> Browser type and version, operating system, time zone setting and location (country/city level), browser plug-in types.</li>
                            <li><strong>Session Data:</strong> Authentication logs, login timestamps, and security tokens.</li>
                        </ul>

                        <h3 className="text-2xl font-bold mt-10 mb-4 text-[#050505]">3.5. Behavioral and Usage Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Information about how you use our website, products, and services.</li>
                            <li>Pages visited, time spent on pages, clickstream data, and navigation paths.</li>
                            <li>Error logs, crash reports, and performance diagnostics.</li>
                        </ul>
                    </div>
                </section>

                {/* 4. Lawful Basis */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">4. Lawful Basis for Processing (GDPR Article 6)</h2>
                    <p className="mb-8 leading-relaxed text-[#050505]/70 text-lg">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border border-black/10 p-8 rounded-3xl hover:shadow-lg transition-shadow">
                            <h4 className="font-bold text-xl mb-4 text-[#050505]">A. Contractual Necessity</h4>
                            <p className="text-[#050505]/70 leading-relaxed mb-4"><strong>Basis:</strong> Processing is necessary for the performance of a contract to which you are party, or to take steps at your request prior to entering into a contract.</p>
                            <p className="text-[#050505]/70 leading-relaxed"><strong>Use Case:</strong> Creating your account, providing access to our decentralized trading terminals, rendering portfolio analytics, and providing customer support.</p>
                        </div>

                        <div className="bg-white border border-black/10 p-8 rounded-3xl hover:shadow-lg transition-shadow">
                            <h4 className="font-bold text-xl mb-4 text-[#050505]">B. Legitimate Interests</h4>
                            <p className="text-[#050505]/70 leading-relaxed mb-4"><strong>Basis:</strong> Processing is necessary for the purposes of the legitimate interests pursued by us or a third party, except where such interests are overridden by your fundamental rights.</p>
                            <p className="text-[#050505]/70 leading-relaxed"><strong>Use Case:</strong> Detecting and preventing fraud, ensuring network and information security, analyzing platform usage to improve our UI/UX, and defending against legal claims.</p>
                        </div>

                        <div className="bg-white border border-black/10 p-8 rounded-3xl hover:shadow-lg transition-shadow">
                            <h4 className="font-bold text-xl mb-4 text-[#050505]">C. Legal Obligation</h4>
                            <p className="text-[#050505]/70 leading-relaxed mb-4"><strong>Basis:</strong> Processing is necessary for compliance with a legal obligation to which the controller is subject.</p>
                            <p className="text-[#050505]/70 leading-relaxed"><strong>Use Case:</strong> Complying with Anti-Money Laundering (AML) directives, Counter-Terrorism Financing (CTF) laws, tax reporting requirements, and responding to binding court orders.</p>
                        </div>

                        <div className="bg-white border border-black/10 p-8 rounded-3xl hover:shadow-lg transition-shadow">
                            <h4 className="font-bold text-xl mb-4 text-[#050505]">D. Explicit Consent</h4>
                            <p className="text-[#050505]/70 leading-relaxed mb-4"><strong>Basis:</strong> You have given explicit consent to the processing of your personal data for one or more specific purposes.</p>
                            <p className="text-[#050505]/70 leading-relaxed"><strong>Use Case:</strong> Sending marketing newsletters, utilizing non-essential tracking cookies, and enabling optional beta features.</p>
                        </div>
                    </div>
                </section>

                {/* 5. Data Sharing */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">5. Disclosures and Third-Party Sharing</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We do not sell, rent, or trade your personal data. We may share your data with strictly vetted third-party service providers who assist us in operating our platform, conducting our business, or serving our users, so long as those parties agree to keep this information confidential and comply with strict GDPR standards.
                        </p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="p-6 border border-black/10 rounded-2xl bg-white hover:border-black/30 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#050505]">Infrastructure & Hosting Partners</h4>
                            <p className="text-[#050505]/60 leading-relaxed">Provide secure cloud hosting, edge computing, and database storage. These providers are SOC 2 Type II certified and operate under strict Data Processing Agreements (DPAs).</p>
                        </div>
                        <div className="p-6 border border-black/10 rounded-2xl bg-white hover:border-black/30 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#050505]">Authentication Providers</h4>
                            <p className="text-[#050505]/60 leading-relaxed">Manage secure user sign-in processes, session management, and multi-factor authentication routing.</p>
                        </div>
                        <div className="p-6 border border-black/10 rounded-2xl bg-white hover:border-black/30 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#050505]">Blockchain RPC Nodes</h4>
                            <p className="text-[#050505]/60 leading-relaxed">Relay requests to public blockchain networks. We share public wallet addresses with these providers to fetch balances and broadcast signed transactions.</p>
                        </div>
                    </div>
                </section>

                {/* 6. Retention */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">6. Data Retention and Deletion Policies</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Data:</strong> Retained for the lifetime of your account. Upon requesting account deletion, data is hard-deleted from our active databases within 30 days, and purged from secure backups within 90 days.</li>
                            <li><strong>Security and Access Logs:</strong> Retained for exactly 12 months to facilitate forensic analysis in the event of a security incident, then automatically purged.</li>
                            <li><strong>Legal Compliance Data:</strong> If required by law (e.g., tax records), certain minimal data may be retained for up to 5-10 years as mandated by relevant legislation.</li>
                        </ul>
                    </div>
                    
                    <div className="bg-white border border-black/20 p-6 rounded-2xl mt-8">
                        <p className="font-black uppercase tracking-widest text-[11px] mb-2 text-[#050505]">Blockchain Immutability Disclaimer</p>
                        <p className="text-[#050505]/70 leading-relaxed">
                            By the inherent design of decentralized blockchain networks, all transactions and associated public wallet addresses recorded on the blockchain are permanent and immutable. We do not control these networks and <strong>cannot alter or delete data that has been published to a public ledger</strong>. Your exercise of the "Right to Erasure" applies only to data stored on our centralized servers.
                        </p>
                    </div>
                </section>

                {/* 7. Rights */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">7. Your Comprehensive Legal Rights</h2>
                    <p className="mb-8 leading-relaxed text-lg text-[#050505]/70">Under the GDPR and equivalent data protection laws, you possess powerful rights regarding your personal data:</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: 'Right to Access', desc: 'Request a comprehensive copy of the personal data we hold about you.' },
                            { title: 'Right to Rectification', desc: 'Request correction of any incomplete or inaccurate data we hold.' },
                            { title: 'Right to Erasure', desc: 'Request deletion or removal of personal data where there is no good reason for us continuing to process it.' },
                            { title: 'Right to Object', desc: 'Object to processing where we are relying on a legitimate interest.' },
                            { title: 'Right to Restriction', desc: 'Ask us to suspend the processing of your personal data in certain scenarios.' },
                            { title: 'Right to Portability', desc: 'Request the transfer of your personal data to you or to a third party.' },
                            { title: 'Right to Withdraw Consent', desc: 'Withdraw consent at any time where we are relying on consent.' },
                            { title: 'Right to Lodge a Complaint', desc: 'File a formal complaint with your local supervisory authority.' }
                        ].map((right, idx) => (
                            <div key={idx} className="p-6 border border-black/5 bg-white rounded-2xl hover:bg-slate-100 transition-colors">
                                <h4 className="font-bold mb-2 text-[#050505] text-lg">{right.title}</h4>
                                <p className="text-[#050505]/60 leading-relaxed">{right.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. International Transfers */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">9. International Data Transfers</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Given the global nature of decentralized finance and our distributed operations, the personal data that we collect from you may be transferred to, and stored at, a destination outside the European Economic Area ("EEA"). It may also be processed by staff operating outside the EEA who work for us or for one of our suppliers.
                        </p>
                        <p>
                            Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>We will only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data by the European Commission.</li>
                            <li>Where we use certain service providers, we may use specific contracts approved by the European Commission which give personal data the same protection it has in Europe (Standard Contractual Clauses).</li>
                            <li>We implement robust technical measures, such as advanced encryption at rest and in transit, to further protect data transferred across borders.</li>
                        </ul>
                    </div>
                </section>

                {/* 10. Automated Decision-Making */}
                <section className="bg-white p-10 rounded-3xl border border-black/10">
                    <h2 className="text-3xl font-black mb-6 tracking-tight">10. Automated Decision-Making and Profiling</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We do not use your personal data for automated decision-making or profiling that produces legal effects concerning you or similarly significantly affects you, as defined under Article 22 of the GDPR. Our risk-management algorithms and blockchain analytics tools process transaction data (which is public by nature) and do not rely on your private personal identity to restrict or deny services automatically.
                        </p>
                    </div>
                </section>

                {/* 11. Third-Party Links */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">11. Third-Party Links and Services</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Our platform may include links to third-party websites, plug-ins, decentralised applications (dApps), and external APIs. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our platform, we strongly encourage you to read the privacy policy of every website or application you visit.
                        </p>
                    </div>
                </section>

                {/* 12. Updates */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">12. Changes to this Privacy Policy</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We reserve the right to update or change our Privacy Policy at any time, and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.
                        </p>
                        <p>
                            If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website and decentralized applications prior to the change becoming effective.
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-[#050505] text-white p-10 md:p-12 rounded-3xl text-center">
                    <h2 className="text-3xl font-black mb-6 tracking-tight">13. Contact Information</h2>
                    <p className="mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
                        If you have any questions about this Privacy Policy, our data practices, or if you wish to exercise your legal rights, please contact our Data Protection Officer immediately.
                    </p>
                    <div className="inline-flex flex-col gap-4 text-left bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-xl mx-auto">
                        <div className="flex flex-col">
                            <span className="font-black uppercase tracking-widest text-[10px] text-white/50 mb-1">Email for General Privacy Queries</span>
                            <a href="mailto:privacy@whalealert.network" className="text-white hover:text-slate-300 transition-colors">privacy@whalealert.network</a>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black uppercase tracking-widest text-[10px] text-white/50 mb-1">Direct to Data Protection Officer</span>
                            <a href="mailto:dpo@whalealert.network" className="text-white hover:text-slate-300 transition-colors">dpo@whalealert.network</a>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black uppercase tracking-widest text-[10px] text-white/50 mb-1">Physical Address</span>
                            <span className="text-white">Whale Alert Network, S.L., Paseo de la Castellana, Madrid, 28046, Spain</span>
                        </div>
                    </div>
                </section>
            </div>
        </DocLayout>
    );
}
