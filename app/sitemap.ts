import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://whalealert.pro'

  const routes = [
    '',
    '/vip',
    '/api-marketplace',
    '/portfolio',
    '/network',
    '/product/pricing',
    '/product/features',
    '/docs',
    '/developers',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
