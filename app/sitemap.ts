import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://humanidfi.com'

  const routes = [
    { path: '', priority: 1, frequency: 'daily' },
    { path: '/network/whale-tracker', priority: 1, frequency: 'always' },
    { path: '/vip', priority: 0.9, frequency: 'hourly' },
    { path: '/network', priority: 0.9, frequency: 'hourly' },
    { path: '/academy', priority: 0.9, frequency: 'weekly' },
    { path: '/docs/whitepaper', priority: 1, frequency: 'monthly' },
    { path: '/developers', priority: 0.8, frequency: 'monthly' },
    { path: '/api-marketplace', priority: 0.8, frequency: 'monthly' },
    { path: '/portfolio', priority: 0.7, frequency: 'weekly' },
    { path: '/product/pricing', priority: 0.7, frequency: 'monthly' },
    { path: '/product/features', priority: 0.8, frequency: 'monthly' },
    { path: '/docs', priority: 0.9, frequency: 'weekly' },
    { path: '/company', priority: 0.6, frequency: 'monthly' },
    { path: '/support', priority: 0.5, frequency: 'monthly' },
    { path: '/legal/terms', priority: 0.3, frequency: 'yearly' },
    { path: '/legal/privacy', priority: 0.3, frequency: 'yearly' },
  ] as const;

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.frequency,
    priority: route.priority,
  }))
}
