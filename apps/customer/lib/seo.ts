/**
 * Live page SEO — reads the PageSEO records managed in the admin console so the
 * customer site's <head> reflects admin edits. Falls back to sensible defaults
 * if the record is missing or the DB is unreachable.
 *
 * Pages using this should also set `export const dynamic = 'force-dynamic'` so
 * the metadata is never served stale from a static build.
 */
import type { Metadata } from 'next'
import { prisma } from '@nova/database'

export async function pageMetadata(entityId: string, fallback: Metadata): Promise<Metadata> {
  try {
    const seo = await prisma.pageSEO.findUnique({
      where: { entityType_entityId: { entityType: 'page', entityId } },
    })
    if (!seo) return fallback

    const md: Metadata = {
      title:       seo.metaTitle || fallback.title,
      description: seo.metaDesc  || fallback.description,
    }
    if (seo.ogImage)      md.openGraph  = { title: seo.metaTitle, description: seo.metaDesc ?? undefined, images: [seo.ogImage] }
    if (seo.canonicalUrl) md.alternates = { canonical: seo.canonicalUrl }
    return md
  } catch {
    return fallback
  }
}
