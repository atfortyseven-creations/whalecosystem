"use client";

import { TokenUnlockCalendar } from '@/components/premium/TokenUnlockCalendar';
import { motion } from 'framer-motion';

export default function UnlocksPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-[calc(100vh-12rem)]"
        >
            <TokenUnlockCalendar />
        </motion.div>
    );
}

