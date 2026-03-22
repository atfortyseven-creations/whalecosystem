"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    Repeat, 
    Plus, 
    Shield, 
    Globe, 
    Zap, 
    CreditCard, 
    QrCode,
    Layers
} from "lucide-react";

interface SubItem {
    label: string;
    icon: any;
    desc: string;
    mode: string;
}

interface Action {
    label: string;
    icon: any;
    color: string;
    subitems: SubItem[];
}

const actions: Action[] = [
  { 
    label: "Send", 
    icon: ArrowUpRight, 
    color: "bg-blue-500",
    subitems: [
        { label: "Direct", icon: ArrowUpRight, desc: "Standard wallet-to-wallet", mode: "standard" },
        { label: "Bridge", icon: Globe, desc: "Move assets to other chains", mode: "bridge" },
        { label: "Private", icon: Shield, desc: "Shielded ZK-transaction", mode: "private" }
    ]
  },
  { 
    label: "Receive", 
    icon: ArrowDownLeft, 
    color: "bg-green-500",
    subitems: [
        { label: "QR Code", icon: QrCode, desc: "Show your address QR", mode: "qr" },
        { label: "Select Network", icon: Layers, desc: "Receive on L2/Sidechain", mode: "network" },
        { label: "ENS Name", icon: Globe, desc: "Copy your .eth name", mode: "ens" }
    ]
  },
  { 
    label: "Swap", 
    icon: Repeat, 
    color: "bg-purple-500",
    subitems: [
        { label: "Direct", icon: Repeat, desc: "1inch Liquidity Aggregator", mode: "aggregator" },
        { label: "Cross-Chain", icon: Globe, desc: "Atomic swap between chains", mode: "crosschain" },
        { label: "Limit Order", icon: Zap, desc: "Set execution price", mode: "limit" }
    ]
  },
  { 
    label: "Buy", 
    icon: Plus, 
    color: "bg-pink-500",
    subitems: [
        { label: "Credit Card", icon: CreditCard, desc: "Fiat-to-Crypto onramp", mode: "card" },
        { label: "Direct Deposit", icon: ArrowDownLeft, desc: "From Bank / Exchange", mode: "deposit" }
    ]
  },
];

interface ActionClusterProps {
  onAction: (action: string, mode?: string) => void;
}

export function ActionCluster({ onAction }: ActionClusterProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="flex justify-center gap-6 py-8 relative">
      {actions.map((action, index) => (
        <div key={action.label} className="relative">
            <motion.button
              onClick={() => setActiveMenu(activeMenu === action.label ? null : action.label)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-[20px] ${action.color} flex items-center justify-center text-white shadow-lg shadow-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 ${activeMenu === action.label ? 'ring-4 ring-white/20 scale-110' : ''}`}>
                <action.icon size={24} strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-white/60 tracking-wide group-hover:text-white transition-colors">
                {action.label}
              </span>
            </motion.button>

            {/* Submenu Popover */}
            <AnimatePresence>
                {activeMenu === action.label && (
                    <>
                        {/* Backdrop to close */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveMenu(null)}
                            className="fixed inset-0 z-40"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-64 bg-[#161A1E] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden"
                        >
                            <div className="flex flex-col gap-1">
                                {action.subitems.map((sub, i) => (
                                    <button
                                        key={sub.label}
                                        onClick={() => {
                                            onAction(action.label, sub.mode);
                                            setActiveMenu(null);
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                                    >
                                        <div className={`p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors`}>
                                            <sub.icon size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{sub.label}</div>
                                            <div className="text-[10px] text-white/40 leading-tight">{sub.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

