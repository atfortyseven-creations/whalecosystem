"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { X, Copy, Check, QrCode } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function DepositModal({ isOpen, onClose, address }: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-8 border-white/20">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Deposit Funds</h2>
                <p className="text-white/50 text-sm">Send ETH or USDT to your secure vault.</p>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 group-hover:opacity-0 transition-opacity" />
                     <QrCode size={100} className="text-black opacity-80" />
                     {/* In a real app, use 'react-qr-code' here with user's address */}
                </div>
              </div>

              {/* Address Box */}
              <div 
                onClick={copyToClipboard}
                className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-white/30 transition-colors group"
              >
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-white/40 font-bold uppercase mb-1">Your ETH Address</span>
                    <span className="font-mono text-sm text-white/90 truncate">{address}</span>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-white/60 group-hover:text-white transition-colors">
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </div>
              </div>

              <div className="mt-6 text-center">
                  <p className="text-xs text-white/30">
                      Only send assets on Ethereum Mainnet or Polygon. <br/>
                      Deposits usually credit within 12 confirmations.
                  </p>
              </div>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

