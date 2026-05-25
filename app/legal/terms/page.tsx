import DocLayout from '@/components/layout/DocLayout';

export default function TermsOfService() {
    return (
        <DocLayout
            title="Terms of Service"
            description="Comprehensive legal agreement governing the use of Whale Alert Network services, outlining user rights, responsibilities, and platform limitations."
            lastUpdated="May 25, 2026"
            category="Legal"
        >
            <div className="space-y-12 text-[#050505]">
                {/* 1. Introduction */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">1. Acceptance of Terms</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Welcome to Whale Alert Network. These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User," "you," or "your"), and Whale Alert Network, S.L. ("Company," "we," "us," or "our"), concerning your access to and use of the https://whalealert.network website, our mobile applications, and any other media form, media channel, mobile website, API, or service related, linked, or otherwise connected thereto (collectively, the "Platform" or "Services").
                        </p>
                        <p>
                            By accessing, browsing, or utilizing the Services in any capacity, you acknowledge that you have read, completely understood, and expressly agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms, then you are expressly prohibited from using the Services and you must discontinue use immediately.
                        </p>
                        <p>
                            Supplemental terms and conditions or documents that may be posted on the Platform from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole and absolute discretion, to make changes or modifications to these Terms at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of these Terms, and you waive any right to receive specific notice of each such change.
                        </p>
                    </div>
                </section>

                {/* 2. Platform Nature */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">2. Nature of the Services and Financial Disclaimers</h2>
                    <div className="bg-white p-8 rounded-3xl border border-black/10 mb-6">
                        <p className="font-bold mb-4 uppercase tracking-widest text-[11px] text-[#050505]">Critical Notice</p>
                        <p className="text-[#050505]/80 leading-relaxed">
                            Whale Alert Network is strictly a technological provider of data analytics, blockchain indexation, and user interface software. <strong>We are not a broker, financial advisor, investment firm, portfolio manager, or cryptocurrency exchange.</strong> 
                        </p>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            None of the information, data, metrics, charts, or alerts provided through the Services constitutes financial, investment, legal, or tax advice. All data is provided strictly for informational and educational purposes. You are entirely responsible for conducting your own independent research and due diligence before making any financial decisions.
                        </p>
                        <p>
                            The cryptocurrency markets, decentralized finance (DeFi) protocols, and digital assets are highly volatile, largely unregulated, and subject to extreme risk, including the total loss of your principal capital. By using our Services, you expressly acknowledge these risks and agree that the Company shall bear absolutely no liability for any financial losses, missed opportunities, or damages you may incur as a result of relying on data presented on the Platform.
                        </p>
                    </div>
                </section>

                {/* 3. User Obligations */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">3. User Representations and Obligations</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            By using the Services, you represent and warrant that:
                        </p>
                        <ul className="list-none space-y-4 pl-0">
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>You have the legal capacity and you agree to comply with these Terms of Service.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>You are not a minor in the jurisdiction in which you reside (generally, you must be at least 18 years of age).</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>You will not access the Services through automated or non-human means, whether through a bot, script, or otherwise, without our express written permission.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>You will not use the Services for any illegal, illicit, or unauthorized purpose, including but not limited to money laundering, terrorism financing, or market manipulation.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Your use of the Services will not violate any applicable local, state, national, or international law or regulation.</span>
                            </li>
                        </ul>
                        <p>
                            If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services.
                        </p>
                    </div>
                </section>

                {/* 4. Intellectual Property */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">4. Intellectual Property Rights</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Unless otherwise explicitly indicated, the Platform is our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Platform (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws.
                        </p>
                        <p>
                            The Content and the Marks are provided on the Platform "AS IS" for your information and personal use only. Except as expressly provided in these Terms, no part of the Platform and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                        </p>
                    </div>
                </section>

                {/* 5. Limitation of Liability */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">5. Limitation of Liability</h2>
                    <div className="bg-white p-8 rounded-3xl border border-black/10">
                        <p className="text-[#050505]/80 leading-relaxed font-bold uppercase tracking-wide text-xs">
                            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Services, even if we have been advised of the possibility of such damages. 
                        </p>
                        <p className="text-[#050505]/70 leading-relaxed mt-4">
                            Notwithstanding anything to the contrary contained herein, our liability to you for any cause whatsoever and regardless of the form of the action, will at all times be limited to the amount paid, if any, by you to us during the six (6) month period prior to any cause of action arising.
                        </p>
                    </div>
                </section>
                {/* 6. User Data and Privacy */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">6. Interplay with User Data and Privacy Policies</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            We deeply respect your privacy and are committed to protecting it through our compliance with our Privacy Policy. By agreeing to these Terms of Service, you also explicitly acknowledge and agree that your use of the Services is subject to our Privacy Policy, which is incorporated herein by reference. We strongly encourage you to read the Privacy Policy carefully to understand how we collect, use, and disclose information about you.
                        </p>
                        <p>
                            In the event of any conflict between these Terms of Service and the Privacy Policy regarding the processing of personal data, the provisions of the Privacy Policy shall prevail to the extent necessary to resolve the conflict. You acknowledge that any data provided by you or collected by us in connection with your use of the Services shall be used in accordance with the parameters defined within our comprehensive Privacy Policy framework.
                        </p>
                    </div>
                </section>

                {/* 7. Prohibited Activities Detailed */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">7. Exhaustive List of Prohibited Activities</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us in writing. As a user of the Services, you agree not to engage in any of the following activities under any circumstances:
                        </p>
                        <ul className="list-none space-y-4 pl-0">
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords or cryptographic private keys.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and the Content contained therein.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Disparage, tarnish, or otherwise harm, in our opinion, us and the Services, through the propagation of false information or coordinated malicious campaigns.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Use any information obtained from the Services in order to harass, abuse, or harm another person, or to perform coordinated market manipulation, front-running, or illegal trading practices.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                                <span>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party uninterrupted use and enjoyment of the Services.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 8. Governing Law */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">8. Governing Law and Dispute Resolution</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            These Terms and your use of the Services are governed by and construed in accordance with the laws of the European Union and the domestic laws of Spain applicable to agreements made and to be entirely performed within Spain, without regard to its conflict of law principles.
                        </p>
                        <p>
                            Any legal action of whatever nature brought by either you or us (collectively, the "Parties" and individually, a "Party") shall be commenced or prosecuted in the state and federal courts located in Madrid, Spain, and the Parties hereby consent to, and waive all defenses of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such state and federal courts. Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Terms.
                        </p>
                    </div>
                </section>

                {/* 9. Termination */}
                <section className="bg-white p-10 rounded-3xl border border-black/10">
                    <h2 className="text-3xl font-black mb-6 tracking-tight">9. Term and Termination</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            These Terms of Service shall remain in full force and effect while you use the Services. Without limiting any other provision of these Terms of Service, we reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the Services (including blocking certain IP addresses), to any person for any reason or for no reason, including without limitation for breach of any representation, warranty, or covenant contained in these Terms of Service or of any applicable law or regulation. We may terminate your use or participation in the Services or delete your account and any content or information that you posted at any time, without warning, in our sole discretion.
                        </p>
                    </div>
                </section>

                {/* 10. Contact */}
                <section className="bg-[#050505] text-white p-12 rounded-3xl text-center">
                    <h2 className="text-3xl font-black mb-6 tracking-tight">10. Contact Information</h2>
                    <p className="mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
                        In order to resolve a complaint regarding the Services or to receive further information regarding the use of the Services, please contact our legal department.
                    </p>
                    <a href="mailto:legal@whalealert.network" className="inline-block px-10 py-5 bg-white text-[#050505] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-100 transition-colors shadow-xl">
                        Contact Legal Department
                    </a>
                </section>
        </DocLayout>
    );
}
