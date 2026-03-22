"use client";

import { MinimalDarkPool } from '../../../components/premium/MinimalDarkPool';
import { motion } from 'framer-motion';

export default function DarkPoolPage() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
        >
            <MinimalDarkPool />
        </motion.div>
    );
}

