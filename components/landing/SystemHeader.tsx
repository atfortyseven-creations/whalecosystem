"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Use Cases",    href: "/use-cases" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Demo",         href: "/demo" },
  { label: "FAQ",          href: "/faq" },
  { label: "Contact",      href: "/contact" },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

function HLLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Humanity Ledger — Home">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fcd34d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:rotate-12"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="font-sans text-[17px] font-bold tracking-tight text-[#fcd34d] group-hover:text-yellow-300 transition-colors duration-200">
        HumanityLedger
      </span>
    </Link>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99] flex flex-col bg-[#050505]/95 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/5">
        <HLLogo />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="2" x2="14" y2="14" />
            <line x1="14" y1="2" x2="2" y2="14" />
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col justify-center px-8 gap-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="text-3xl font-black uppercase tracking-tighter text-white/40 hover:text-white transition-colors duration-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <div className="px-8 pb-12">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center justify-center w-full py-4 px-6 rounded-xl bg-white text-black font-black text-[12px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
        >
          Launch Terminal
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SystemHeader() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect scroll to apply glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.6)]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">

          {/* Left: Logo */}
          <HLLogo />

          {/* Center: Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="font-sans text-[12px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-200 relative group"
              >
                {item.label}
                {/* Underline micro-animation */}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#fcd34d] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right: CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-200 active:scale-95"
            >
              Launch Terminal
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="0" y1="1" x2="16" y2="1" />
                <line x1="0" y1="6" x2="16" y2="6" />
                <line x1="0" y1="11" x2="16" y2="11" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile overlay */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
