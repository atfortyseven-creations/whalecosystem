import React from 'react';
import Link from 'next/link';
import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { DEVELOPER_SECTIONS } from '@/lib/content/footerPagesAztec';
import { Terminal, Code, Cpu, Shield } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <AztecDocPage
      eyebrow="Developers · Hub"
      title="Developer Hub"
      subtitle="Build privacy-preserving apps with the Aztec sandbox, Noir circuits, and our REST and WebSocket APIs."
      sections={DEVELOPER_SECTIONS}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            icon: Terminal,
            title: 'Quickstart',
            desc: 'Local Aztec sandbox, deploy QDs, first private transfer.',
            href: '/developer',
          },
          {
            icon: Cpu,
            title: 'Noir Circuits',
            desc: 'Membership, reputation, and transfer constraints.',
            href: 'https://github.com/hvbr1s/noir-circuits',
            external: true,
          },
          {
            icon: Code,
            title: 'API Reference',
            desc: 'REST, WebSocket, HMAC auth, whale streams.',
            href: '/developers/api-docs',
          },
          {
            icon: Shield,
            title: 'Security Model',
            desc: 'Nullifiers, AuthWit, and integrator guidelines.',
            href: '/security#policy',
          },
        ].map(({ icon: Icon, title, desc, href, external }) => (
          <Link
            key={title}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="p-6 rounded-2xl border border-black/10 hover:border-[#2a1b4d]/30 hover:bg-[#2a1b4d]/[0.03] transition-all group"
          >
            <Icon size={22} className="text-[#2a1b4d]/70 mb-4 group-hover:text-[#2a1b4d]" />
            <h3 className="text-lg font-black text-[#050505] mb-2">{title}</h3>
            <p className="text-[13px] text-[#050505]/55 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </AztecDocPage>
  );
}
