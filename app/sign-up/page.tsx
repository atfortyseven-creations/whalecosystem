"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CoreAuthGate } from "@/components/auth/CoreAuthGate";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [router]);

  const handleComplete = useCallback(() => {
    router.replace("/portfolio");
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-black/15 border-t-black/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#FFFFFF] text-[#0A0A0A] overflow-hidden relative">
      <Link href="/login" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-black/40 hover:text-black transition-colors group px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-black/10 shadow-sm">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Back to Login</span>
      </Link>

      <CoreAuthGate onComplete={handleComplete} startAt="password" />
    </div>
  );
}
