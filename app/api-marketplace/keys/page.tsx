"use client";

import { motion } from 'framer-motion';
import { ApiKeyManager } from '@/components/saas/ApiKeyManager';
import { UsageStats } from '@/components/saas/UsageStats';
import { SecurityPanel } from '@/components/saas/SecurityPanel';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { Database, ShieldCheck } from 'lucide-react';

export default function ApiKeysDashboard() {
    // User state - derived from auth
    const userTier: any = 'PRO'; // System string tier  no Prisma enum dependency
    
    const initialKeys = [
        {
            id: 'key_1',
            name: 'Production Trading Algo',
            key: 'hdi_live_8af39v...9q12a',
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString()
        }
    ];

    const usageStats = {
        dailyRequests: 142050, // Heavy usage example for Pro
        billingPeriodStart: new Date().toISOString()
    };

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative text-white">
            <div className="fixed inset-0 z-0">
                <UniversalEliteWallpaper />
            </div>

            <div className="max-w-[2560px] mx-auto space-y-12 relative z-10 text-left">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <ShieldCheck className="text-indigo-400" size={28} />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight">
                                <span className="text-indigo-400">API</span> Management
                            </h1>
                        </div>
                        <p className="text-white/30 mt-4 text-sm font-medium uppercase tracking-[0.2em] max-w-xl">
                            Elite access control. Manage credentials, monitor telemetry, and secure your endpoints.
                        </p>
                    </div>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Keys & Security) */}
                    <div className="lg:col-span-2 space-y-8">
                        <ApiKeyManager tier={userTier} keys={initialKeys} />
                        <SecurityPanel tier={userTier} />
                    </div>

                    {/* Right Column (Usage & Limits) */}
                    <div className="lg:col-span-1">
                        <UsageStats tier={userTier} stats={usageStats} />
                    </div>
                </div>
            </div>
        </div>
    );
}

