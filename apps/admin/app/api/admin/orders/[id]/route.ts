/**
 * PATCH /api/admin/orders/[id] — change an order's fulfilment status.
 *
 * Store-scoped: a store manager may only move orders that belong to their own
 * store; a super-admin may move any. Records an OrderStatusHistory row and an
 * audit entry. Refunds are handled separately (see ./refund) since they touch
 * Stripe and must not run inside the DB transaction.
 */
import { z } from 'zod'
import { defineMutation, notFound, badRequest } from '../../../../../lib/mutation'

const FULFILMENT = ['PENDING', 'CONFIRMED', 'FITTED', 'CANCELLED'] as const

const OrderPatchSchema = z.object({
  status: z.enum(FULFILMENT),
  note:   z.string().trim().max(300).optional(),
})

export const PATCH = defineMutation({
  schema:     OrderPatchSchema,
  action:     'ORDER_STATUS_CHANGED',
  entityType: 'Order',
  run: async ({ data, admin, params, tx, assertScope }) => {
    const order = await tx.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, storeId: true },
    })
    if (!order) throw notFound('Order not found')
    assertScope(order.storeId)

    if (order.status === 'REFUNDED') throw badRequest('A refunded order can no longer change status')
    if (order.status === data.status) throw badRequest(`Order is already ${data.status.toLowerCase()}`)

    const updated = await tx.order.update({
      where: { id: order.id },
      data:  { status: data.status },
      select: { id: true, status: true },
    })

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: data.status, changedBy: admin.id, note: data.note || null },
    })

    return {
      result:   { id: updated.id, status: updated.status },
      entityId: updated.id,
      before:   { status: order.status },
      after:    { status: updated.status, note: data.note || undefined },
    }
  },
})
