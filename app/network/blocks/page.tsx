"use client";

import { LatestBlocks } from "@/components/network/LatestBlocks";
import { NetworkTabs } from "@/components/network/NetworkTabs";
import { motion } from "framer-motion";

export default function BlocksPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">
                        Explorer <span className="text-blue-500">Blocks</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl font-medium">
                        Real-time visualization of the global blockchain data stream.
                        Monitor network consensus and transactional throughput.
                    </p>
                </header>

                <NetworkTabs />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[600px]"
                >
                    <LatestBlocks />
                </motion.div>
            </div>
        </div>
    );
}

