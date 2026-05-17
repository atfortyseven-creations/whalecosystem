"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

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

export function ImmersiveManifestoLanding() {
  
  // Ref for the Hospital Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  // Ref for the Screenshot Gallery parallax
  const galleryRef = useRef<HTMLElement>(null);
  const { scrollYProgress: galleryProgress } = useScroll({ target: galleryRef, offset: ["start end", "end start"] });
  const heroImgY   = useTransform(galleryProgress, [0, 1], ["8%",  "-8%"]);
  const col1Y      = useTransform(galleryProgress, [0, 1], ["12%", "-18%"]);
  const col2Y      = useTransform(galleryProgress, [0, 1], ["20%", "-28%"]);
  const col3Y      = useTransform(galleryProgress, [0, 1], ["4%",  "-12%"]);

  const SCREENSHOTS = [
    "/system-shots/Captura de pantalla 2026-05-17 081424.png",
    "/system-shots/Captura de pantalla 2026-05-17 081558.png",
    "/system-shots/Captura de pantalla 2026-05-17 081640.png",
    "/system-shots/Captura de pantalla 2026-05-17 081511.png",
    "/system-shots/Captura de pantalla 2026-05-17 081726.png",
    "/system-shots/Captura de pantalla 2026-05-17 081803.png"
  ];

  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO: COLTEA HOSPITAL (Normalized, Immersive)
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="w-full h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden bg-black">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, willChange: "transform, opacity" }} 
          className="absolute inset-0 w-full h-[120%]"
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/system-shots/Coltea-video-2025-v2.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        <motion.div 
          initial="hidden" animate="visible" variants={STAGGER} 
          className="relative z-10 w-full max-w-[1200px] mx-auto px-6 text-center mt-20"
        >
          <motion.h1 variants={FADE_UP} className="text-[52px] sm:text-[80px] lg:text-[110px] font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl mb-8">
            The Whale Alert<br />
            <span className="text-white/40">Platform.</span>
          </motion.h1>
          <motion.p variants={FADE_UP} className="font-serif text-[20px] md:text-[28px] text-white/80 leading-relaxed max-w-[800px] mx-auto drop-shadow-md">
            A new global standard for institutional security. We provide complete data protection, private communication, and absolute certainty for your most critical operations.
          </motion.p>
          <motion.div variants={FADE_UP} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/docs" className="w-full sm:w-auto px-10 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-xl">
              Explore the System
            </Link>
            <Link href="/platform/architecture" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-transform active:scale-95">
              How It Works
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
          2. THE PLATFORM GALLERY (Screenshots Parallax Grid)
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={galleryRef} className="w-full py-24 md:py-36 flex flex-col items-center bg-[#FAF9F6] relative overflow-hidden">

        {/* ── Header: constrained ── */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 mb-16 md:mb-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center">
            <h2 className="text-[44px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.9] text-[#050505] mb-6">
              Experience<br />
              <span className="text-[#050505]/20">Absolute Control.</span>
            </h2>
            <p className="font-serif text-[18px] md:text-[22px] text-[#050505]/60 leading-relaxed max-w-[700px]">
              Our interface is designed for professionals who demand clarity, speed, and precision.
            </p>
          </motion.div>
        </div>

        {/* ── PC Bento Gallery — FULL BLEED, no max-w ── */}
        <div className="hidden md:flex flex-col w-full gap-4 px-4 lg:px-6 pb-8">

          {/* Row 1: Hero image (60%) + 2 stacked (40%) */}
          <div className="grid grid-cols-[60fr_40fr] gap-4 w-full">

            {/* Hero screenshot — tallest, most impactful */}
            <motion.div
              style={{ y: heroImgY, willChange: "transform" }}
              className="relative overflow-hidden rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.18)] border border-[#050505]/5"
            >
              <img
                src={SCREENSHOTS[0]}
                alt="Platform Dashboard"
                className="w-full aspect-[16/10] object-cover object-top"
                loading="eager"
              />
            </motion.div>

            {/* Right column: 2 stacked */}
            <div className="flex flex-col gap-4">
              <motion.div style={{ y: col1Y, willChange: "transform" }} className="relative overflow-hidden rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.14)] border border-[#050505]/5 flex-1">
                <img src={SCREENSHOTS[1]} alt="Platform Interface 2" className="w-full h-full aspect-[16/10] object-cover" loading="eager" />
              </motion.div>
              <motion.div style={{ y: col2Y, willChange: "transform" }} className="relative overflow-hidden rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.14)] border border-[#050505]/5 flex-1">
                <img src={SCREENSHOTS[2]} alt="Platform Interface 3" className="w-full h-full aspect-[16/10] object-cover" loading="eager" />
              </motion.div>
            </div>
          </div>

          {/* Row 2: 3 equal screenshots */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[SCREENSHOTS[3], SCREENSHOTS[4], SCREENSHOTS[5]].map((src, i) => (
              <motion.div
                key={i}
                style={{ y: col3Y, willChange: "transform" }}
                className="relative overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#050505]/5"
              >
                <img
                  src={src}
                  alt={`Platform Interface ${i + 4}`}
                  className="w-full aspect-[16/10] object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Mobile: NOT rendered — mobile users get MobileManifesto (no heavy images) ── */}

      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. WHALE CHAT MARKETING (Video: 12596112)
      ══════════════════════════════════════════════════════════════════════ */}
      <CinematicVideoSection
        videoSrc="/system-shots/12596112_3840_2160_30fps.mp4"
        title="Whale Chat."
        subtitle="Private. Secure."
        description="Standard messaging apps track your every move. Whale Chat changes everything. Communicate instantly with your team using an application where only you and the recipient can read the messages. No tracking, no data leaks, pure privacy."
        linkText="Start Chatting Securely"
        linkHref="/chat"
        overlay="bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        align="left"
      />

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
            Ready to Upgrade Your <br className="hidden sm:block"/>Institutional Security?
          </motion.h2>
          <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[22px] text-[#050505]/60 leading-relaxed mb-12">
            Join the global network of professionals who trust the Whale Alert Platform to protect their data, privacy, and communications.
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
