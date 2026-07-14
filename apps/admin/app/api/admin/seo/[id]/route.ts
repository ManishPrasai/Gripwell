/**
 * PATCH /api/admin/seo/[id]  — edit a page's SEO meta.
 *
 * Requires the `website` manage permission (also gated in middleware). These
 * edits drive the customer site's <head> meta tags on the matching page.
 */
import { z } from 'zod'
import { defineMutation, assertPermission, notFound } from '../../../../../lib/mutation'

const SeoPatchSchema = z.object({
  metaTitle:    z.string().trim().min(1).max(200).optional(),
  metaDesc:     z.string().trim().max(500).optional(),
  ogImage:      z.string().trim().max(500).optional(),
  canonicalUrl: z.string().trim().max(500).optional(),
}).refine(v => Object.keys(v).length > 0, { message: 'Nothing to update' })

export const PATCH = defineMutation({
  schema:     SeoPatchSchema,
  action:     'SEO_UPDATED',
  entityType: 'PageSEO',
  run: async ({ data, admin, params, tx }) => {
    assertPermission(admin, 'website', 2)

    const existing = await tx.pageSEO.findUnique({ where: { id: params.id } })
    if (!existing) throw notFound('Page not found')

    const patch: Record<string, unknown> = {}
    if (data.metaTitle    !== undefined) patch.metaTitle    = data.metaTitle
    if (data.metaDesc     !== undefined) patch.metaDesc     = data.metaDesc
    if (data.ogImage      !== undefined) patch.ogImage      = data.ogImage || null
    if (data.canonicalUrl !== undefined) patch.canonicalUrl = data.canonicalUrl || null

    const updated = await tx.pageSEO.update({ where: { id: params.id }, data: patch })

    return {
      result:   { id: updated.id, entityId: updated.entityId, metaTitle: updated.metaTitle, metaDesc: updated.metaDesc },
      entityId: updated.id,
      before:   { metaTitle: existing.metaTitle, metaDesc: existing.metaDesc },
      after:    { metaTitle: updated.metaTitle, metaDesc: updated.metaDesc },
    }
  },
})
