import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://humanidfi.com'

  const routes = [
    // Core Platform
    { path: '', priority: 1.0, frequency: 'daily' },
    { path: '/dashboard', priority: 1.0, frequency: 'always' },
    { path: '/chat', priority: 0.9, frequency: 'always' },
    { path: '/portfolio', priority: 0.9, frequency: 'always' },
    { path: '/forum', priority: 0.9, frequency: 'always' },
    { path: '/news', priority: 0.9, frequency: 'hourly' },
    { path: '/academy', priority: 0.8, frequency: 'weekly' },
    { path: '/careers', priority: 0.8, frequency: 'weekly' },
    { path: '/pricing', priority: 0.9, frequency: 'monthly' },
    { path: '/status', priority: 0.9, frequency: 'always' },

    // Docs Core
    { path: '/docs', priority: 0.9, frequency: 'weekly' },
    { path: '/docs/getting-started', priority: 0.9, frequency: 'monthly' },
    { path: '/docs/overview', priority: 0.9, frequency: 'monthly' },
    { path: '/docs/quickstart', priority: 0.9, frequency: 'monthly' },
    { path: '/docs/core-concepts', priority: 0.9, frequency: 'monthly' },
    { path: '/docs/whale-code', priority: 0.8, frequency: 'monthly' },
    
    // Platform Architecture
    { path: '/platform', priority: 0.9, frequency: 'monthly' },
    { path: '/platform/architecture', priority: 0.8, frequency: 'monthly' },
    { path: '/platform/auth', priority: 0.8, frequency: 'monthly' },
    { path: '/platform/neo4j', priority: 0.8, frequency: 'monthly' },
    { path: '/platform/contracts', priority: 0.8, frequency: 'monthly' },
    { path: '/platform/nodes', priority: 0.8, frequency: 'monthly' },
    { path: '/platform/streams', priority: 0.8, frequency: 'monthly' },

    // Integrations
    { path: '/integrations', priority: 0.8, frequency: 'monthly' },
    { path: '/integrations/walletconnect', priority: 0.8, frequency: 'monthly' },
    { path: '/integrations/tron', priority: 0.8, frequency: 'monthly' },
    { path: '/integrations/getblock', priority: 0.8, frequency: 'monthly' },
    { path: '/integrations/resend', priority: 0.8, frequency: 'monthly' },
    { path: '/integrations/prisma', priority: 0.8, frequency: 'monthly' },

    // Developer
    { path: '/developer', priority: 0.9, frequency: 'weekly' },
    { path: '/developer/getting-started', priority: 0.8, frequency: 'monthly' },
    { path: '/developer/overview', priority: 0.8, frequency: 'monthly' },
    { path: '/developer/auth', priority: 0.8, frequency: 'monthly' },
    { path: '/developer/api-keys', priority: 0.8, frequency: 'monthly' },
    { path: '/developer/rate-limits', priority: 0.8, frequency: 'monthly' },

    // REST API
    { path: '/api/overview', priority: 0.8, frequency: 'weekly' },
    { path: '/api/alerts', priority: 0.8, frequency: 'always' },
    { path: '/api/markets', priority: 0.8, frequency: 'always' },
    { path: '/api/wallets', priority: 0.8, frequency: 'always' },
    { path: '/api/forum', priority: 0.8, frequency: 'always' },
    { path: '/api/subscriptions', priority: 0.8, frequency: 'always' },
    { path: '/api/transactions', priority: 0.8, frequency: 'always' },

    // WebSocket API
    { path: '/ws/connection', priority: 0.8, frequency: 'monthly' },
    { path: '/ws/channels', priority: 0.8, frequency: 'monthly' },
    { path: '/ws/events', priority: 0.8, frequency: 'monthly' },

    // SDKs
    { path: '/sdks/typescript', priority: 0.8, frequency: 'monthly' },
    { path: '/sdks/python', priority: 0.8, frequency: 'monthly' },
    { path: '/sdks/webhooks', priority: 0.8, frequency: 'monthly' },
    { path: '/sdks/changelog', priority: 0.8, frequency: 'weekly' },

    // Operator
    { path: '/operator/getting-started', priority: 0.7, frequency: 'monthly' },
    { path: '/operator/overview', priority: 0.7, frequency: 'monthly' },
    { path: '/operator/prerequisites', priority: 0.7, frequency: 'monthly' },

    // Setup
    { path: '/setup/full-node', priority: 0.7, frequency: 'monthly' },
    { path: '/setup/sequencer', priority: 0.7, frequency: 'monthly' },
    { path: '/setup/prover', priority: 0.7, frequency: 'monthly' },
    { path: '/setup/build', priority: 0.7, frequency: 'monthly' },
    { path: '/setup/snapshots', priority: 0.7, frequency: 'monthly' },

    // Operation
    { path: '/operation/monitoring', priority: 0.7, frequency: 'monthly' },
    { path: '/operation/keystore', priority: 0.7, frequency: 'monthly' },
    { path: '/operation/sequencer', priority: 0.7, frequency: 'monthly' },
    { path: '/operation/faqs', priority: 0.7, frequency: 'monthly' },

    // Reference
    { path: '/reference/cli', priority: 0.6, frequency: 'monthly' },
    { path: '/reference/rpc', priority: 0.6, frequency: 'monthly' },
    { path: '/reference/changelog', priority: 0.6, frequency: 'weekly' },
    { path: '/reference/glossary', priority: 0.6, frequency: 'monthly' },

    // Legal
    { path: '/legal/terms', priority: 0.4, frequency: 'yearly' },
    { path: '/legal/privacy', priority: 0.4, frequency: 'yearly' },
    { path: '/docs/cookie-policy', priority: 0.4, frequency: 'yearly' },
    { path: '/legal/risk', priority: 0.4, frequency: 'yearly' },
    { path: '/docs/whitepaper', priority: 0.9, frequency: 'monthly' },
  ] as const;

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    // @ts-ignore - TS might complain about 'always' if not explicitly set in types, but it's valid for sitemaps
    changeFrequency: route.frequency,
    priority: route.priority,
  }))
}
