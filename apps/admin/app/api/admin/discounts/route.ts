/**
 * POST /api/admin/discounts  — create a discount code.
 * Requires the `finance` manage permission (also gated in middleware).
 */
import { z } from 'zod'
import { defineMutation, assertPermission, badRequest } from '../../../../lib/mutation'

const DiscountCreateSchema = z.object({
  code:           z.string().trim().min(2).max(40).transform(s => s.toUpperCase()),
  type:           z.enum(['percent', 'fixed']),
  value:          z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses:        z.number().int().positive().optional(),
  expiresAt:      z.string().datetime().optional(),
  isActive:       z.boolean().default(true),
})

export const POST = defineMutation({
  schema:     DiscountCreateSchema,
  action:     'DISCOUNT_CREATED',
  entityType: 'Discount',
  run: async ({ data, admin, tx }) => {
    assertPermission(admin, 'finance', 2)

    const clash = await tx.discount.findUnique({ where: { code: data.code }, select: { id: true } })
    if (clash) throw badRequest('That code already exists')

    const discount = await tx.discount.create({
      data: {
        code:           data.code,
        type:           data.type,
        value:          data.value,
        minOrderAmount: data.minOrderAmount,
        maxUses:        data.maxUses,
        expiresAt:      data.expiresAt ? new Date(data.expiresAt) : null,
        isActive:       data.isActive,
      },
    })

    return { result: discount, entityId: discount.id, after: { code: discount.code, type: discount.type, value: Number(discount.value) } }
  },
})
