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
            </div>
        </DocLayout>
    );
}
