import DocLayout from '@/components/layout/DocLayout';

export default function TermsOfService() {
    return (
        <DocLayout
            title="Terms of Service"
            description="Legal agreement governing your use of Whale Alert Network platform and services."
            lastUpdated="February 7, 2026"
            category="Legal"
        >
            <div className="space-y-8">
                {/* Acceptance */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">
                        By accessing or using Whale Alert Network ("Platform," "Service," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Platform.
                    </p>
                    <p className="mb-4">
                        These Terms constitute a legally binding agreement between you and Whale Alert Network. Please read them carefully before using our services.
                    </p>

                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-2">️ Important Notice</h4>
                        <p className="text-sm">By using this Platform, you acknowledge that cryptocurrency trading and DeFi activities involve significant financial risk. You may lose all invested funds. We do not provide investment advice.</p>
                    </div>
                </section>

                {/* Service Description */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">2. Service Description</h2>
                    <p className="mb-4">WhaleAlert ID.fi provides the following services:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Zero-Knowledge Identity</h4>
                            <p className="text-sm text-white/70">Privacy-preserving identity verification using ZK-proofs and biometric authentication.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Multi-Chain Wallet</h4>
                            <p className="text-sm text-white/70">Self-custody wallet supporting Ethereum, Base, Polygon, Arbitrum, and Optimism.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Institutional Grid</h4>
                            <p className="text-sm text-white/70">Professional trading interface with real-time data for 30+ crypto pairs (demo mode).</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Portfolio Analytics</h4>
                            <p className="text-sm text-white/70">Real-time blockchain analytics powered by Alchemy API.</p>
                        </div>
                    </div>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                        <h4 className="font-bold text-yellow-400 mb-2"> Demo Mode vs Production</h4>
                        <p className="text-sm">Trading features currently operate in <strong>DEMO MODE</strong> with simulated funds. Real trading requires explicit wallet connection and user confirmation for each transaction. We never have custody of your funds.</p>
                    </div>
                </section>

                {/* Eligibility */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">3. Eligibility</h2>
                    <p className="mb-4">To use our Platform, you must:</p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Be at least <strong>18 years old</strong></li>
                        <li>Have the legal capacity to enter into binding contracts</li>
                        <li>Not be located in a restricted jurisdiction (see Section 3.1)</li>
                        <li>Comply with all applicable local laws regarding cryptocurrency use</li>
                        <li>Not be subject to sanctions by the EU, US, or UN</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.1. Geographic Restrictions</h3>
                    <p className="mb-4">Our services are <strong>NOT available</strong> to users in the following jurisdictions:</p>

                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-2"> Restricted Territories</h4>
                        <ul className="text-sm space-y-1">
                            <li> United States and its territories</li>
                            <li> North Korea, Iran, Syria, Cuba</li>
                            <li> Crimea, Donetsk, Luhansk regions</li>
                            <li> Any jurisdiction where cryptocurrency services are prohibited</li>
                            <li> OFAC-sanctioned countries and territories</li>
                        </ul>
                    </div>

                    <p className="mt-4 text-sm text-white/70">
                        We reserve the right to restrict access from additional jurisdictions at our discretion to comply with evolving regulations.
                    </p>
                </section>

                {/* Account Registration */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">4. Account Registration and Security</h2>

                    <h3 className="text-2xl font-bold mb-3">4.1. Account Creation</h3>
                    <p className="mb-4">To access certain features, you must:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate and complete information</li>
                        <li>Verify your email address</li>
                        <li>Connect a Web3 wallet (e.g., MetaMask, WalletConnect)</li>
                        <li>Optionally complete identity verification (World ID)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">4.2. Account Security</h3>
                    <p className="mb-4">You are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Maintaining the confidentiality of your private keys and seed phrases</li>
                        <li>All activities that occur under your account</li>
                        <li>Immediately notifying us of any unauthorized access</li>
                        <li>Using strong passwords and enabling two-factor authentication</li>
                    </ul>

                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg mt-4">
                        <h4 className="font-bold text-red-400 mb-2"> Private Key Responsibility</h4>
                        <p className="text-sm">We do NOT store your private keys, seed phrases, or passwords. If you lose them, <strong>we CANNOT recover your wallet or funds</strong>. This is a fundamental principle of self-custody.</p>
                    </div>
                </section>

                {/* Prohibited Uses */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">5. Prohibited Uses</h2>
                    <p className="mb-4">You agree NOT to use the Platform for:</p>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Money laundering or terrorist financing</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Fraud, scams, or Ponzi schemes</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Market manipulation or wash trading</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Hacking or unauthorized access attempts</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Violating sanctions or embargoes</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Infringing intellectual property rights</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Distributing malware or viruses</p>
                        </div>
                        <div className="bg-red-600/5 p-3 rounded-lg border border-red-500/20">
                            <p className="text-sm"> Circumventing security measures</p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm">
                        Violation of these prohibitions may result in immediate account termination and referral to law enforcement authorities.
                    </p>
                </section>

                {/* Trading Risk Disclosures */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">6. Trading Risk Disclosures</h2>

                    <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-4">️ CRITICAL: READ BEFORE TRADING</h4>
                        
                        <div className="space-y-4 text-sm">
                            <p className="font-bold">Trading cryptocurrencies involves substantial risk of loss. You should only trade with funds you can afford to lose entirely.</p>

                            <div className="space-y-2">
                                <h5 className="font-bold">Specific Risks Include:</h5>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Volatility:</strong> Cryptocurrency prices can fluctuate wildly, including going to zero</li>
                                    <li><strong>Liquidity:</strong> You may not be able to sell at your desired price</li>
                                    <li><strong>Leverage:</strong> Using leverage magnifies both gains AND losses</li>
                                    <li><strong>Smart Contract Risk:</strong> Bugs or exploits in smart contracts can result in total loss</li>
                                    <li><strong>Regulatory Risk:</strong> Changes in laws may affect crypto legality or value</li>
                                    <li><strong>Technical Risk:</strong> Network congestion, failed transactions, or hacks</li>
                                    <li><strong>Irreversible Transactions:</strong> Blockchain transactions cannot be reversed</li>
                                    <li><strong>Lack of Insurance:</strong> Crypto assets are not insured by government agencies</li>
                                </ul>
                            </div>

                            <div className="bg-black/30 p-3 rounded">
                                <p className="font-bold">Past Performance  Future Results</p>
                                <p className="text-xs mt-1">Historical prices and charts do not predict future performance. All trading decisions are your sole responsibility.</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">6.1. No Investment Advice</h3>
                    <p className="mb-4">
                        Whale Alert Network is a <strong>technology platform</strong>, not a financial advisor or investment advisor. We provide tools, data, and infrastructurenot recommendations or advice.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>We do NOT recommend buying, selling, or holding any specific cryptocurrency</li>
                        <li>Price data and charts are for informational purposes only</li>
                        <li>You should consult a qualified financial advisor before trading</li>
                        <li>We are NOT registered with any financial regulatory authority as an investment firm</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">6.2. Order Execution</h3>
                    <p className="mb-4">For real trading (when enabled):</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Orders are executed on a "best effort" basis without guaranteed prices</li>
                        <li>Network congestion may cause delays or failed transactions</li>
                        <li>You pay blockchain gas fees for all transactions</li>
                        <li>Slippage may occur between order placement and execution</li>
                        <li>We do not guarantee order fills or execution speed</li>
                    </ul>
                </section>

                {/* Fees */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">7. Fees</h2>

                    <h3 className="text-2xl font-bold mb-3">7.1. Platform Fees</h3>
                    <p className="mb-4">Current fee structure:</p>

                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Service</th>
                                <th className="border border-white/10 p-3 text-left">Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">Identity Verification (GHOST tier)</td>
                                <td className="border border-white/10 p-3">FREE</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Wallet Portfolio Tracking</td>
                                <td className="border border-white/10 p-3">FREE</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Institutional Grid (Demo Mode)</td>
                                <td className="border border-white/10 p-3">FREE</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Analytics & Insights</td>
                                <td className="border border-white/10 p-3">FREE (Beta)</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Premium Features</td>
                                <td className="border border-white/10 p-3">TBD (Not yet available)</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="text-2xl font-bold mb-3 mt-6">7.2. Blockchain Fees (Gas)</h3>
                    <p className="mb-4">
                        All blockchain transactions require <strong>gas fees</strong> paid directly to network validators. These fees:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Are paid in the native token (ETH, MATIC, etc.)</li>
                        <li>Vary based on network congestion</li>
                        <li>Are NOT collected by WhaleAlert ID.fi</li>
                        <li>Are non-refundable even if the transaction fails</li>
                        <li>Must be paid from your wallet balance</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">7.3. Fee Changes</h3>
                    <p>
                        We reserve the right to modify fees with <strong>30 days' notice</strong> via email and platform notification. Continued use after fee changes constitutes acceptance.
                    </p>
                </section>

                {/* Intellectual Property */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">8. Intellectual Property</h2>

                    <h3 className="text-2xl font-bold mb-3">8.1. Our Rights</h3>
                    <p className="mb-4">
                        All content on the Platform, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Logo, branding, and design elements</li>
                        <li>Software code and algorithms</li>
                        <li>User interface and user experience</li>
                        <li>Documentation and tutorials</li>
                        <li>Text, graphics, and multimedia content</li>
                    </ul>
                    <p className="mt-4">
                        ...are owned by WhaleAlert ID.fi or our licensors and protected by copyright, trademark, and other intellectual property laws.
                    </p>

                    <h3 className="text-2xl font-bold mb-3 mt-6">8.2. Limited License</h3>
                    <p className="mb-4">
                        We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes, subject to these Terms.
                    </p>

                    <h3 className="text-2xl font-bold mb-3 mt-6">8.3. Prohibited Uses</h3>
                    <p className="mb-4">You may NOT:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Copy, modify, or create derivative works</li>
                        <li>Reverse engineer or decompile our software</li>
                        <li>Remove copyright or proprietary notices</li>
                        <li>Use our brand for commercial purposes without permission</li>
                        <li>Frame or mirror our Platform</li>
                    </ul>
                </section>

                {/* Disclaimer of Warranties */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">9. Disclaimer of Warranties</h2>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-6 rounded-lg">
                        <p className="font-bold mb-4">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</p>

                        <p className="mb-4 text-sm">To the fullest extent permitted by law, we DISCLAIM all warranties, express or implied, including but not limited to:</p>

                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>Merchantability, fitness for a particular purpose, non-infringement</li>
                            <li>Accuracy, reliability, or completeness of data or content</li>
                            <li>Uninterrupted or error-free service</li>
                            <li>Security of data transmission or storage</li>
                            <li>Prevention of hacks, bugs, or system failures</li>
                            <li>Compatibility with your devices or software</li>
                        </ul>

                        <p className="mt-4 text-sm">
                            You use the Platform at your own risk. We do not warrant that the Platform will meet your requirements or that defects will be corrected.
                        </p>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">10. Limitation of Liability</h2>

                    <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-lg">
                        <p className="font-bold mb-4">TO THE MAXIMUM EXTENT PERMITTED BY SPANISH AND EU LAW:</p>

                        <p className="mb-4 text-sm">WhaleAlert ID.fi, its directors, employees, agents, and affiliates SHALL NOT BE LIABLE for:</p>

                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li><strong>Loss of Funds:</strong> Loss of cryptocurrency, tokens, or NFTs due to trading, smart contracts, hacks, or user error</li>
                            <li><strong>Market Losses:</strong> Trading losses, failed investments, or price volatility</li>
                            <li><strong>Data Loss:</strong> Loss of data, including private keys or seed phrases</li>
                            <li><strong>Service Interruptions:</strong> Downtime, outages, or service degradation</li>
                            <li><strong>Third-Party Actions:</strong> Actions of Alchemy, Bybit, Clerk, or other service providers</li>
                            <li><strong>Blockchain Issues:</strong> Network forks, congestion, or protocol changes</li>
                            <li><strong>Regulatory Changes:</strong> Changes in laws affecting cryptocurrency legality</li>
                            <li><strong>Indirect Damages:</strong> Consequential, incidental, punitive, or special damages</li>
                        </ul>

                        <p className="mt-4 text-sm font-bold">
                            OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED 100 OR THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE CLAIM, WHICHEVER IS GREATER.
                        </p>

                        <p className="mt-4 text-xs text-white/70">
                            Note: Spanish and EU consumer protection laws may limit our ability to disclaim certain warranties or liabilities. Nothing in these Terms excludes liability for death, personal injury, fraud, or fraudulent misrepresentation.
                        </p>
                    </div>
                </section>

                {/* Indemnification */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">11. Indemnification</h2>
                    <p className="mb-4">
                        You agree to indemnify, defend, and hold harmless WhaleAlert ID.fi, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Your use or misuse of the Platform</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any law or regulation</li>
                        <li>Your violation of third-party rights (including intellectual property)</li>
                        <li>Your trading or investment decisions</li>
                        <li>Your wallet transactions or smart contract interactions</li>
                    </ul>
                </section>

                {/* Termination */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">12. Termination</h2>

                    <h3 className="text-2xl font-bold mb-3">12.1. By You</h3>
                    <p className="mb-4">
                        You may terminate your account at any time by disconnecting your wallet and ceasing to use the Platform. You remain responsible for any obligations incurred before termination.
                    </p>

                    <h3 className="text-2xl font-bold mb-3">12.2. By Us</h3>
                    <p className="mb-4">We may suspend or terminate your account immediately, without notice, if:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You violate these Terms</li>
                        <li>We suspect fraud, illegal activity, or security threats</li>
                        <li>We are required by law or regulatory order</li>
                        <li>We cease offering the Platform</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">12.3. Effect of Termination</h3>
                    <p className="mb-4">Upon termination:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Your license to use the Platform terminates immediately</li>
                        <li>We may delete your off-chain account data (after required retention periods)</li>
                        <li>You retain access to your self-custody wallet (we cannot restrict blockchain access)</li>
                        <li>Sections 8-11, 13-15 survive termination</li>
                    </ul>
                </section>

                {/* Governing Law */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">13. Governing Law and Jurisdiction</h2>

                    <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-3">13.1. Spanish Law</h3>
                        <p className="mb-4 text-sm">
                            These Terms shall be governed by and construed in accordance with the laws of <strong>Spain</strong>, without regard to its conflict of law provisions.
                        </p>

                        <h3 className="text-xl font-bold mb-3">13.2. Jurisdiction</h3>
                        <p className="mb-4 text-sm">
                            Any disputes arising from these Terms or your use of the Platform shall be subject to the <strong>exclusive jurisdiction of the courts of [Madrid/Barcelona/Your Spanish City]</strong>, Spain.
                        </p>

                        <h3 className="text-xl font-bold mb-3">13.3. EU Consumer Rights</h3>
                        <p className="text-sm">
                            If you are a consumer resident in the European Union, you may also bring proceedings in your country of residence, and you retain all mandatory consumer protection rights under EU law.
                        </p>
                    </div>
                </section>

                {/* Dispute Resolution */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">14. Dispute Resolution</h2>

                    <h3 className="text-2xl font-bold mb-3">14.1. Informal Resolution</h3>
                    <p className="mb-4">
                        Before filing any legal claim, you agree to contact us at <a href="mailto:legal@WhaleAlert ID.fi" className="text-blue-400 hover:underline">legal@WhaleAlert ID.fi</a> to attempt informal resolution. We will try to resolve disputes amicably within 30 days.
                    </p>

                    <h3 className="text-2xl font-bold mb-3">14.2. Arbitration (Optional)</h3>
                    <p className="mb-4">
                        If informal resolution fails, disputes may be resolved through binding arbitration under the rules of the Spanish Arbitration Court, conducted in Spanish or English.
                    </p>

                    <h3 className="text-2xl font-bold mb-3">14.3. Class Action Waiver</h3>
                    <p className="mb-4">
                        To the extent permitted by law, you agree to bring claims only in your individual capacity, not as part of a class action or collective proceeding.
                    </p>

                    <p className="text-sm text-white/70">
                        <em>Note: EU consumers may have mandatory rights to bring class actions under certain circumstances, which cannot be waived.</em>
                    </p>
                </section>

                {/* Force Majeure */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">15. Force Majeure</h2>
                    <p className="mb-4">
                        We shall not be liable for any failure or delay in performance due to events beyond our reasonable control, including:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Natural disasters (earthquakes, floods, pandemics)</li>
                        <li>War, terrorism, civil unrest</li>
                        <li>Government actions, embargoes, sanctions</li>
                        <li>Blockchain network failures or forks</li>
                        <li>Third-party service outages (Alchemy, Vercel, etc.)</li>
                        <li>Cyberattacks, DDoS attacks, or hacks</li>
                        <li>Power outages or telecommunications failures</li>
                    </ul>
                </section>

                {/* Modifications */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">16. Modifications to Terms</h2>
                    <p className="mb-4">
                        We may update these Terms from time to time. When we make material changes, we will:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Update the "Last Updated" date</li>
                        <li>Notify you via email (if you have an account)</li>
                        <li>Display a prominent notice on the Platform for 30 days</li>
                        <li>Request explicit consent for material changes (if required by EU law)</li>
                    </ul>

                    <p className="mt-4">
                        Continued use after changes constitutes acceptance. If you disagree with changes, you must stop using the Platform.
                    </p>
                </section>

                {/* Severability */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">17. Severability</h2>
                    <p>
                        If any provision of these Terms is found to be unlawful, void, or unenforceable by a court of competent jurisdiction, that provision shall be severed, and the remaining provisions shall remain in full force and effect.
                    </p>
                </section>

                {/* Entire Agreement */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">18. Entire Agreement</h2>
                    <p>
                        These Terms, together with our Privacy Policy and any other legal notices published on the Platform, constitute the entire agreement between you and WhaleAlert ID.fi regarding your use of the Platform.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">19. Contact Information</h2>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="mb-4">For questions about these Terms, contact us at:</p>
                        <ul className="space-y-1 text-sm">
                            <li><strong>Legal Department:</strong> <a href="mailto:legal@whalealert.pro" className="text-blue-400 hover:underline">legal@whalealert.pro</a></li>
                            <li><strong>General Support:</strong> <a href="mailto:support@whalealert.pro" className="text-blue-400 hover:underline">support@whalealert.pro</a></li>
                            <li><strong>Address:</strong> [Complete Registered Business Address in Spain]</li>
                        </ul>
                    </div>
                </section>

                {/* Summary */}
                <section className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4"> Key Points Summary</h2>
                    <ul className="space-y-2 text-sm">
                        <li> You must be 18+ and not in a restricted jurisdiction</li>
                        <li> You are responsible for your private keys and funds</li>
                        <li> Trading involves significant risk; you may lose everything</li>
                        <li> We provide technology, not investment advice</li>
                        <li> Platform is provided "as is" without warranties</li>
                        <li> Our liability is limited to the maximum extent permitted by law</li>
                        <li> Governed by Spanish law; disputes resolved in Spanish courts</li>
                        <li> We may modify these Terms with 30 days' notice</li>
                    </ul>
                </section>
            </div>
        </DocLayout>
    );
}

