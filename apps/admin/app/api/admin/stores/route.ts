/**
 * POST /api/admin/stores — create a new store.
 *
 * Super-admin only (stores are a global resource). Latitude/longitude are
 * required by the schema and power the storefront map, so they're collected up
 * front — grab them from Google Maps. Opening hours can be set afterwards in
 * the store editor.
 */
import { z } from 'zod'
import { defineMutation, assertSuperAdmin, badRequest } from '../../../../lib/mutation'

const StoreCreateSchema = z.object({
  name:      z.string().trim().min(1).max(120),
  address:   z.string().trim().min(1).max(200),
  suburb:    z.string().trim().min(1).max(100),
  state:     z.string().trim().min(1).max(20),
  postcode:  z.string().trim().min(1).max(12),
  phone:     z.string().trim().min(1).max(40),
  email:     z.string().email().max(254),
  latitude:  z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'store'

export const POST = defineMutation({
  schema:     StoreCreateSchema,
  action:     'STORE_CREATED',
  entityType: 'Store',
  run: async ({ data, tx, admin }) => {
    assertSuperAdmin(admin)

    let slug = slugify(data.name)
    if (await tx.store.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slug}-${data.suburb ? slugify(data.suburb) : Math.random().toString(36).slice(2, 6)}`
    }
    if (await tx.store.findUnique({ where: { slug }, select: { id: true } })) {
      throw badRequest('A store with a similar name already exists — try a more specific name')
    }

    const store = await tx.store.create({
      data: { ...data, slug, isActive: true },
      select: { id: true, name: true, slug: true, suburb: true, isActive: true },
    })

    return {
      result:   store,
      entityId: store.id,
      before:   null,
      after:    { name: store.name, slug: store.slug, suburb: store.suburb },
    }
  },
})
