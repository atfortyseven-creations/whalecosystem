import DocLayout from

 '@/components/layout/DocLayout';
import { Scale, Building2, FileCheck, Globe, Shield, AlertCircle } from 'lucide-react';

export default function CompliancePage() {
    return (
        <DocLayout
            title="Regulatory Compliance"
            description="Our commitment to meeting European, Spanish, and international regulatory requirements for cryptocurrency and DeFi services."
            lastUpdated="February 7, 2026"
            category="Legal"
        >
            <div className="space-y-8">
                {/* Introduction */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">Compliance Overview</h2>
                    <p className="mb-4">
                        WhaleAlert ID.fi is committed to operating in full compliance with all applicable laws and regulations in the European Union, Spain, and jurisdictions where ourservices are available. This page outlines our regulatory framework, compliance measures, and ongoing efforts to meet evolving legal requirements.
                    </p>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-400 mb-2">🏛️ Regulatory Framework</h4>
                        <p className="text-sm">We comply with EU-wide regulations (GDPR, MiCA, MiFID II, PSD2) and Spanish national laws (LOPD, Tax Code, Banco de España regulations).</p>
                    </div>
                </section>

                {/* EU Regulations */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Globe className="text-blue-400" />
                        1. European Union Regulations
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">1.1. MiCA (Markets in Crypto-Assets Regulation)</h3>
                    <p className="mb-4">
                        <strong>Regulation (EU) 2023/1114</strong> establishes a comprehensive regulatory framework for crypto-assets in the EU. While MiCA is being phased in through 2024-2026, we are proactively implementing its requirements:
                    </p>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                        <h4 className="font-bold mb-4">MiCA Compliance Measures:</h4>

                        <div className="space-y-4">
                            <div>
                                <h5 className="font-bold mb-2">📋 Transparency Requirements</h5>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li>Clear disclosure of risks associated with crypto-assets (see Terms of Service)</li>
                                    <li>Transparent fee structure (no hidden charges)</li>
                                    <li>Plain language explanations of services</li>
                                    <li>Prominent display of regulatory status</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">🛡️ Consumer Protection</h5>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li>No misleading marketing or promises of guaranteed returns</li>
                                    <li>Clear distinction between demo and real trading modes</li>
                                    <li>Complaint handling procedure established</li>
                                    <li>Right to withdraw from services (14-day cooling-off period for eligible services)</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">🏦 Operational Requirements</h5>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li>Segregation of client assets (self-custody model ensures this)</li>
                                    <li>Business continuity plans</li>
                                    <li>Governance and internal controls</li>
                                    <li>Incident reporting to supervisory authorities</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">⚖️ Market Abuse Prevention</h5>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li>Prohibition of insider trading and market manipulation (in our Terms)</li>
                                    <li>Transaction monitoring for suspicious activity</li>
                                    <li>Cooperation with authorities on investigations</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                            <h5 className="font-bold text-yellow-400 mb-2">📅 MiCA Implementation Timeline</h5>
                            <ul className="text-xs space-y-1">
                                <li>• <strong>June 2024:</strong> Market abuse provisions apply</li>
                                <li>• <strong>December 2024:</strong> Stablecoin (e-money token) rules apply</li>
                                <li>• <strong>December 2024:</strong> Full MiCA regime for all crypto-asset service providers</li>
                            </ul>
                            <p className="text-xs mt-2">We are preparing for full compliance before mandatory deadlines.</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">1.2. GDPR (General Data Protection Regulation)</h3>
                    <p className="mb-4">
                        <strong>Regulation (EU) 2016/679</strong> – See our detailed <a href="/legal/privacy" className="text-blue-400 hover:underline">Privacy Policy</a> for full GDPR compliance measures, including:
                    </p>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ Data Protection Officer (DPO) appointed
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ Data Processing Impact Assessments (DPIA) completed
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ Privacy by design and by default
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ User rights fully implemented (access, erasure, portability, etc.)
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ Standard Contractual Clauses (SCCs) for international transfers
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
                            ✅ Breach notification procedures (72-hour window)
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">1.3. MiFID II (Markets in Financial Instruments Directive)</h3>
                    <p className="mb-4">
                        <strong>Directive 2014/65/EU</strong> – While cryptocurrencies are not currently classified as financial instruments under MiFID II in most EU jurisdictions, we apply best practices from this framework:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Best Execution:</strong> We strive to obtain the best possible result for users when executing transactions</li>
                        <li><strong>Client Categorization:</strong> All users treated as retail clients (highest protection level)</li>
                        <li><strong>Suitability Assessment:</strong> Risk disclosures ensure users understand crypto volatility</li>
                        <li><strong>Transparency:</strong> Clear pricing, no hidden commissions</li>
                        <li><strong>Record Keeping:</strong> Transaction logs retained for required periods</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">1.4. PSD2 (Payment Services Directive)</h3>
                    <p className="mb-4">
                        <strong>Directive 2015/2366/EU</strong> – Our wallet services implement PSD2-inspired security measures:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Strong Customer Authentication (SCA):</strong> Two-factor authentication for sensitive operations</li>
                        <li><strong>Secure Communication:</strong> TLS 1.3 encryption, certificate pinning</li>
                        <li><strong>Transaction Monitoring:</strong> Real-time fraud detection</li>
                        <li><strong>Liability:</strong> Clear responsibility allocation (user controls private keys)</li>
                    </ul>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg mt-4">
                        <h5 className="font-bold text-blue-400 mb-2">ℹ️ Note on Cryptocurrency Classification</h5>
                        <p className="text-sm">Cryptocurrencies are generally NOT considered "electronic money" under PSD2, so full PSD2 licensing is not required. However, we adopt security standards as best practice.</p>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">1.5. ePrivacy Directive (Cookie Law)</h3>
                    <p className="mb-4">
                        <strong>Directive 2002/58/EC</strong> – We comply with consent requirements for cookies and tracking:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Cookie consent banner on first visit</li>
                        <li>Granular consent options (necessary, functional, analytics, marketing)</li>
                        <li>Easy withdraw of consent via Cookie Settings</li>
                        <li>Clear Cookie Policy (see Privacy Policy)</li>
                    </ul>
                </section>

                {/* Spanish Regulations */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Building2 className="text-red-400" />
                        2. Spanish National Regulations
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">2.1. LOPD-GDD (Organic Law on Data Protection)</h3>
                    <p className="mb-4">
                        <strong>Ley Orgánica 3/2018</strong> complements GDPR with Spanish-specific requirements:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>AEPD Registration:</strong> Data protection activities registered with Agencia Española de Protección de Datos</li>
                        <li><strong>DPO Designation:</strong> Data Protection Officer contactable at dpo@WhaleAlert ID.fi</li>
                        <li><strong>Spanish Language:</strong> Privacy Policy and Terms available in Spanish</li>
                        <li><strong>Digital Rights:</strong> Respect for digital rights including right to digital disconnection (for employees)</li>
                        <li><strong>Minors Protection:</strong> Enhanced protections for users under 18 (services restricted to 18+)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">2.2. Tax Compliance</h3>
                    <p className="mb-4">Spain has specific tax reporting requirements for cryptocurrency:</p>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h4 className="font-bold mb-4">Tax Obligations:</h4>

                        <div className="space-y-4">
                            <div>
                                <h5 className="font-bold mb-2">📝 Modelo 720 (Informative Declaration)</h5>
                                <p className="text-sm mb-2">Spanish tax residents must declare foreign assets (including crypto wallets) exceeding €50,000.</p>
                                <p className="text-sm text-white/70">
                                    <em>Note: This is a USER obligation, not our obligation. We provide transaction history exports to assist with tax filing.</em>
                                </p>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">💰 Capital Gains Tax</h5>
                                <p className="text-sm mb-2">Crypto-to-crypto and crypto-to-fiat trades trigger capital gains tax (19%-26% depending on amount).</p>
                                <p className="text-sm text-white/70">Users responsible for calculating and paying taxes. We DO NOT withhold taxes.</p>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">🏦 Wealth Tax (Impuesto sobre el Patrimonio)</h5>
                                <p className="text-sm">Crypto holdings count toward wealth tax if total assets exceed threshold (varies by region, typically €700k+).</p>
                            </div>

                            <div>
                                <h5 className="font-bold mb-2">📊 Our Support for Tax Compliance</h5>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li>Transaction history export (CSV, PDF)</li>
                                    <li>Realized gains/losses calculator (coming soon)</li>
                                    <li>FIFO/LIFO accounting support</li>
                                    <li>Integration with tax software (TBD)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                            <h5 className="font-bold text-yellow-400 mb-2">⚠️ Disclaimer</h5>
                            <p className="text-sm">We provide tools to help, but you are solely responsible for your tax obligations. Consult a Spanish tax advisor (asesor fiscal) for personalized advice.</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">2.3. CNMV (National Securities Market Commission)</h3>
                    <p className="mb-4">
                        The <strong>Comisión Nacional del Mercado de Valores</strong> regulates securities markets in Spain:
                    </p>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg">
                        <h5 className="font-bold text-blue-400 mb-2">CNMV Registration Status</h5>
                        <p className="text-sm mb-2">
                            <strong>Current Status:</strong> Cryptocurrency platforms are required to register with CNMV under Spanish Law 7/2021 for anti-money laundering purposes.
                        </p>
                        <p className="text-sm mb-2">
                            <strong>Our Status:</strong> Registration in progress / Application submitted [UPDATE WITH ACTUAL STATUS]
                        </p>
                        <p className="text-sm text-white/70">
                            We will update this page upon approval. In the meantime, we operate in compliance with all AML/CTF requirements.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">2.4. Banco de España</h3>
                    <p className="mb-4">
                        Spain's central bank oversees payment services and has issued guidance on cryptocurrencies:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Cryptocurrencies are NOT legal tender in Spain (Euro is the only legal tender)</li>
                        <li>Crypto platforms must comply with AML/CTF regulations</li>
                        <li>Consumer warnings issued: crypto investments are high-risk and uninsured</li>
                        <li>We comply with Banco de España guidance on risk disclosures</li>
                    </ul>
                </section>

                {/* AML/CTF */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="text-green-400" />
                        3. Anti-Money Laundering (AML) & Counter-Terrorist Financing (CTF)
                    </h2>

                    <p className="mb-4">
                        We comply with the EU's <strong>5th Anti-Money Laundering Directive (5AMLD)</strong> and Spanish <strong>Law 10/2010</strong> on prevention of money laundering and terrorist financing.
                    </p>

                    <h3 className="text-2xl font-bold mb-3">3.1. Know Your Customer (KYC)</h3>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-4">
                        <p className="mb-4"><strong>Risk-Based Approach:</strong> We implement tiered verification based on transaction volume and risk:</p>

                        <table className="w-full border border-white/10 text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="border border-white/10 p-3 text-left">Tier</th>
                                    <th className="border border-white/10 p-3 text-left">Verification</th>
                                    <th className="border border-white/10 p-3 text-left">Limits</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-white/10 p-3">GHOST</td>
                                    <td className="border border-white/10 p-3">Email only</td>
                                    <td className="border border-white/10 p-3">Demo trading only, no real fund transfers</td>
                                </tr>
                                <tr className="bg-white/5">
                                    <td className="border border-white/10 p-3">HUMAN</td>
                                    <td className="border border-white/10 p-3">World ID (proof of personhood, privacy-preserving)</td>
                                    <td className="border border-white/10 p-3">Full access, {'<'} €10k/month</td>
                                </tr>
                                <tr>
                                    <td className="border border-white/10 p-3">LEGEND</td>
                                    <td className="border border-white/10 p-3">Enhanced verification (if required for high volume)</td>
                                    <td className="border border-white/10 p-3">Unlimited (subject to AML monitoring)</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg mt-4">
                            <h5 className="font-bold text-blue-400 mb-2">🌐 World ID: Privacy-Preserving KYC</h5>
                            <p className="text-sm">
                                We use World ID for identity verification, which provides <strong>proof of personhood</strong> without revealing personal information. This balances regulatory compliance with user privacy through zero-knowledge proofs.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">3.2. Transaction Monitoring</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Ongoing Monitoring:</strong> All transactions monitored for suspicious activity</li>
                        <li><strong>Automated Alerts:</strong> Flagging of unusual patterns (large transactions, rapid transfers, high-risk jurisdictions)</li>
                        <li><strong>Sanctions Screening:</strong> Wallets checked against OFAC, EU, and UN sanctions lists</li>
                        <li><strong>Enhanced Due Diligence (EDD):</strong> Additional checks for high-risk transactions</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.3. Suspicious Activity Reporting (SAR)</h3>
                    <p className="mb-4">
                        If we detect suspicious activity, we are legally obligated to report it to:
                    </p>

                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <p className="font-bold mb-2">SEPBLAC (Servicio Ejecutivo de la Comisión de Prevención del Blanqueo de Capitales)</p>
                        <p className="text-sm text-white/70">Spain's Financial Intelligence Unit under the Bank of Spain</p>
                    </div>

                    <p className="mt-4 text-sm">
                        <strong>Note:</strong> We cannot disclose to users when a SAR has been filed ("tipping off" is prohibited by law).
                    </p>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.4. Record Keeping</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Customer identification records retained for <strong>10 years</strong> after relationship ends</li>
                        <li>Transaction records retained for <strong>5 years</strong></li>
                        <li>AML audit trail maintained and available to authorities upon request</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.5. Travel Rule Compliance</h3>
                    <p className="mb-4">
                        The <strong>FATF Travel Rule</strong> (implemented in EU via 6AMLD) requires sharing of originator and beneficiary information for crypto transfers above €1,000:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>We collect information on transfer recipients when required</li>
                        <li>Beneficiary information verified for outgoing transfers above threshold</li>
                        <li>Compliance with Transfer of Funds Regulation (EU 2023/1113)</li>
                    </ul>
                </section>

                {/* Consumer Protection */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Scale className="text-purple-400" />
                        4. Consumer Protection
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">4.1. EU Consumer Rights</h3>
                    <p className="mb-4">Under EU consumer law, you have rights including:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-bold mb-2">📝 Right to Information</h5>
                            <p className="text-sm text-white/70">Clear, transparent information before purchasing or using services</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-bold mb-2">↩️ Right to Withdraw</h5>
                            <p className="text-sm text-white/70">14-day cooling-off period for some services (note: executed crypto transactions are irreversible)</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-bold mb-2">⚖️ Unfair Contract Terms</h5>
                            <p className="text-sm text-white/70">Protection against unfair terms in our Terms of Service</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-bold mb-2">🛡️ Liability</h5>
                            <p className="text-sm text-white/70">We cannot exclude liability for death, injury, or fraud</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">4.2. Complaint Handling</h3>
                    <p className="mb-4">If you have a complaint:</p>

                    <ol className="list-decimal pl-6 space-y-2">
                        <li>
                            <strong>Contact Us:</strong> Email <a href="mailto:complaints@WhaleAlert ID.fi" className="text-blue-400 hover:underline">complaints@WhaleAlert ID.fi</a>
                            <p className="text-sm text-white/70">We acknowledge complaints within 48 hours and provide a resolution within 30 days.</p>
                        </li>
                        <li>
                            <strong>Escalation:</strong> If unsatisfied, escalate to our Compliance Officer at <a href="mailto:compliance@WhaleAlert ID.fi" className="text-blue-400 hover:underline">compliance@WhaleAlert ID.fi</a>
                        </li>
                        <li>
                            <strong>External Resolution:</strong> Contact Spanish consumer protection authorities:
                            <ul className="list-disc pl-6 text-sm text-white/70 mt-2">
                                <li>Dirección General de Consumo (regional offices)</li>
                                <li>European Consumer Centre Spain (ECC-Net)</li>
                                <li>Online Dispute Resolution (ODR) platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ec.europa.eu/consumers/odr</a></li>
                            </ul>
                        </li>
                    </ol>

                    <h3 className="text-2xl font-bold mb-3 mt-6">4.3. Investor Protection</h3>
                    <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-lg">
                        <h5 className="font-bold text-red-400 mb-3">⚠️ CRITICAL: No Investor Compensation Scheme</h5>
                        <p className="text-sm mb-2">
                            Unlike traditional financial services, cryptocurrency investments are <strong>NOT protected</strong> by:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Spanish Investor Guarantee Fund (FOGAIN)</li>
                            <li>Deposit Guarantee Scheme (DGS)</li>
                            <li>FSCS, FDIC, or any government insurance</li>
                        </ul>
                        <p className="text-sm mt-3 font-bold">
                            If the platform fails or you lose your private keys, there is NO safety net. Invest only what you can afford to lose.
                        </p>
                    </div>
                </section>

                {/* Sanctions */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-400" />
                        5. Sanctions & Restricted Territories
                    </h2>

                    <p className="mb-4">We comply with international sanctions regimes:</p>

                    <h3 className="text-2xl font-bold mb-3">5.1. Sanctioned Countries</h3>
                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg mb-4">
                        <h5 className="font-bold text-red-400 mb-2">🚫 Services NOT Available In:</h5>
                        <ul className="text-sm space-y-1">
                            <li>• <strong>EU Sanctions:</strong> Russia (restricted), Belarus,Syria, Iran, North Korea, Crimea, Donetsk, Luhansk</li>
                            <li>• <strong>US OFAC Sanctions:</strong> Cuba, Iran, North Korea, Syria, Venezuela (government), Crimea</li>
                            <li>• <strong>UN Sanctions:</strong> As updated periodically</li>
                        </ul>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">5.2. Screening</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>All users screened against sanctions lists at registration</li>
                        <li>Ongoing screening of transactions against sanctioned wallet addresses</li>
                        <li>Geolocation checks to prevent access from restricted territories</li>
                        <li>Immediate freezing of accounts linked to sanctioned entities</li>
                    </ul>
                </section>

                {/* Reporting */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <FileCheck className="text-green-400" />
                        6. Reporting & Transparency
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">6.1. Regulatory Reporting</h3>
                    <p className="mb-4">We file required reports with:</p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>CNMV:</strong> Crypto asset service provider registration and ongoing compliance reports</li>
                        <li><strong>AEPD:</strong> Data protection impact assessments, breach notifications</li>
                        <li><strong>SEPBLAC:</strong> Suspicious transaction reports</li>
                        <li><strong>Agencia Tributaria:</strong> Tax information (if legally required in future)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">6.2. Public Transparency</h3>
                    <p className="mb-4">We publish:</p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Annual Transparency Report (users, requests, incidents)</li>
                        <li>Security audit results (after remediation)</li>
                        <li>Smart contract addresses and source code</li>
                        <li>Proof of reserves (if we hold custodial assets in future)</li>
                    </ul>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg mt-4">
                        <h5 className="font-bold text-blue-400 mb-2">📊 Upcoming: 2026 Transparency Report</h5>
                        <p className="text-sm">Our first annual transparency report will be published in Q1 2027, covering calendar year 2026.</p>
                    </div>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">7. Compliance Contact</h2>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="mb-4">For compliance-related inquiries:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Compliance Officer:</span>
                                <a href="mailto:compliance@WhaleAlert ID.fi" className="text-blue-400 hover:underline">compliance@WhaleAlert ID.fi</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Complaints:</span>
                                <a href="mailto:complaints@WhaleAlert ID.fi" className="text-blue-400 hover:underline">complaints@WhaleAlert ID.fi</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">AML/KYC:</span>
                                <a href="mailto:kyc@WhaleAlert ID.fi" className="text-blue-400 hover:underline">kyc@WhaleAlert ID.fi</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Legal:</span>
                                <a href="mailto:legal@WhaleAlert ID.fi" className="text-blue-400 hover:underline">legal@WhaleAlert ID.fi</a>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Summary */}
                <section className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4">📋 Compliance Summary</h2>
                    <ul className="space-y-2 text-sm">
                        <li>✅ <strong>EU MiCA:</strong> Proactive compliance with new crypto regulation</li>
                        <li>✅ <strong>GDPR:</strong> Full data protection compliance with AEPD oversight</li>
                        <li>✅ <strong>Spanish LOPD:</strong> National data protection law compliance</li>
                        <li>✅ <strong>AML/CTF:</strong> Risk-based KYC, transaction monitoring, SAR reporting</li>
                        <li>✅ <strong>Tax Support:</strong> Transaction exports for Spanish tax filing (Modelo 720, capital gains)</li>
                        <li>✅ <strong>CNMV Registration:</strong> In progress for crypto service provider status</li>
                        <li>✅ <strong>Sanctions Screening:</strong> Compliance with EU, UN, OFAC sanctions</li>
                        <li>✅ <strong>Consumer Protection:</strong> Clear complaint handling and EU consumer rights</li>
                    </ul>
                </section>
            </div>
        </DocLayout>
    );
}

