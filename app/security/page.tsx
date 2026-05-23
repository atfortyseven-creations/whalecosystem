import React from 'react';
import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { SECURITY_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function SecurityPage() {
  return (
    <AztecDocPage
      eyebrow="Security · Policy · Bounty · Audits"
      title="Security Policy, Bug Bounty & Audits"
      subtitle="How we secure the stack—responsible disclosure, bug bounties, and formal review of Noir circuits and public contracts."
      sections={SECURITY_SECTIONS}
    />
  );
}
