/**
 * PATCH  /api/admin/discounts/[id]  — edit / activate / expire a code
 * DELETE /api/admin/discounts/[id]  — soft-delete a code
 * Requires the `finance` manage permission.
 */
import { z } from 'zod'
import { defineMutation, assertPermission, notFound } from '../../../../../lib/mutation'

const DiscountPatchSchema = z.object({
  value:          z.number().positive().optional(),
  minOrderAmount: z.number().nonnegative().nullable().optional(),
  maxUses:        z.number().int().positive().nullable().optional(),
  expiresAt:      z.string().datetime().nullable().optional(),
  isActive:       z.boolean().optional(),
})

export const PATCH = defineMutation({
  schema:     DiscountPatchSchema,
  action:     'DISCOUNT_UPDATED',
  entityType: 'Discount',
  run: async ({ data, admin, params, tx }) => {
    assertPermission(admin, 'finance', 2)

    const existing = await tx.discount.findUnique({ where: { id: params.id }, select: { id: true, isActive: true } })
    if (!existing) throw notFound('Discount not found')

    const patch: Record<string, unknown> = {}
    if (data.value          !== undefined) patch.value          = data.value
    if (data.minOrderAmount !== undefined) patch.minOrderAmount = data.minOrderAmount
    if (data.maxUses        !== undefined) patch.maxUses        = data.maxUses
    if (data.isActive       !== undefined) patch.isActive       = data.isActive
    if (data.expiresAt      !== undefined) patch.expiresAt      = data.expiresAt ? new Date(data.expiresAt) : null

    const updated = await tx.discount.update({ where: { id: params.id }, data: patch })

    return { result: updated, entityId: updated.id, before: { isActive: existing.isActive }, after: { isActive: updated.isActive } }
  },
})

export const DELETE = defineMutation({
  action:     'DISCOUNT_DELETED',
  entityType: 'Discount',
  run: async ({ admin, params, tx }) => {
    assertPermission(admin, 'finance', 2)

    const existing = await tx.discount.findUnique({ where: { id: params.id }, select: { id: true, code: true } })
    if (!existing) throw notFound('Discount not found')

    await tx.discount.update({ where: { id: params.id }, data: { deletedAt: new Date(), isActive: false } })

    return { result: { id: params.id, deleted: true }, entityId: params.id, before: { code: existing.code } }
  },
})
