"use client";

import { motion } from 'framer-motion';
import { PricingTable } from '@/components/saas/PricingTable';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { Layers } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-transparent pt-24 pb-24 px-6 relative text-white">
            <div className="fixed inset-0 z-0">
                <UniversalEliteWallpaper />
            </div>

            <div className="max-w-[2560px] mx-auto space-y-16 relative z-10 text-left">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center mt-12"
                >
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                         <Layers className="text-indigo-400" size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight max-w-4xl">
                        Elite API <span className="text-indigo-400">Tiers</span>
                    </h1>
                    <p className="text-white/40 mt-6 text-sm md:text-base font-medium uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
                        From solo quants to high-frequency trading desks. Scale your data infrastructure with zero latency and absolute precision. Pay only for the telemetry you consume.
                    </p>
                </motion.div>

                {/* Pricing Component */}
                <PricingTable />

                {/* Footer FAQ Teaser */}
                <div className="pt-16 border-t border-white/10 text-center max-w-xl mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-relaxed">
                        SLA guarantees (99.0% to 99.99%) apply to REST and WebSocket endpoints. FIX Protocol connections require custom VPN/Direct Connect tunnels during the Elite onboarding process.
                    </p>
                </div>
            </div>
        </div>
    );
}

