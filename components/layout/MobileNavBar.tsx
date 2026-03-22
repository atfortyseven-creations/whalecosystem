"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Crown, Globe, Fingerprint, Terminal, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function MobileNavBar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/vip', label: 'VIP', icon: Crown },
        { href: '/network', label: 'Network', icon: Globe },
        { href: '/', label: 'Home', icon: Home },
        { href: '/portfolio', label: 'Portfolio', icon: BarChart2 },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-[var(--aztec-parchment)]/95 backdrop-blur-2xl border-t border-[var(--aztec-ink)]/10 pb-[env(safe-area-inset-bottom)] transform-gpu"
            style={{ position: 'fixed', bottom: 0 }}
        >
            <div className="flex items-center justify-around px-2 py-3">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className="relative flex flex-col items-center gap-1 flex-1 group"
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--aztec-orchid)] rounded-full transform-gpu"
                                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                                />
                            )}
                            
                            {/* Icon */}
                            <div className={cn(
                                "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200",
                                isActive 
                                    ? "bg-[var(--aztec-ink)]/5 border border-[var(--aztec-orchid)]/30 scale-105" 
                                    : "bg-[var(--aztec-ink)]/5 border border-transparent group-hover:bg-[var(--aztec-ink)]/10 group-hover:scale-105"
                            )}>
                                <Icon 
                                    size={20} 
                                    className={cn(
                                        "transition-colors duration-200",
                                        isActive ? "text-[var(--aztec-orchid)]" : "text-[var(--aztec-ink)]/60 group-hover:text-[var(--aztec-ink)]"
                                    )}
                                />
                                
                                {/* Glow effect for VIP */}
                                {item.href === '/vip' && isActive && (
                                    <div className="absolute inset-0 bg-[var(--aztec-orchid)]/10 rounded-2xl blur-lg -z-10" />
                                )}
                            </div>
                            
                            {/* Label */}
                            <span className={cn(
                                "text-[10px] font-bold transition-colors duration-200 uppercase tracking-wider",
                                isActive ? "text-[var(--aztec-ink)]" : "text-[var(--aztec-ink)]/40 group-hover:text-[var(--aztec-ink)]/70"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}

