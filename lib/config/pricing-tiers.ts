/**
 * lib/config/pricing-tiers.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for all pricing tier data across the platform.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface PricingFeature {
  text: string;
  highlight?: boolean;
}

export interface PricingTier {
  id: 'FREE' | 'STANDARD';
  name: string;
  tagline: string;
  priceMonthly: string;
  priceAnnual: string;
  features: PricingFeature[];
  buttonText: string;
  highlight?: boolean;
  accentColor: string;
  badge?: string;
  lottie?: string;
}

export const TIER_RANK: Record<PricingTier['id'], number> = {
  FREE:     0,
  STANDARD: 1,
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id:           'FREE',
    name:         'HumanID Standard',
    tagline:      'Core cryptographic identity layer.',
    priceMonthly: '0',
    priceAnnual:  '0',
    accentColor:  '#050505',
    lottie:       'isometric-cube.json',
    features: [
      { text: 'ZK-Biometric Identity Attestation' },
      { text: 'Mathematical Personhood Verification' },
      { text: 'Protocol Ledger & Block Visibility' },
      { text: 'Deterministic Heuristic Tracking' },
      { text: 'Secure P2P Encrypted Terminal' },
      { text: 'HumanID Protocol Academy Access' },
    ],
    buttonText: 'Initialize',
  },
  {
    id:           'STANDARD',
    name:         'HumanID Pro',
    tagline:      'Unrestricted institutional capacity.',
    priceMonthly: '15',
    priceAnnual:  '150',
    accentColor:  '#050505',
    badge:        '★ Institutional',
    highlight:    true,
    lottie:       'Safe Box.json',
    features: [
      { text: 'Everything in HumanID Standard', highlight: true },
      { text: 'Mass Transfer Real-Time Interception', highlight: true },
      { text: 'Institutional Flow & Yield Analytics', highlight: true },
      { text: 'Zero-Latency Private Node Access' },
      { text: 'Priority Protocol Support Channel' },
    ],
    buttonText: 'Acquire License',
  },
];

export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}

export function hasAccess(userTier: string, requiredTier: PricingTier['id']): boolean {
  const userRank    = TIER_RANK[userTier as PricingTier['id']] ?? 0;
  const requiredRank = TIER_RANK[requiredTier];
  return userRank >= requiredRank;
}
