"use client";

import React from 'react';
import { Twitter, Github, Globe, MessageCircle, ArrowUpRight, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PremiumButton } from '../ui/PremiumButton';
import Link from 'next/link';

export const Footer = () => {
    const { t } = useLanguage();
    
    return (
        <footer className="relative z-10 bg-[var(--aztec-parchment)] border-t border-[var(--aztec-ink)]/5">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--aztec-orchid)]/5 to-transparent pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto px-6 py-24">
                {/* Main CTA Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 bg-[var(--aztec-ink)]/5 px-4 py-2 rounded-full mb-8 border border-[var(--aztec-ink)]/10">
                        <Sparkles className="w-4 h-4 text-[var(--aztec-orchid)]" />
                        <span className="text-sm text-[var(--aztec-ink)]/80">{t.footer.cta.badge}</span>
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                        <span className="text-[var(--aztec-orchid)]">{t.footer.cta.title}</span>
                        <br />
                        <span className="font-aztec-h2 text-[var(--aztec-ink)] tracking-tight">Whale Alert Corporation.</span>
                    </h2>
                    
                    <p className="text-xl text-[var(--aztec-ink)]/60 mb-12 max-w-2xl mx-auto italic">
                        {t.footer.cta.subtitle}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/portfolio">
                            <PremiumButton 
                                variant="gradient" 
                                size="lg"
                                leftIcon={<Smartphone className="w-5 h-5" />}
                            >
                                <div className="text-left">
                                    <div className="font-bold">{t.footer.mobile.title}</div>
                                    <div className="text-xs opacity-80">{t.footer.mobile.subtitle}</div>
                                </div>
                            </PremiumButton>
                        </Link>
                        
                        <PremiumButton 
                            variant="secondary" 
                            size="lg"
                            leftIcon={<Monitor className="w-5 h-5" />}
                        >
                            <div className="text-left">
                                <div className="font-bold">{t.footer.extension.title}</div>
                                <div className="text-xs opacity-80">{t.footer.extension.subtitle}</div>
                            </div>
                        </PremiumButton>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    <div>
                        <h3 className="text-[var(--aztec-ink)] font-bold mb-4">{t.footer.sections.product}</h3>
                        <ul className="space-y-3">
                            <li><FooterLink href="/terminal">Terminal</FooterLink></li>
                            <li><FooterLink href="/portfolio">Portfolio Social</FooterLink></li>
                            <li><FooterLink href="/marketplace">API Marketplace</FooterLink></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-[var(--aztec-ink)] font-bold mb-4">{t.footer.sections.developers}</h3>
                        <ul className="space-y-3">
                            <li><FooterLink href="/docs">API Documentation</FooterLink></li>
                            <li><FooterLink href="/docs#whale-v1">Whale Intelligence</FooterLink></li>
                            <li><FooterLink href="/docs#webhooks">Webhooks Pro</FooterLink></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-[var(--aztec-ink)] font-bold mb-4">{t.footer.sections.company}</h3>
                        <ul className="space-y-3">
                            <li><FooterLink href="/about">Sobre Nosotros</FooterLink></li>
                            <li><FooterLink href="/manifesto">Manifiesto</FooterLink></li>
                            <li><FooterLink href="/contact">Contacto</FooterLink></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-[var(--aztec-ink)] font-bold mb-4">{t.footer.sections.legal}</h3>
                        <ul className="space-y-3">
                            <li><FooterLink href="/privacy">Privacidad</FooterLink></li>
                            <li><FooterLink href="/terms">Terms</FooterLink></li>
                            <li><FooterLink href="/security">Seguridad Core</FooterLink></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[var(--aztec-ink)]/60 text-sm">
                        {t.footer.rights}
                    </div>
                    
                    <div className="flex gap-4">
                        <SocialIcon icon={<Twitter size={20} />} href="https://twitter.com" />
                        <SocialIcon icon={<Github size={20} />} href="https://github.com" />
                        <SocialIcon icon={<Globe size={20} />} href="#" />
                        <SocialIcon icon={<MessageCircle size={20} />} href="#" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a 
        href={href} 
        className="group flex items-center gap-1 text-sm text-[var(--aztec-ink)]/50 hover:text-[var(--aztec-ink)] transition-colors"
    >
        {children}
        <ArrowUpRight 
            size={10} 
            className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" 
        />
    </a>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="glass-card p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
    >
        {icon}
    </a>
);


