import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { ARCHITECTURE_VISION_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function ArchitectureVisionPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Architecture Vision"
      title="Post-Quantum Architecture Vision"
      subtitle="Master Blueprint for Institutional-Grade Private State, Quantum-Resistant Cryptography, and Zero-Knowledge Analytics"
      sections={ARCHITECTURE_VISION_SECTIONS}
    />
  );
}
