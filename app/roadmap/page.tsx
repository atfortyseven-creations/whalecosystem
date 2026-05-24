import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { ROADMAP_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function RoadmapPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Strategic Roadmap"
      title="Strategic Roadmap"
      subtitle="Sequential implementation phases for the Humanity Ledger protocol on the Aztec Network, from cryptographic infrastructure to full institutional adoption."
      sections={ROADMAP_SECTIONS}
    />
  );
}
