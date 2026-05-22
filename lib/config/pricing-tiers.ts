/**
 * lib/config/pricing-tiers.ts
 * 
 * SINGLE SOURCE OF TRUTH for all pricing tier data across the platform.
 * Each feature is mapped to its corresponding system section.
 * 
 */

export interface PricingFeature {
  text: string;
  highlight?: boolean;
  section?: 'dashboard' | 'chat' | 'portfolio' | 'community' | 'core';
}

export interface SectionFeatureGroup {
  section: 'dashboard' | 'chat' | 'portfolio' | 'community';
  label: string;
  icon: string;
  freeFeatures: string[];
  proFeatures: string[];
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

/** Per-section breakdown used in the enhanced pricing comparison UI */
export const SECTION_FEATURES: SectionFeatureGroup[] = [
  {
    section: 'dashboard',
    label: 'Dashboard',
    icon: '',
    freeFeatures: [
      'Real-time whale alert feed (top 50 movements)',
      'Basic on-chain activity overview',
      'Market cap & volume snapshot',
      '24h price movement tracker',
      'Standard network health indicators',
    ],
    proFeatures: [
      'Unlimited whale movements  all chains, no cap',
      'Custom alert thresholds by wallet size & token',
      'AI-powered whale behavior prediction engine',
      'Smart money accumulation / distribution heatmaps',
      'Cross-chain tracking: ETH, BTC, SOL, ARB, BASE & more',
      'Institutional wallet profiling & risk scoring',
      'Historical whale analytics archive (12 months)',
      'Priority microsecond-latency data stream',
    ],
  },
  {
    section: 'chat',
    label: 'Whale Chat',
    icon: '',
    freeFeatures: [
      'Access to public community chat',
      'Standard message history (7 days)',
      'Basic market discussion channels',
    ],
    proFeatures: [
      'Exclusive VIP Whale Analytics Channel',
      'Verified analyst alpha signals  private feed',
      'AI market sentiment engine from live chat data',
      'Direct line to on-chain event notifications in chat',
      'Priority message visibility & verified badge',
      'Custom keyword & token alert filters in chat',
      'Extended message history  unlimited archive',
      'Early-access announcement channel (before public)',
    ],
  },
  {
    section: 'portfolio',
    label: 'Portfolio',
    icon: '',
    freeFeatures: [
      'Single wallet portfolio overview',
      'Basic P&L tracking (unrealized)',
      'Token balance snapshot',
      'Basic transaction history',
    ],
    proFeatures: [
      'Unlimited multi-wallet & multi-chain tracking',
      'Advanced P&L with cost basis & tax optimization',
      'Whale copytrading signals  follow top wallets',
      'DeFi yield optimization & opportunity alerts',
      'Smart portfolio rebalancing recommendations',
      'NFT collection valuation & floor tracking',
      'Exposure & concentration risk scoring',
      'Exportable reports: CSV, PDF, tax-ready format',
    ],
  },
  {
    section: 'community',
    label: 'Community',
    icon: '',
    freeFeatures: [
      'Access to public community forums',
      'Read community research posts',
      'Basic leaderboard visibility',
    ],
    proFeatures: [
      'Verified Whale Member badge on profile',
      'Access to private Institutional Forum',
      'Monthly live AMA with top whale analysts',
      'DAO governance voting rights',
      'Early access to all new platform features',
      'Priority support  dedicated response channel',
      'Exclusive research reports & market analytics',
      'Referral program with revenue sharing',
    ],
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id:           'FREE',
    name:         'Whale Alert Network',
    tagline:      'Real-time on-chain analytics for every participant.',
    priceMonthly: '0',
    priceAnnual:  '0',
    accentColor:  '#050505',
    lottie:       'isometric-cube.json',
    features: [
      { text: 'Real-time whale alert feed (top 50 movements)', section: 'dashboard' },
      { text: 'Basic on-chain activity overview & market snapshot', section: 'dashboard' },
      { text: 'Public community chat access (7-day history)', section: 'chat' },
      { text: 'Single wallet portfolio tracker', section: 'portfolio' },
      { text: 'Basic P&L & token balance overview', section: 'portfolio' },
      { text: 'Community forums & research posts access', section: 'community' },
      { text: 'ZK-Biometric identity attestation', section: 'core' },
      { text: 'Whale Alert Network Academy access', section: 'core' },
    ],
    buttonText: 'Initialize',
  },
  {
    id:           'STANDARD',
    name:         'Whale Alert Network +',
    tagline:      'Full institutional analytics  every tab unlocked.',
    priceMonthly: '15',
    priceAnnual:  '150',
    accentColor:  '#050505',
    badge:        ' Institutional',
    highlight:    true,
    lottie:       'Safe Box.json',
    features: [
      // Dashboard
      { text: 'Unlimited whale movements  all chains, no cap', highlight: true, section: 'dashboard' },
      { text: 'AI whale behavior prediction & accumulation heatmaps', highlight: true, section: 'dashboard' },
      { text: 'Custom thresholds, cross-chain + 12-month archive', section: 'dashboard' },
      // Chat
      { text: 'VIP Whale Analytics Channel + analyst alpha signals', highlight: true, section: 'chat' },
      { text: 'AI sentiment engine & unlimited chat history', section: 'chat' },
      // Portfolio
      { text: 'Multi-wallet tracking + copytrading signals', highlight: true, section: 'portfolio' },
      { text: 'DeFi yield alerts, NFT valuation & tax reports', section: 'portfolio' },
      // Community
      { text: 'Verified Whale badge + Institutional Forum access', highlight: true, section: 'community' },
      { text: 'DAO voting, monthly analyst AMAs & priority support', section: 'community' },
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
