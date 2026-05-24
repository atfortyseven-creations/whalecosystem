import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { API_REFERENCE_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function ApiDocsPage() {
  return (
    <AztecDocPage
      eyebrow="Developers · API Reference"
      title="API Reference"
      subtitle="Technical specifications for REST endpoints, WebSocket telemetry streams, and cryptographic authentication requirements for the Humanity Ledger protocol."
      sections={API_REFERENCE_SECTIONS}
    />
  );
}
