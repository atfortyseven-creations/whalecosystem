"use client";

import { FundingRateArbitrage } from '@/components/premium/FundingRateArbitrage';
import { motion } from 'framer-motion';

export default function ArbitragePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-[calc(100vh-12rem)]"
        >
            <FundingRateArbitrage />
        </motion.div>
    );
}

