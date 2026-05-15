import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, Shield, BarChart2, Megaphone, Settings } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-transparent text-[#050505] selection:bg-black/10 font-sans">
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">

                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
                    <ArrowLeft size={14} /> Return to Network
                </Link>

                {/* Header */}
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <Cookie size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Cookie <span className="text-[#888888]">Policy</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">Last Updated: Q2 2026</p>
                </header>

                {/* Intro */}
                <div className="space-y-12 text-sm leading-relaxed text-[#555555]">

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">What are cookies?</h2>
                        <p>
                            Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and behaviour across sessions. We use cookies to keep you securely logged in, remember your settings, and understand how the platform is used so we can improve it.
                        </p>
                    </section>

                    {/* Cookie Table */}
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-6">Cookies we use</h2>
                        <div className="space-y-4">

                            {/* Essential */}
                            <div className="border border-black/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-black/5 rounded-lg"><Shield size={16} className="text-[#050505]" /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Essential Cookies</span>
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black text-white rounded-full">Required</span>
                                </div>
                                <p className="text-[13px] mb-5">These cookies are required for the platform to function. You cannot opt out of them.</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="text-left text-black/40 border-b border-black/10">
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Name</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Purpose</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Duration</th>
                                                <th className="pb-2 font-black uppercase tracking-widest">Provider</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            <tr className="py-2">
                                                <td className="py-2.5 pr-4 font-mono">sovereign_handshake</td>
                                                <td className="py-2.5 pr-4">Cryptographic wallet session token</td>
                                                <td className="py-2.5 pr-4">24 hours</td>
                                                <td className="py-2.5">Whale Alert Network</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 pr-4 font-mono">wallet-auth</td>
                                                <td className="py-2.5 pr-4">Confirms wallet authentication state</td>
                                                <td className="py-2.5 pr-4">Session</td>
                                                <td className="py-2.5">Whale Alert Network</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 pr-4 font-mono">cookie_consent</td>
                                                <td className="py-2.5 pr-4">Stores your cookie preferences</td>
                                                <td className="py-2.5 pr-4">1 year</td>
                                                <td className="py-2.5">Whale Alert Network</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Analytics */}
                            <div className="border border-black/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-black/5 rounded-lg"><BarChart2 size={16} className="text-[#050505]" /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Analytics Cookies</span>
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black/5 text-black/60 rounded-full">Optional</span>
                                </div>
                                <p className="text-[13px] mb-5">These cookies help us understand how users interact with the platform. All data is aggregated and anonymous — no personal information is shared.</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="text-left text-black/40 border-b border-black/10">
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Name</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Purpose</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Duration</th>
                                                <th className="pb-2 font-black uppercase tracking-widest">Provider</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            <tr>
                                                <td className="py-2.5 pr-4 font-mono">_vercel_analytics</td>
                                                <td className="py-2.5 pr-4">Page view and performance tracking</td>
                                                <td className="py-2.5 pr-4">Session</td>
                                                <td className="py-2.5">Vercel</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Functional */}
                            <div className="border border-black/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-black/5 rounded-lg"><Settings size={16} className="text-[#050505]" /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Functional Cookies</span>
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black/5 text-black/60 rounded-full">Optional</span>
                                </div>
                                <p className="text-[13px] mb-5">These cookies remember your display preferences (theme, density, balances visibility) so you don't have to re-configure them on every visit.</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="text-left text-black/40 border-b border-black/10">
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Name</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Purpose</th>
                                                <th className="pb-2 pr-4 font-black uppercase tracking-widest">Duration</th>
                                                <th className="pb-2 font-black uppercase tracking-widest">Provider</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            <tr>
                                                <td className="py-2.5 pr-4 font-mono">wan_settings</td>
                                                <td className="py-2.5 pr-4">Dashboard layout and display preferences</td>
                                                <td className="py-2.5 pr-4">1 year</td>
                                                <td className="py-2.5">Whale Alert Network</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to withdraw */}
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">How to manage or withdraw your consent</h2>
                        <p className="mb-4">
                            You can change your cookie preferences at any time by clicking the <strong className="text-[#050505]">Privacy Settings</strong> link in the footer of any page. A new consent banner will appear, allowing you to accept or decline optional cookies.
                        </p>
                        <p>
                            You can also manage cookies directly through your browser settings. Note that disabling essential cookies may prevent you from logging in or using core features of the platform.
                        </p>
                    </section>

                    {/* Third parties */}
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">Third-party services</h2>
                        <p className="mb-4">
                            We use the following third-party services that may set their own cookies. We do not control these cookies — please refer to each provider's privacy policy for details:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li><strong className="text-[#050505]">Vercel</strong> — hosting and edge performance analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#050505] transition-colors">Privacy Policy ↗</a></li>
                            <li><strong className="text-[#050505]">WalletConnect</strong> — wallet connection relay. <a href="https://walletconnect.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#050505] transition-colors">Privacy Policy ↗</a></li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">Data controller</h2>
                        <p>
                            Whale Alert Network Corp is the data controller for cookies set on this platform. For any privacy-related enquiries, please contact us via our <Link href="/support" className="underline hover:text-[#050505] transition-colors">Support page</Link> or refer to our full <Link href="/privacy" className="underline hover:text-[#050505] transition-colors">Privacy Policy</Link>.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
