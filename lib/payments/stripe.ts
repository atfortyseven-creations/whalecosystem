import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // We keep a non-blocking check for local development, but in prod this will fail fast.
  console.warn('WARNING: STRIPE_SECRET_KEY is not defined in environment variables.');
} else if (process.env.STRIPE_SECRET_KEY.startsWith('pk_')) {
  console.error('USER ALERT: STRIPE_SECRET_KEY is set to a Publishable Key (starts with pk_). You have swapped your Stripe keys! Payment processing will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_key', {
  apiVersion: '2026-01-28.clover' as any, // Matched to User account precisely
  typescript: true,
});

/**
 * Mapping of internal PlanTier to Stripe Price IDs.
 * Note: These should ideally be moved to environment variables or fetched from Stripe API.
 */
export const PRICE_IDS: Record<string, Record<string, string>> = {
  MONTHLY: {
    STANDARD: process.env.STRIPE_STANDARD_PRICE_ID_MO || 'ST_PLAN_STANDARD_MO_PLACEHOLDER',
    STARTER: process.env.STRIPE_STARTER_PRICE_ID_MO || 'ST_PLAN_STARTER_MO_PLACEHOLDER',
    PRO: process.env.STRIPE_PRO_PRICE_ID_MO || 'ST_PLAN_PRO_MO_PLACEHOLDER',
    ELITE: process.env.STRIPE_ELITE_PRICE_ID_MO || 'ST_PLAN_ELITE_MO_PLACEHOLDER',
  },
  ANNUAL: {
    STANDARD: process.env.STRIPE_STANDARD_PRICE_ID_YR || 'ST_PLAN_STANDARD_YR_PLACEHOLDER',
    STARTER: process.env.STRIPE_STARTER_PRICE_ID_YR || 'ST_PLAN_STARTER_YR_PLACEHOLDER',
    PRO: process.env.STRIPE_PRO_PRICE_ID_YR || 'ST_PLAN_PRO_YR_PLACEHOLDER',
    ELITE: process.env.STRIPE_ELITE_PRICE_ID_YR || 'ST_PLAN_ELITE_YR_PLACEHOLDER',
  }
};

