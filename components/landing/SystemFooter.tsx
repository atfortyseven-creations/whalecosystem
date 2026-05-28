import React from "react";
import Link from "next/link";

// ─── Sub-components ──────────────────────────────────────────────────────────

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="font-sans text-[12px] font-medium text-white/60 hover:text-white transition-colors duration-200 block"
    >
      {children}
    </Link>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    label: "PRODUCT",
    links: [
      { label: "Use Cases",       href: "/use-cases" },
      { label: "How it Works",    href: "/how-it-works" },
      { label: "Demo",            href: "/demo" },
      { label: "FAQ",             href: "/faq" },
    ]
  },
  {
    label: "DEVELOPERS",
    links: [
      { label: "Docs",            href: "/developers/api-docs" },
      { label: "GitHub",          href: "https://github.com/atfortyseven-creations/Humanity-Ledger", isExternal: true },
    ]
  },
  {
    label: "RESOURCES",
    links: [
      { label: "Global Registry", href: "/registry" },
      { label: "Vision & Press",  href: "/vision" },
      { label: "Talk to Sales",   href: "/contact" },
    ]
  }
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SystemFooter() {
  return (
    <footer className="w-full bg-[#0a0f1c] text-white py-16 px-8 md:px-16 border-t border-white/5">
      <div className="w-full max-w-[1300px] mx-auto flex flex-col gap-16">
        
        {/* Top Section: Logo + Columns */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Logo & Small Text */}
          <div className="flex flex-col gap-4 max-w-[280px]">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="font-sans text-[20px] font-bold tracking-tight text-[#fcd34d]">
                HumanityLedger
              </span>
            </div>
            <p className="text-[11px] font-medium text-white/40 leading-relaxed">
              GDPR-aligned by design.
              <br />
              Humanity Ledger never collects, processes, or stores your PII.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            {NAV_COLUMNS.map((col) => (
              <div key={col.label} className="flex flex-col gap-5">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/40">
                  {col.label}
                </span>
                <div className="flex flex-col gap-4">
                  {col.links.map((l) => (
                    <FooterLink key={l.label} href={l.href} external={l.isExternal}>
                      {l.label}
                    </FooterLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <span className="text-[12px] font-medium text-white/40">
            © 2026 Humanity Ledger · all rights reserved
          </span>
          <Link href="/privacy" className="text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">
            PRIVACY
          </Link>
        </div>

      </div>
    </footer>
  );
}
