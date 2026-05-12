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
    name:         'Sovereign Free',
    tagline:      'Core intelligence layer access.',
    priceMonthly: '0',
    priceAnnual:  '0',
    accentColor:  '#050505',
    lottie:       'isometric-cube.json',
    features: [
      { text: 'Top Markets & New Listings Analytics' },
      { text: 'Ticket Mint & Main Portfolio Tracker' },
      { text: 'Whale Ledger & Block Explorer Access' },
      { text: 'Morpho Base & Aztec Pipeline Visibility' },
      { text: 'Encrypted Whale Chat Communications' },
      { text: 'Full Access to Peripheral Network (Academy, News, Forum)' },
    ],
    buttonText: 'Active Default',
  },
  {
    id:           'STANDARD',
    name:         'Institutional Standard',
    tagline:      'Unrestricted forensic capacity.',
    priceMonthly: '15',
    priceAnnual:  '150',
    accentColor:  '#0044CC',
    badge:        '★ Recommended',
    highlight:    true,
    lottie:       'Safe Box.json',
    features: [
      { text: 'Everything in Sovereign Free', highlight: true },
      { text: 'Mass Transfers Real-Time Interception', highlight: true },
      { text: 'DeFi Yields & Liquidity Flow Analytics', highlight: true },
      { text: 'Zero-Latency Private Node Infrastructure' },
      { text: 'Priority Cryptographic Support Access' },
    ],
    buttonText: 'Upgrade to Standard',
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
