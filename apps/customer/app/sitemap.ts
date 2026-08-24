import type { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/site'
import { getAllTyreSlugs, getAllWheelSlugs } from './lib/product-queries'

/* Regenerate on every crawl so newly added/removed products show up without
   a redeploy — mirrors the `force-dynamic` PDP pages, which query the same
   live DB. */
export const dynamic = 'force-dynamic'

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '',                 changeFrequency: 'daily',   priority: 1.0 },
  { path: '/tyres',           changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/tyres/collection', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tyres/results',   changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/wheels',          changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/wheels/collection', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/wheels/results',  changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/service',         changeFrequency: 'monthly', priority: 0.6 },
  { path: '/warranty',        changeFrequency: 'monthly', priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tyres, wheels] = await Promise.all([getAllTyreSlugs(), getAllWheelSlugs()])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const tyreEntries: MetadataRoute.Sitemap = tyres.map(t => ({
    url: `${SITE_URL}/tyres/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const wheelEntries: MetadataRoute.Sitemap = wheels.map(w => ({
    url: `${SITE_URL}/wheels/${w.slug}`,
    lastModified: w.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...tyreEntries, ...wheelEntries]
}
