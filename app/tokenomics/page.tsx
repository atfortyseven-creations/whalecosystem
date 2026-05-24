import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { TOKENOMICS_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function TokenomicsPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · QDs Tokenomics"
      title="QDs Tokenomics"
      subtitle="The complete economic model governing the issuance, distribution, and utility of QDs — the native asset of the Humanity Ledger shielded ecosystem."
      sections={TOKENOMICS_SECTIONS}
    />
  );
}
