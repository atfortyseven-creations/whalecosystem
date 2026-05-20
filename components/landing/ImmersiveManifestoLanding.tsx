"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { WalletComparisonChart } from "./WalletComparisonChart";
import { WhaleChatComparison } from "./WhaleChatComparison";

// ─── Constants & Animations ──────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// ─── Reusable Cinematic Video Section ────────────────────────────────────────

function CinematicVideoSection({ 
  videoSrc, 
  title, 
  subtitle, 
  description, 
  linkText, 
  linkHref, 
  overlay = "bg-black/40",
  align = "center"
}: {
  videoSrc: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description: string;
  linkText?: string;
  linkHref?: string;
  overlay?: string;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Aggressive parallax mapping for the 130% height video container
  const yBg = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={ref} className="relative w-full h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-black">
      <motion.div 
        style={{ y: yBg, willChange: "transform" }} 
        className="absolute inset-x-0 top-[-15%] w-full h-[130%]"
      >
        <video 
          src={videoSrc} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
          style={{ willChange: "transform" }} // Force GPU accel on the video layer
        />
      </motion.div>
      <div className={`absolute inset-0 ${overlay}`} style={{ willChange: "opacity" }} />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={STAGGER}
          className={`flex flex-col ${align === "center" ? "items-center text-center mx-auto max-w-[900px]" : "items-start text-left max-w-[700px]"}`}
        >
          <motion.h2 variants={FADE_UP} className="text-[44px] sm:text-[64px] lg:text-[88px] font-black tracking-tighter uppercase text-white leading-[0.9] mb-6 drop-shadow-lg">
            {title}
            {subtitle && <><br /><span className="text-white/40">{subtitle}</span></>}
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[18px] md:text-[24px] text-white/90 font-serif leading-relaxed mb-10 drop-shadow-md font-medium">
            {description}
          </motion.p>
          {linkText && linkHref && (
            <motion.div variants={FADE_UP}>
              <Link href={linkHref} className="inline-flex items-center justify-center px-12 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-2xl">
                {linkText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap }: ImmersiveManifestoLandingProps = {}) {
  
  // Ref for the Hospital Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO: COLTEA HOSPITAL (Normalized, Immersive)
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="w-full min-h-[120dvh] relative flex flex-col items-center justify-center overflow-hidden bg-black">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, willChange: "transform, opacity" }} 
          className="absolute inset-0 w-full h-[120%]"
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/system-shots/8783-214159384 (1).mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        <motion.div 
          initial="hidden" animate="visible" variants={STAGGER} 
          className="relative z-10 w-full max-w-[1200px] mx-auto px-6 text-center mt-20"
        >
          <motion.h1 variants={FADE_UP} className="text-[52px] sm:text-[80px] lg:text-[110px] font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl mb-8">
            Welcome to<br />
            <span className="text-white/40">Whale Alert.</span>
          </motion.h1>
          <motion.p variants={FADE_UP} className="font-serif text-[20px] md:text-[28px] text-white/80 leading-relaxed max-w-[800px] mx-auto drop-shadow-md">
            The new global standard for digital safety. We provide complete data protection, private communication, and absolute certainty for your digital life.
          </motion.p>
          <motion.div variants={FADE_UP} className="mt-8 flex flex-col items-center justify-center gap-4">
             <div className="flex items-center gap-6 md:gap-8">
                {/* Aztec Logo */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 p-3 shadow-lg hover:scale-105 transition-transform duration-300">
                   <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                      <path d="M16 2L30 16L16 30L2 16Z" fill="#7C3AED"/>
                      <path d="M16 7L25 16L16 25L7 16Z" fill="white" opacity="0.85"/>
                      <path d="M16 11L21 16L16 21L11 16Z" fill="#7C3AED" opacity="0.9"/>
                   </svg>
                </div>
                {/* X */}
                <div className="text-white/60 font-mono text-xl font-black">X</div>
                {/* Whale Logo */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 p-3 shadow-lg hover:scale-105 transition-transform duration-300">
                   <img src="/official-whale-monochrome.png" alt="Whale Network" className="w-full h-full object-contain invert drop-shadow-md opacity-90" />
                </div>
             </div>
             <div className="font-mono text-[11px] md:text-[13px] font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-md">
                Whale Network x Aztec Network
             </div>
          </motion.div>
          <motion.div variants={FADE_UP} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/portfolio" className="w-full sm:w-auto px-10 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-xl text-center">
              Don't have an Account yet?
            </Link>
            <Link href="/forum" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center">
              Go to Whale Chat
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. WALLET COMPARISON
      ══════════════════════════════════════════════════════════════════════ */}
      <WalletComparisonChart />

      {/* ══════════════════════════════════════════════════════════════════════
          3. WHALE CHAT COMPARISON
      ══════════════════════════════════════════════════════════════════════ */}
      <WhaleChatComparison />

      {/* ══════════════════════════════════════════════════════════════════════
          4. DATA PROTECTION (Video: 8597294)
      ══════════════════════════════════════════════════════════════════════ */}
      <CinematicVideoSection
        videoSrc="/system-shots/8597294-hd_1920_1080_30fps.mp4"
        title="Unbreakable"
        subtitle="Data Protection."
        description="Your sensitive documents and records are converted into secure digital signatures. This guarantees that your information can never be secretly altered, hacked, or destroyed. You always have verifiable proof of your data."
        linkText="Learn About Security"
        linkHref="/platform/contracts"
        overlay="bg-black/50"
        align="center"
      />

      {/* ══════════════════════════════════════════════════════════════════════
          5. GLOBAL INFRASTRUCTURE (Video: 14683943)
      ══════════════════════════════════════════════════════════════════════ */}
      <CinematicVideoSection
        videoSrc="/system-shots/14683943_3840_2160_30fps.mp4"
        title="Built for"
        subtitle="The Future."
        description="Powered by a resilient global network designed to keep your institution online 24/7. We use the most advanced decentralization technology available today, meaning there is no single point of failure that can bring your operations down."
        linkText="View Network Architecture"
        linkHref="/platform/architecture"
        overlay="bg-gradient-to-l from-black/80 via-black/40 to-transparent"
        align="left"
      />

      {/* ══════════════════════════════════════════════════════════════════════
          6. SIMPLE ONBOARDING CALL TO ACTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-32 md:py-40 flex flex-col items-center bg-white border-t border-[#050505]/5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="flex flex-col items-center text-center max-w-[800px] px-6">
          <motion.div variants={FADE_UP} className="w-16 h-[2px] bg-[#050505] mb-10" />
          <motion.h2 variants={FADE_UP} className="text-[36px] md:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#050505] mb-8">
            Ready to Upgrade Your <br className="hidden sm:block"/>Digital Security?
          </motion.h2>
          <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[22px] text-[#050505]/60 leading-relaxed mb-12">
            Join the global network of people who trust Whale Alert to protect their data, privacy, and communications.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link href="/docs/getting-started" className="inline-flex items-center justify-center px-12 py-5 bg-[#050505] text-white hover:bg-[#222] rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              Get Started Now
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
