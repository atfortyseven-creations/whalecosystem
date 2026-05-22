import DocLayout from '@/components/layout/DocLayout';

export default function PrivacyPolicy() {
    return (
        <DocLayout
            title="Privacy Policy"
            description="How we collect, use, and protect your personal data in compliance with GDPR and Spanish regulations."
            lastUpdated="February 7, 2026"
            category="Legal"
        >
            <div className="space-y-8">
                {/* Introduction */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
                    <p className="mb-4">
                        Welcome to Whale Alert Network ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized finance platform and services.
                    </p>
                    <p>
                        This policy complies with the EU General Data Protection Regulation (GDPR), the Spanish Organic Law on Data Protection and Guarantee of Digital Rights (LOPDGDD), and other applicable data protection laws.
                    </p>
                </section>

                {/* Data Controller */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">2. Data Controller</h2>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="font-bold mb-2">Data Controller Information:</p>
                        <ul className="space-y-1">
                            <li><strong>Entity:</strong> Whale Alert Network</li>
                            <li><strong>Address:</strong> [Complete Registered Address in Spain]</li>
                            <li><strong>Email:</strong> legal@whalealert.pro</li>
                            <li><strong>Data Protection Officer (DPO):</strong> dpo@whalealert.pro</li>
                        </ul>
                    </div>
                </section>

                {/* Data We Collect */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">3. Data We Collect</h2>
                    
                    <h3 className="text-2xl font-bold mb-3 mt-6">3.1. Account Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Email address</strong> (via Clerk authentication)</li>
                        <li><strong>Blockchain wallet address</strong> (public key only)</li>
                        <li><strong>World ID nullifier hash</strong> (for identity verification, anonymous)</li>
                        <li><strong>Username/display name</strong> (optional)</li>
                        <li><strong>Profile picture</strong> (optional)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.2. Biometric Data</h3>
                    <p className="mb-4">
                        When you opt to use biometric authentication (fingerprint, Face ID), this data is processed <strong>exclusively on your device</strong> using WebAuthn/FIDO2 standards. We never receive, store, or have access to your biometric data. Only cryptographic signatures are transmitted to our servers.
                    </p>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.3. Blockchain Activity</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Wallet balances (fetched from public blockchains via Alchemy)</li>
                        <li>Transaction history (public blockchain data)</li>
                        <li>NFT holdings (public blockchain data)</li>
                        <li>Smart contract interactions (public blockchain data)</li>
                    </ul>
                    <p className="mt-2 text-white/70">
                        <em>Note: This data is already public on blockchain networks. We only aggregate and display it for your convenience.</em>
                    </p>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.4. Trading Activity</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Trading orders and positions (simulated in demo mode)</li>
                        <li>Trading performance metrics</li>
                        <li>Risk preferences</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.5. Technical Data</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>IP address (for security and fraud prevention)</li>
                        <li>Browser type and version</li>
                        <li>Device type (mobile, desktop, tablet)</li>
                        <li>Operating system</li>
                        <li>Session logs and timestamps</li>
                        <li>Geolocation data (country/city level only, no precise location)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.6. Usage Data</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Pages visited and features used</li>
                        <li>Time spent on platform</li>
                        <li>Click patterns and navigation paths</li>
                        <li>Error logs and crash reports</li>
                    </ul>
                </section>

                {/* Legal Basis */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">4. Legal Basis for Processing</h2>
                    <p className="mb-4">We process your personal data under the following legal bases as defined by GDPR:</p>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-400 mb-2">a) Contractual Necessity (Art. 6(1)(b) GDPR)</h4>
                            <p className="text-sm">Processing necessary to provide our services (wallet management, institutional grid, identity verification).</p>
                        </div>

                        <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-lg">
                            <h4 className="font-bold text-green-400 mb-2">b) Legitimate Interest (Art. 6(1)(f) GDPR)</h4>
                            <p className="text-sm">Fraud prevention, security monitoring, platform improvement, and analytics.</p>
                        </div>

                        <div className="bg-purple-600/10 border border-purple-500/30 p-4 rounded-lg">
                            <h4 className="font-bold text-purple-400 mb-2">c) Consent (Art. 6(1)(a) GDPR)</h4>
                            <p className="text-sm">Marketing communications, optional features like biometric authentication.</p>
                        </div>

                        <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg">
                            <h4 className="font-bold text-red-400 mb-2">d) Legal Obligation (Art. 6(1)(c) GDPR)</h4>
                            <p className="text-sm">Compliance with AML/CTF regulations, tax reporting obligations, court orders.</p>
                        </div>
                    </div>
                </section>

                {/* How We Use Data */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">5. How We Use Your Data</h2>
                    <ul className="list-disc pl-6 space-y-3">
                        <li><strong>Service Delivery:</strong> Provide wallet management, institutional grid, and identity verification services.</li>
                        <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and security incidents.</li>
                        <li><strong>Analytics:</strong> Understand usage patterns to improve our platform.</li>
                        <li><strong>Communication:</strong> Send service updates, security alerts, and (with consent) marketing materials.</li>
                        <li><strong>Compliance:</strong> Meet legal obligations including AML/CTF, tax reporting, and regulatory requirements.</li>
                        <li><strong>Support:</strong> Respond to your inquiries and provide customer service.</li>
                    </ul>
                </section>

                {/* Data Sharing */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">6. Data Sharing and Third Parties</h2>
                    <p className="mb-4">We share your data with the following third-party processors:</p>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Alchemy (USA) </h4>
                            <p className="text-sm text-white/70 mb-2"><strong>Purpose:</strong> Blockchain data indexing and retrieval</p>
                            <p className="text-sm text-white/70 mb-2"><strong>Data Shared:</strong> Wallet addresses (public keys only)</p>
                            <p className="text-sm text-white/70"><strong>Safeguards:</strong> Standard Contractual Clauses (SCCs) for EU-US transfer</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Clerk (USA)</h4>
                            <p className="text-sm text-white/70 mb-2"><strong>Purpose:</strong> Authentication and user management</p>
                            <p className="text-sm text-white/70 mb-2"><strong>Data Shared:</strong> Email, username, authentication logs</p>
                            <p className="text-sm text-white/70"><strong>Safeguards:</strong> EU-US Data Privacy Framework certified</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Bybit (Singapore)</h4>
                            <p className="text-sm text-white/70 mb-2"><strong>Purpose:</strong> Trading data and market prices</p>
                            <p className="text-sm text-white/70 mb-2"><strong>Data Shared:</strong> Demo trading activity only (no personal data)</p>
                            <p className="text-sm text-white/70"><strong>Safeguards:</strong> Data Processing Agreement</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Vercel (USA)</h4>
                            <p className="text-sm text-white/70 mb-2"><strong>Purpose:</strong> Hosting and content delivery</p>
                            <p className="text-sm text-white/70 mb-2"><strong>Data Shared:</strong> All platform data (infrastructure provider)</p>
                            <p className="text-sm text-white/70"><strong>Safeguards:</strong> SOC 2 Type II certified, Standard Contractual Clauses</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">World ID / Identity (USA)</h4>
                            <p className="text-sm text-white/70 mb-2"><strong>Purpose:</strong> Proof of personhood verification</p>
                            <p className="text-sm text-white/70 mb-2"><strong>Data Shared:</strong> Nullifier hash only (anonymous)</p>
                            <p className="text-sm text-white/70"><strong>Safeguards:</strong> Zero-knowledge proofs ensure privacy</p>
                        </div>
                    </div>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-6">
                        <h4 className="font-bold text-yellow-400 mb-2">️ Legal Disclosures</h4>
                        <p className="text-sm">We may disclose your data to law enforcement, regulatory authorities, or in legal proceedings when required by Spanish or EU law, or to protect our legal rights.</p>
                    </div>
                </section>

                {/* Data Retention */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">7. Data Retention</h2>
                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Data Type</th>
                                <th className="border border-white/10 p-3 text-left">Retention Period</th>
                                <th className="border border-white/10 p-3 text-left">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">Account data</td>
                                <td className="border border-white/10 p-3">Until account deletion + 30 days</td>
                                <td className="border border-white/10 p-3">Service provision</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Transaction logs</td>
                                <td className="border border-white/10 p-3">5 years</td>
                                <td className="border border-white/10 p-3">Spanish tax law (Art. 29 Tax Code)</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Security logs</td>
                                <td className="border border-white/10 p-3">2 years</td>
                                <td className="border border-white/10 p-3">Security incident investigation</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Marketing consent</td>
                                <td className="border border-white/10 p-3">Until withdrawal + 30 days</td>
                                <td className="border border-white/10 p-3">Consent tracking</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Blockchain data</td>
                                <td className="border border-white/10 p-3">Permanent (public ledger)</td>
                                <td className="border border-white/10 p-3">Immutable blockchain nature</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Your Rights */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">8. Your Rights Under GDPR</h2>
                    <p className="mb-4">You have the following rights regarding your personal data:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Right of Access (Art. 15)</h4>
                            <p className="text-sm text-white/70">Request a copy of all personal data we hold about you.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">️ Right to Rectification (Art. 16)</h4>
                            <p className="text-sm text-white/70">Correct inaccurate or incomplete data.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">️ Right to Erasure (Art. 17)</h4>
                            <p className="text-sm text-white/70">Request deletion of your data ("right to be forgotten").</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">️ Right to Restriction (Art. 18)</h4>
                            <p className="text-sm text-white/70">Limit how we use your data.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Right to Data Portability (Art. 20)</h4>
                            <p className="text-sm text-white/70">Receive your data in a machine-readable format.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Right to Object (Art. 21)</h4>
                            <p className="text-sm text-white/70">Object to processing based on legitimate interests.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Right to Withdraw Consent (Art. 7)</h4>
                            <p className="text-sm text-white/70">Withdraw consent for marketing or optional features.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">️ Right to Lodge a Complaint (Art. 77)</h4>
                            <p className="text-sm text-white/70">File a complaint with the Spanish Data Protection Authority (AEPD).</p>
                        </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg mt-6">
                        <h4 className="font-bold text-blue-400 mb-2">How to Exercise Your Rights</h4>
                        <p className="text-sm mb-2">To exercise any of these rights, contact us at:</p>
                        <ul className="text-sm space-y-1">
                            <li> Email: <a href="mailto:privacy@WhaleAlert ID.fi" className="text-blue-400 hover:underline">privacy@WhaleAlert ID.fi</a></li>
                            <li> DPO Email: <a href="mailto:dpo@WhaleAlert ID.fi" className="text-blue-400 hover:underline">dpo@WhaleAlert ID.fi</a></li>
                        </ul>
                        <p className="text-sm mt-2 text-white/70">We will respond within <strong>30 days</strong> as required by GDPR.</p>
                    </div>

                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg mt-4">
                        <h4 className="font-bold text-red-400 mb-2">️ Blockchain Data Limitations</h4>
                        <p className="text-sm">Due to the immutable nature of blockchain technology, we <strong>cannot delete</strong> transaction data already recorded on public blockchains (Ethereum, Polygon, etc.). This data remains publicly accessible forever. However, we can delete our off-chain records and stop collecting new data.</p>
                    </div>
                </section>

                {/* Security */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">9. Security Measures</h2>
                    <p className="mb-4">We implement industry-standard security measures to protect your data:</p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest</li>
                        <li><strong>Authentication:</strong> Multi-factor authentication (MFA) via Clerk, WebAuthn biometrics, wallet signatures</li>
                        <li><strong>Access Control:</strong> Role-based access control (RBAC), principle of least privilege</li>
                        <li><strong>Monitoring:</strong> 24/7 security monitoring, intrusion detection systems (IDS)</li>
                        <li><strong>Audits:</strong> Regular security audits and penetration testing</li>
                        <li><strong>Incident Response:</strong> Data breach notification plan compliant with GDPR Art. 33-34</li>
                        <li><strong>Private Keys:</strong> Never stored on servers; processed client-side only</li>
                    </ul>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                        <h4 className="font-bold text-yellow-400 mb-2"> Data Breach Notification</h4>
                        <p className="text-sm">In the event of a data breach affecting your personal data, we will notify you and the Spanish Data Protection Authority (AEPD) within <strong>72 hours</strong> as required by GDPR Article 33.</p>
                    </div>
                </section>

                {/* Cookies */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">10. Cookies and Tracking</h2>
                    <p className="mb-4">We use the following types of cookies:</p>

                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Cookie Type</th>
                                <th className="border border-white/10 p-3 text-left">Purpose</th>
                                <th className="border border-white/10 p-3 text-left">Duration</th>
                                <th className="border border-white/10 p-3 text-left">Consent Required</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">Strictly Necessary</td>
                                <td className="border border-white/10 p-3">Authentication, security</td>
                                <td className="border border-white/10 p-3">Session</td>
                                <td className="border border-white/10 p-3">No (legal basis)</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Functional</td>
                                <td className="border border-white/10 p-3">User preferences, language</td>
                                <td className="border border-white/10 p-3">1 year</td>
                                <td className="border border-white/10 p-3">Yes</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Analytics</td>
                                <td className="border border-white/10 p-3">Usage statistics</td>
                                <td className="border border-white/10 p-3">2 years</td>
                                <td className="border border-white/10 p-3">Yes</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Marketing</td>
                                <td className="border border-white/10 p-3">Targeted advertising</td>
                                <td className="border border-white/10 p-3">13 months</td>
                                <td className="border border-white/10 p-3">Yes</td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="mt-4 text-sm">You can manage cookie preferences in our Cookie Settings panel or through your browser settings.</p>
                </section>

                {/* International Transfers */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">11. International Data Transfers</h2>
                    <p className="mb-4">
                        Some of our service providers are located outside the European Economic Area (EEA). When we transfer your data internationally, we ensure adequate safeguards are in place:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Standard Contractual Clauses (SCCs):</strong> Approved by the European Commission (Decision 2021/914)</li>
                        <li><strong>Adequacy Decisions:</strong> Transfers to countries deemed adequate by the European Commission</li>
                        <li><strong>EU-US Data Privacy Framework:</strong> For certified US companies</li>
                        <li><strong>Encryption:</strong> All data encrypted during transit and at rest</li>
                    </ul>

                    <p className="mt-4">
                        You can request a copy of the safeguards we use for international transfers by contacting <a href="mailto:dpo@WhaleAlert ID.fi" className="text-blue-400 hover:underline">dpo@WhaleAlert ID.fi</a>.
                    </p>
                </section>

                {/* Children's Privacy */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">12. Children's Privacy</h2>
                    <p className="mb-4">
                        Our services are <strong>not intended for users under 18 years of age</strong>. We do not knowingly collect personal data from children. If we discover that a child under 18 has provided us with personal data, we will delete it immediately.
                    </p>
                    <p>
                        If you are a parent or guardian and believe your child has provided us with personal data, please contact us at <a href="mailto:privacy@WhaleAlert ID.fi" className="text-blue-400 hover:underline">privacy@WhaleAlert ID.fi</a>.
                    </p>
                </section>

                {/* Changes to Policy */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">13. Changes to This Privacy Policy</h2>
                    <p className="mb-4">
                        We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Update the "Last Updated" date at the top of this page</li>
                        <li>Notify you via email (if you have an account)</li>
                        <li>Display a prominent notice on our platform</li>
                        <li>Request your consent again if required by law</li>
                    </ul>

                    <p className="mt-4">
                        We encourage you to review this Privacy Policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                {/* Supervisory Authority */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">14. Supervisory Authority</h2>
                    <p className="mb-4">
                        If you have concerns about how we handle your personal data, you have the right to lodge a complaint with the Spanish Data Protection Authority:
                    </p>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="font-bold mb-4">Agencia Española de Protección de Datos (AEPD)</p>
                        <ul className="space-y-1 text-sm">
                            <li><strong>Address:</strong> Calle Jorge Juan, 6, 28001 Madrid, Spain</li>
                            <li><strong>Phone:</strong> +34 91 266 35 17</li>
                            <li><strong>Website:</strong> <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.aepd.es</a></li>
                            <li><strong>Online Complaint:</strong> <a href="https://sedeagpd.gob.es" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">sedeagpd.gob.es</a></li>
                        </ul>
                    </div>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">15. Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">General Privacy Inquiries</h4>
                            <p className="text-sm"><a href="mailto:privacy@WhaleAlert ID.fi" className="text-blue-400 hover:underline">privacy@WhaleAlert ID.fi</a></p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Data Protection Officer</h4>
                            <p className="text-sm"><a href="mailto:dpo@WhaleAlert ID.fi" className="text-blue-400 hover:underline">dpo@WhaleAlert ID.fi</a></p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Legal Department</h4>
                            <p className="text-sm"><a href="mailto:legal@WhaleAlert ID.fi" className="text-blue-400 hover:underline">legal@WhaleAlert ID.fi</a></p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Security Issues</h4>
                            <p className="text-sm"><a href="mailto:security@WhaleAlert ID.fi" className="text-blue-400 hover:underline">security@WhaleAlert ID.fi</a></p>
                        </div>
                    </div>
                </section>

                {/* Summary */}
                <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4"> Summary</h2>
                    <ul className="space-y-2 text-sm">
                        <li> We collect minimal data necessary to provide our services</li>
                        <li> Your biometric data never leaves your device</li>
                        <li> Blockchain data is public by nature and cannot be deleted</li>
                        <li> You have full GDPR rights: access, rectification, erasure, portability</li>
                        <li> We use Standard Contractual Clauses for international transfers</li>
                        <li> You can contact our DPO at <a href="mailto:dpo@WhaleAlert ID.fi" className="text-blue-400 hover:underline">dpo@WhaleAlert ID.fi</a></li>
                        <li> We comply with GDPR, Spanish LOPD, and EU crypto regulations</li>
                    </ul>
                </section>
            </div>
        </DocLayout>
    );
}

