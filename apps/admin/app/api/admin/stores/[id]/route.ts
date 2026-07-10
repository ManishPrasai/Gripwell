/**
 * PATCH /api/admin/stores/[id]  — edit store details, open/close, and hours.
 *
 * Requires the `stores` manage permission. Store managers may only edit their
 * own store. Hours (if provided) replace the store's full weekly schedule.
 */
import { z } from 'zod'
import { defineMutation, assertPermission, notFound } from '../../../../../lib/mutation'

const HoursSchema = z.object({
  dayOfWeek: z.string().min(1).max(12),
  openTime:  z.string().max(8),
  closeTime: z.string().max(8),
  isClosed:  z.boolean(),
})

const StorePatchSchema = z.object({
  name:     z.string().trim().min(1).max(120).optional(),
  address:  z.string().trim().max(200).optional(),
  suburb:   z.string().trim().max(100).optional(),
  state:    z.string().trim().max(20).optional(),
  postcode: z.string().trim().max(12).optional(),
  phone:    z.string().trim().max(40).optional(),
  email:    z.string().email().max(254).optional(),
  isActive: z.boolean().optional(),                    // open / close
  hours:    z.array(HoursSchema).max(7).optional(),
})

export const PATCH = defineMutation({
  schema:     StorePatchSchema,
  action:     'STORE_UPDATED',
  entityType: 'Store',
  run: async ({ data, admin, params, tx, assertScope }) => {
    assertPermission(admin, 'stores', 2)

    const store = await tx.store.findUnique({ where: { id: params.id }, select: { id: true, isActive: true, name: true } })
    if (!store) throw notFound('Store not found')
    assertScope(store.id)   // managers: own store only

    const { hours, ...fields } = data
    const patch: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) patch[k] = v

    const updated = Object.keys(patch).length
      ? await tx.store.update({ where: { id: store.id }, data: patch, select: { id: true, name: true, isActive: true } })
      : store

    if (hours) {
      // Replace the full weekly schedule atomically.
      await tx.storeHours.deleteMany({ where: { storeId: store.id } })
      await tx.storeHours.createMany({ data: hours.map(h => ({ ...h, storeId: store.id })) })
    }

    return {
      result:   updated,
      entityId: store.id,
      before:   { isActive: store.isActive, name: store.name },
      after:    { isActive: updated.isActive, name: updated.name, hoursUpdated: !!hours },
    }
  },
})
