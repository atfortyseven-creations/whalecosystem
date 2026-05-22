import DocLayout from '@/components/layout/DocLayout';
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle2, FileText, Bug } from 'lucide-react';

export default function SecurityPage() {
    return (
        <DocLayout
            title="Security"
            description="Our commitment to protecting your data, assets, and privacy through industry-leading security practices."
            lastUpdated="February 7, 2026"
            category="Legal"
        >
            <div className="space-y-8">
                {/* Introduction */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">Security at WhaleAlert ID.fi</h2>
                    <p className="mb-4">
                        Security is the foundation of everything we build. As a decentralized finance platform handling sensitive identity data and enabling cryptocurrency transactions, we implement <strong>defense-in-depth</strong> security measures across all layers of our infrastructure.
                    </p>
                    <p>
                        This page explains our security architecture, practices, and how we protect you.
                    </p>
                </section>

                {/* Security Principles */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="text-blue-400" />
                        1. Core Security Principles
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg">
                            <h4 className="font-bold mb-2"> Self-Custody First</h4>
                            <p className="text-sm text-white/70">Your private keys never touch our servers. You maintain complete control over your funds.</p>
                        </div>

                        <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">️ Zero-Knowledge Privacy</h4>
                            <p className="text-sm text-white/70">Identity verification without revealing personal information using cryptographic proofs.</p>
                        </div>

                        <div className="bg-purple-600/10 border border-purple-500/30 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">️ Defense in Depth</h4>
                            <p className="text-sm text-white/70">Multiple overlapping security layers ensure no single point of failure.</p>
                        </div>

                        <div className="bg-orange-600/10 border border-orange-500/30 p-4 rounded-lg">
                            <h4 className="font-bold mb-2"> Transparency</h4>
                            <p className="text-sm text-white/70">Open about our architecture, audits, and security practices.</p>
                        </div>
                    </div>
                </section>

                {/* Infrastructure Security */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">2. Infrastructure Security</h2>

                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                        <Lock />
                        2.1. Encryption
                    </h3>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                        <h4 className="font-bold mb-4">Data in Transit</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>TLS 1.3:</strong> All HTTPS connections use the latest Transport Layer Security protocol</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Perfect Forward Secrecy:</strong> Session keys cannot be compromised even if long-term keys are exposed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Certificate Pinning:</strong> Prevents man-in-the-middle attacks</span>
                            </li>
                        </ul>

                        <h4 className="font-bold mb-4 mt-6">Data at Rest</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>AES-256:</strong> Military-grade encryption for database storage</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Encrypted Backups:</strong> All backups encrypted with separate keys</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Key Rotation:</strong> Encryption keys rotated every 90 days</span>
                            </li>
                        </ul>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                        <Key />
                        2.2. Private Key Management
                    </h3>

                    <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-3"> CRITICAL: We NEVER Have Your Private Keys</h4>
                        <p className="text-sm mb-4">Your wallet private keys are generated and stored ONLY on your device. We use:</p>

                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Client-Side Key Generation:</strong> Keys generated in your browser using Web3.js/ethers.js</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Hardware Wallet Support:</strong> Ledger, Trezor, and other hardware wallets fully supported</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>WalletConnect Protocol:</strong> Secure bridge between dApp and wallet</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                <span><strong>Transaction Signing:</strong> All transactions signed locally before submission</span>
                            </li>
                        </ul>

                        <p className="text-sm mt-4 font-bold">
                            ️ If you lose your seed phrase, we CANNOT recover your wallet. This is by designyour funds, your control.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">2.3. Hosting & Infrastructure</h3>

                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Component</th>
                                <th className="border border-white/10 p-3 text-left">Provider</th>
                                <th className="border border-white/10 p-3 text-left">Security Features</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">Frontend Hosting</td>
                                <td className="border border-white/10 p-3">Vercel (SOC 2 Type II)</td>
                                <td className="border border-white/10 p-3">Edge caching, DDoS protection, auto HTTPS</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Database</td>
                                <td className="border border-white/10 p-3">Railway / Supabase</td>
                                <td className="border border-white/10 p-3">Encrypted at rest, VPC isolation, daily backups</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">Auth Service</td>
                                <td className="border border-white/10 p-3">Clerk (SOC 2)</td>
                                <td className="border border-white/10 p-3">MFA, session management, anomaly detection</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">Blockchain Data</td>
                                <td className="border border-white/10 p-3">Alchemy</td>
                                <td className="border border-white/10 p-3">Read-only access, public data only</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Authentication */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">3. Authentication & Access Control</h2>

                    <h3 className="text-2xl font-bold mb-3">3.1. Multi-Factor Authentication (MFA)</h3>
                    <p className="mb-4">We support multiple authentication methods:</p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Email + Password</h4>
                            <p className="text-xs text-white/70">Basic tier with rate limiting</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Passkeys (WebAuthn)</h4>
                            <p className="text-xs text-white/70">Biometric (Face ID, Touch ID, Windows Hello)</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> World ID</h4>
                            <p className="text-xs text-white/70">Zero-knowledge proof of personhood</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Wallet Signature</h4>
                            <p className="text-xs text-white/70">Sign-in with Ethereum (SIWE)</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> TOTP (2FA)</h4>
                            <p className="text-xs text-white/70">Google Authenticator, Authy</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Hardware Keys</h4>
                            <p className="text-xs text-white/70">YubiKey, Titan Key (FIDO2)</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.2. Session Management</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Secure Cookies:</strong> HttpOnly, Secure, SameSite=Strict flags</li>
                        <li><strong>Session Timeout:</strong> Automatic logout after 30 minutes of inactivity</li>
                        <li><strong>Device Tracking:</strong> Login from new devices triggers email notification</li>
                        <li><strong>Concurrent Session Limits:</strong> Maximum 3 active sessions per user</li>
                        <li><strong>Logout Everywhere:</strong> One-click logout from all devices</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">3.3. Role-Based Access Control (RBAC)</h3>
                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Tier</th>
                                <th className="border border-white/10 p-3 text-left">Authentication</th>
                                <th className="border border-white/10 p-3 text-left">Permissions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">GHOST</td>
                                <td className="border border-white/10 p-3">Email only</td>
                                <td className="border border-white/10 p-3">Read-only access, demo trading</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">HUMAN</td>
                                <td className="border border-white/10 p-3">Email + World ID</td>
                                <td className="border border-white/10 p-3">Full wallet access, real trading</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3">LEGEND</td>
                                <td className="border border-white/10 p-3">MFA + Passkeys</td>
                                <td className="border border-white/10 p-3">Premium features, API access</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Application Security */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">4. Application Security</h2>

                    <h3 className="text-2xl font-bold mb-3">4.1. Code Security</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Secure Development:</strong> OWASP Top 10 compliance, security training for developers</li>
                        <li><strong>Code Reviews:</strong> All code peer-reviewed before deployment</li>
                        <li><strong>Static Analysis:</strong> Automated scanning with SonarQube, Snyk</li>
                        <li><strong>Dependency Scanning:</strong> Automated checks for vulnerable npm packages</li>
                        <li><strong>Secrets Management:</strong> Environment variables never committed to Git</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">4.2. Web Security</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">️ CSRF Protection</h4>
                            <p className="text-sm text-white/70">Anti-CSRF tokens on all state-changing requests</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> XSS Prevention</h4>
                            <p className="text-sm text-white/70">Content Security Policy (CSP), input sanitization</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> SQL Injection Defense</h4>
                            <p className="text-sm text-white/70">Parameterized queries, ORM (Prisma) with type safety</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Clickjacking Protection</h4>
                            <p className="text-sm text-white/70">X-Frame-Options: DENY header</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> HTTPS Enforcement</h4>
                            <p className="text-sm text-white/70">HSTS with preloading, automatic redirect from HTTP</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2"> Rate Limiting</h4>
                            <p className="text-sm text-white/70">API rate limits, login attempt throttling</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">4.3. Smart Contract Security</h3>
                    <p className="mb-4">For deployed smart contracts (if applicable):</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Formal Verification:</strong> Mathematical proofs of contract correctness</li>
                        <li><strong>External Audits:</strong> Security audits by reputable firms (OpenZeppelin, Trail of Bits)</li>
                        <li><strong>Bug Bounties:</strong> Ongoing rewards for responsible disclosure</li>
                        <li><strong>Timelock Upgrades:</strong> 48-hour delay on contract modifications</li>
                        <li><strong>Multi-Sig Control:</strong> Critical functions require 3-of-5 signatures</li>
                    </ul>
                </section>

                {/* Monitoring */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Eye />
                        5. Monitoring & Incident Response
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">5.1. Security Monitoring</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>24/7 Monitoring:</strong> Real-time alerts for suspicious activity</li>
                        <li><strong>Intrusion Detection:</strong> Automated detection of attack patterns</li>
                        <li><strong>Log Aggregation:</strong> Centralized logging for forensic analysis</li>
                        <li><strong>Anomaly Detection:</strong> Machine learning models detect unusual behavior</li>
                        <li><strong>SIEM Integration:</strong> Security Information and Event Management</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-3 mt-6">5.2. Incident Response Plan</h3>
                    <p className="mb-4">In the event of a security incident:</p>

                    <div className="space-y-3">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Step 1: Detection & Triage (0-1 hour)</h4>
                            <p className="text-sm text-white/70">Automated alerts trigger immediate investigation. Severity assessed and incident response team activated.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Step 2: Containment (1-4 hours)</h4>
                            <p className="text-sm text-white/70">Isolate affected systems. Block malicious IPs. Disable compromised accounts. Preserve evidence.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Step 3: Notification (Within 72 hours)</h4>
                            <p className="text-sm text-white/70">Notify affected users via email. Report to AEPD (Spanish Data Protection Authority) if personal data is breached. Public disclosure if required by law.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Step 4: Recovery & Post-Mortem</h4>
                            <p className="text-sm text-white/70">Restore from secure backups. Patch vulnerabilities. Conduct forensic analysis. Publish incident report.</p>
                        </div>
                    </div>
                </section>

                {/* Audits */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <FileText />
                        6. Security Audits & Certifications
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">6.1. External Audits</h3>
                    <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-lg">
                        <p className="mb-4"><strong>Audit Status:</strong> In Progress / Upcoming</p>
                        <ul className="space-y-2 text-sm">
                            <li> <strong>Smart Contract Audits:</strong> Scheduled with [Auditor Name] for Q2 2026</li>
                            <li> <strong>Penetration Testing:</strong> Annual third-party pentests</li>
                            <li> <strong>GDPR Compliance:</strong> Data protection impact assessment completed</li>
                        </ul>
                        <p className="mt-4 text-sm text-white/70">
                            Audit reports will be published here upon completion and remediation of findings.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 mt-6">6.2. Certifications</h3>
                    <p className="mb-4">Our third-party providers hold:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>SOC 2 Type II:</strong> Vercel, Clerk</li>
                        <li><strong>ISO 27001:</strong> Planning for 2026</li>
                        <li><strong>PCI DSS:</strong> Not applicable (no credit card processing)</li>
                    </ul>
                </section>

                {/* Bug Bounty */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Bug />
                        7. Bug Bounty Program
                    </h2>

                    <div className="bg-green-600/10 border border-green-500/30 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4"> Responsible Disclosure Rewards</h3>
                        <p className="mb-4 text-sm">We welcome security researchers to help us keep WhaleAlert ID.fi secure. Report vulnerabilities responsibly and earn rewards:</p>

                        <table className="w-full border border-white/10 text-sm mb-4">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="border border-white/10 p-3 text-left">Severity</th>
                                    <th className="border border-white/10 p-3 text-left">Reward</th>
                                    <th className="border border-white/10 p-3 text-left">Examples</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-white/10 p-3 text-red-400 font-bold">CRITICAL</td>
                                    <td className="border border-white/10 p-3">$5,000 - $10,000</td>
                                    <td className="border border-white/10 p-3">Private key exposure, RCE, SQL injection</td>
                                </tr>
                                <tr className="bg-white/5">
                                    <td className="border border-white/10 p-3 text-orange-400 font-bold">HIGH</td>
                                    <td className="border border-white/10 p-3">$1,000 - $5,000</td>
                                    <td className="border border-white/10 p-3">Auth bypass, XSS with data exfiltration</td>
                                </tr>
                                <tr>
                                    <td className="border border-white/10 p-3 text-yellow-400 font-bold">MEDIUM</td>
                                    <td className="border border-white/10 p-3">$250 - $1,000</td>
                                    <td className="border border-white/10 p-3">CSRF, open redirects</td>
                                </tr>
                                <tr className="bg-white/5">
                                    <td className="border border-white/10 p-3 text-blue-400 font-bold">LOW</td>
                                    <td className="border border-white/10 p-3">$50 - $250</td>
                                    <td className="border border-white/10 p-3">Info disclosure, minor misconfigurations</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="bg-white/10 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">How to Report:</h4>
                            <ol className="list-decimal pl-6 space-y-1 text-sm">
                                <li>Email <a href="mailto:security@WhaleAlert ID.fi" className="text-blue-400 hover:underline">security@WhaleAlert ID.fi</a> with details</li>
                                <li>Include steps to reproduce, impact assessment, and proof-of-concept (if applicable)</li>
                                <li>Give us 90 days to fix before public disclosure</li>
                                <li>Do NOT exploit the vulnerability beyond verification</li>
                            </ol>
                        </div>

                        <p className="mt-4 text-xs text-white/70">
                            <em>Out of scope: Social engineering, DDoS, phishing, physical attacks, third-party services (unless directly affecting our users).</em>
                        </p>
                    </div>
                </section>

                {/* Best Practices */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle />
                        8. User Security Best Practices
                    </h2>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">️ Protect Yourself</h3>
                        <p className="mb-4 text-sm">Security is a shared responsibility. Here's how to keep your account safe:</p>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-bold mb-2"> DO:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Enable 2FA/MFA immediately</li>
                                    <li>Use strong, unique passwords (20+ chars)</li>
                                    <li>Store seed phrases offline (paper, metal)</li>
                                    <li>Verify URL before entering credentials</li>
                                    <li>Use hardware wallets for large amounts</li>
                                    <li>Keep software/browser updated</li>
                                    <li>Review account activity regularly</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold mb-2"> DON'T:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Share seed phrases with ANYONE (not even us!)</li>
                                    <li>Click suspicious links in emails/DMs</li>
                                    <li>Use public WiFi without VPN</li>
                                    <li>Screenshot seed phrases</li>
                                    <li>Enter seed on fake websites</li>
                                    <li>Reuse passwords across sites</li>
                                    <li>Ignore security alerts</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-red-600/20 border border-red-500/40 p-4 rounded-lg mt-4">
                            <h4 className="font-bold text-red-400 mb-2"> Common Scams to Avoid:</h4>
                            <ul className="text-xs space-y-1">
                                <li> <strong>Phishing:</strong> Fake emails/websites impersonating WhaleAlert ID.fi</li>
                                <li> <strong>Fake Support:</strong> We will NEVER ask for your seed phrase or private keys</li>
                                <li> <strong>Impersonation:</strong> Verify our official social media accounts</li>
                                <li> <strong>Too Good to Be True:</strong> If it sounds too good to be true, it is</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">9. Security Contact</h2>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="mb-4">For security concerns or responsible disclosure:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Email:</span>
                                <a href="mailto:security@WhaleAlert ID.fi" className="text-blue-400 hover:underline">security@WhaleAlert ID.fi</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">PGP Key:</span>
                                <a href="/security.asc" className="text-blue-400 hover:underline">Download Public Key</a>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">Response Time:</span>
                                <span>We acknowledge reports within 24 hours and provide updates every 48 hours.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Summary */}
                <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4"> Security Summary</h2>
                    <ul className="space-y-2 text-sm">
                        <li> <strong>Self-Custody:</strong> Your keys, your cryptowe never have access</li>
                        <li> <strong>Encryption:</strong> TLS 1.3 in transit, AES-256 at rest</li>
                        <li> <strong>Multi-Factor Auth:</strong> Passkeys, 2FA, wallet signatures</li>
                        <li> <strong>24/7 Monitoring:</strong> Real-time threat detection and response</li>
                        <li> <strong>Bug Bounty:</strong> Up to $10,000 for responsible disclosure</li>
                        <li> <strong>Transparency:</strong> Regular audits and public incident reports</li>
                        <li> <strong>GDPR Compliant:</strong> Data protection by design and default</li>
                    </ul>
                </section>
            </div>
        </DocLayout>
    );
}

