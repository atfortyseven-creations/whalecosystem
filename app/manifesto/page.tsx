import React from 'react';
import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { MANIFESTO_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function ManifestoPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Privacy Manifesto"
      title="The Financial Privacy Manifesto"
      subtitle="Why privacy belongs in the protocol—and how Aztec, Noir, and selective disclosure protect people without hiding accountability."
      sections={MANIFESTO_SECTIONS}
    />
  );
}
