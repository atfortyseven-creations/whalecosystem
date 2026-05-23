"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { WalletComparisonChart } from "./WalletComparisonChart";
import { WhaleChatComparison } from "./WhaleChatComparison";

//  Constants & Animations 

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

//  Main Component 

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap }: ImmersiveManifestoLandingProps = {}) {
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Ref for the Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  


  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">

      {/* 
          1. HERO: WHITE QDS STYLE + 3D ATOM
       */}
      <section
        ref={heroRef}
        className="relative w-full h-[100svh] overflow-hidden bg-white flex flex-col items-center justify-center py-16"
      >
        {/* Bottom fade: white bleed into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-56 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />

        {/* Layout: ATOM centered top  Buttons row below */}
        <motion.div
          style={{ opacity: heroOpacity }}
          initial="hidden" animate="visible" variants={STAGGER}
          className="relative z-20 w-full flex justify-center px-6 mt-2 shrink-0 mb-4 h-full items-center"
        >
          <motion.div variants={FADE_UP} className="w-full max-w-[900px] mx-auto flex flex-col items-center justify-center gap-6">

            {/* Silver Atom  large, blended, no box */}
            {mounted && (
              <div className="w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] lg:w-[700px] lg:h-[700px] shrink-0 flex items-center justify-center mx-auto">
                <img
                  src="/atom_3d_silver.jpg"
                  alt="Silver Atom"
                  className="w-full h-full object-contain mix-blend-multiply"
                  draggable={false}
                />
              </div>
            )}

            {/* Buttons  side by side, centered below atom */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 w-full mt-4">
              <Link
                href="/portfolio"
                className="flex items-center justify-center w-full sm:w-auto min-w-[260px] px-8 py-5 bg-[#050505] text-white hover:bg-[#222] rounded-full font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center shadow-lg"
              >
                Don&apos;t have an Account yet?
              </Link>
              <Link
                href="/forum"
                className="flex items-center justify-center w-full sm:w-auto min-w-[260px] px-8 py-5 bg-white border border-black/15 text-black hover:bg-black/5 rounded-full font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center"
              >
                Go to Whale Chat
              </Link>
            </div>

          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-black/40">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-black/40 to-transparent" />
        </motion.div>
      </section>

      {/* 
          2. WALLET COMPARISON
       */}
      <WalletComparisonChart />

      {/* 
          3. WHALE CHAT COMPARISON
       */}
      <WhaleChatComparison />

      {/* 
          4. TEXT EXPLANATIONS (QDS Style on White)
       */}
      <section className="w-full bg-white py-32 md:py-48 border-t border-black/5">
        <div className="w-full max-w-[960px] mx-auto px-6 flex flex-col gap-28 md:gap-40">
          
          {/* Data Protection */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] as any }}
            className="flex flex-col md:flex-row gap-8 md:gap-20"
          >
            <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-3 pt-1">
              <span className="font-mono text-[10px] font-black text-black/22 tracking-[0.3em]">
                01
              </span>
              <h2 className="text-[22px] md:text-[28px] font-black tracking-tight leading-[1.15] text-black">
                Unbreakable<br/>Data Protection.
              </h2>
              <div className="w-8 h-[2px] bg-black rounded-full mt-2" />
            </div>
            <div className="flex-1 flex flex-col gap-6 items-start">
              <p className="font-serif text-black/58 leading-[1.9]" style={{ fontSize: 'clamp(15px, 1.5vw, 17px)' }}>
                Your sensitive documents and records are converted into secure digital signatures. This guarantees that your information can never be secretly altered, hacked, or destroyed. You always have verifiable proof of your data.
              </p>
              <Link href="/platform/contracts" className="inline-flex items-center justify-center px-8 py-4 bg-[#050505] text-white hover:bg-[#222] rounded-full font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-md mt-4">
                Learn About Security
              </Link>
            </div>
          </motion.article>

          {/* Infrastructure */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] as any }}
            className="flex flex-col md:flex-row gap-8 md:gap-20"
          >
            <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-3 pt-1">
              <span className="font-mono text-[10px] font-black text-black/22 tracking-[0.3em]">
                02
              </span>
              <h2 className="text-[22px] md:text-[28px] font-black tracking-tight leading-[1.15] text-black">
                Built for<br />The Future.
              </h2>
              <div className="w-8 h-[2px] bg-black rounded-full mt-2" />
            </div>
            <div className="flex-1 flex flex-col gap-6 items-start">
              <p className="font-serif text-black/58 leading-[1.9]" style={{ fontSize: 'clamp(15px, 1.5vw, 17px)' }}>
                Powered by a resilient global network designed to keep your institution online 24/7. We use the most advanced decentralization technology available today, meaning there is no single point of failure that can bring your operations down.
              </p>
              <Link href="/platform/architecture" className="inline-flex items-center justify-center px-8 py-4 bg-[#050505] text-white hover:bg-[#222] rounded-full font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-md mt-4">
                View Network Architecture
              </Link>
            </div>
          </motion.article>

        </div>
      </section>

      {/* 
          5. CTA / DOWNPAGE (WITH VIDEO BACKGROUND + LOGO BELT)
       */}
      <section className="relative w-full min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* Video background */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            src="/system-shots/14683943_3840_2160_30fps.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 pointer-events-none" />

        {/*  CTA Content  */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={STAGGER}
          className="relative z-10 flex flex-col items-center text-center max-w-[860px] px-6 w-full"
        >
          <motion.h2
            variants={FADE_UP}
            className="text-[44px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-6 drop-shadow-lg"
          >
            Ready to Upgrade Your <br className="hidden sm:block"/>Digital Security?
          </motion.h2>
          <motion.p
            variants={FADE_UP}
            className="font-serif text-[18px] md:text-[22px] text-white/75 leading-relaxed mb-10 drop-shadow-md max-w-[620px]"
          >
            Join the global network of people who trust Whale Alert to protect their data, privacy, and communications.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center px-12 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              Get Started Now
            </Link>
          </motion.div>
        </motion.div>


      </section>

    </div>
  );
}
