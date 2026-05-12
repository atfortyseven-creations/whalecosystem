/**
 * lib/config/pricing-tiers.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for all pricing tier data across the platform.
 *
 * Import this in:
 *   - app/pricing/page.tsx
 *   - components/landing/ImmersiveManifestoLanding.tsx
 *   - components/landing/MobileManifesto.tsx
 *   - components/dashboard/WhaleProShell.tsx  (tier badge colors)
 *
 * NEVER duplicate tier data in component files. Modify here only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface PricingFeature {
  text: string;
  /** Optional highlight — renders with a stronger emphasis in the UI */
  highlight?: boolean;
}

export interface PricingTier {
  /** Internal Prisma enum value (FREE | STARTER | PRO | ELITE) */
  id: 'FREE' | 'STARTER' | 'PRO' | 'ELITE';
  /** Display name shown to users */
  name: string;
  /** Short tagline / badge text */
  tagline: string;
  /** Monthly price in EUR (string to avoid float rendering issues) */
  priceMonthly: string;
  /** Annual price in EUR (billed yearly) */
  priceAnnual: string;
  /** Feature bullet points */
  features: PricingFeature[];
  /** Primary CTA text */
  buttonText: string;
  /** Highlights this tier visually (inverted card) */
  highlight?: boolean;
  /** Accent color (hex) for badges, borders, and icons */
  accentColor: string;
  /** Badge label shown above the card in the landing */
  badge?: string;
}

// ─── Tier rank map for upgrade/downgrade comparisons ────────────────────────
export const TIER_RANK: Record<PricingTier['id'], number> = {
  FREE:    0,
  STARTER: 1,
  PRO:     2,
  ELITE:   3,
};

// ─── Canonical tier definitions ──────────────────────────────────────────────
export const PRICING_TIERS: PricingTier[] = [
  {
    id:           'FREE',
    name:         'Free',
    tagline:      'Get a taste of the platform',
    priceMonthly: '0',
    priceAnnual:  '0',
    accentColor:  '#888888',
    features: [
      { text: 'Basic market overview' },
      { text: 'Delayed data streaming (15m)' },
      { text: '1 custom whale alert' },
      { text: 'Community forum access' },
      { text: '100 API calls / day' },
    ],
    buttonText: 'Current Plan',
  },
  {
    id:           'STARTER',
    name:         'Explorer',
    tagline:      'Track the market',
    priceMonthly: '19',
    priceAnnual:  '190',
    accentColor:  '#0052FF',
    badge:        'For individuals',
    features: [
      { text: 'Full trading terminal', highlight: true },
      { text: '1-minute data refresh' },
      { text: '3 custom whale alerts' },
      { text: 'On-chain identity profile' },
      { text: '1,000 API calls / day' },
    ],
    buttonText: 'Get started',
  },
  {
    id:           'PRO',
    name:         'Professional',
    tagline:      'Most Popular',
    priceMonthly: '59',
    priceAnnual:  '590',
    accentColor:  '#00C076',
    badge:        '★ Most Popular',
    highlight:    true,
    features: [
      { text: 'Zero-delay data streaming', highlight: true },
      { text: 'Advanced on-chain analytics', highlight: true },
      { text: 'Full read & write API access' },
      { text: 'Priority support — 24/7' },
      { text: 'Security analytics & alerts' },
      { text: '10,000 API calls / day' },
    ],
    buttonText: 'Go Professional',
  },
  {
    id:           'ELITE',
    name:         'Enterprise',
    tagline:      'Institutional grade',
    priceMonthly: '199',
    priceAnnual:  '1990',
    accentColor:  '#D4AF37',
    badge:        'Institutional',
    features: [
      { text: 'Unlimited data firehose', highlight: true },
      { text: 'No query limits or rate caps' },
      { text: 'Dedicated account manager' },
      { text: 'Full API & Webhook integration' },
      { text: 'Custom smart contract indexing' },
      { text: 'Private node infrastructure', highlight: true },
    ],
    buttonText: 'Contact Us',
  },
];

// ─── Helper: get tier by Prisma enum id ──────────────────────────────────────
export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}

// ─── Helper: check if tierA can access tierB's features ──────────────────────
export function hasAccess(userTier: string, requiredTier: PricingTier['id']): boolean {
  const userRank    = TIER_RANK[userTier as PricingTier['id']] ?? 0;
  const requiredRank = TIER_RANK[requiredTier];
  return userRank >= requiredRank;
}
