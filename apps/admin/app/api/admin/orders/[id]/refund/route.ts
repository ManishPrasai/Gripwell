/**
 * POST /api/admin/orders/[id]/refund — refund an order (full or partial).
 *
 * Store-scoped (managers → own store, super-admin → all). If the order has a
 * Stripe payment intent we issue a real Stripe refund; otherwise we record a
 * manual refund (cash / Zip / bank) against the order. The Stripe call runs
 * OUTSIDE any DB transaction so a network hiccup can't hold a row lock.
 *
 * Body: { amount?: number (dollars, omit for full), reason?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@nova/database'
import { requireAdmin, assertStoreScope, AdminError, badRequest, notFound, getIp } from '../../../../../../lib/mutation'
import { logAction } from '../../../../../../lib/audit'
import { getStripe } from '../../../../../../lib/stripe'

const RefundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().trim().max(300).optional(),
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req)
    const { id } = await ctx.params
    const parsed = RefundSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) return NextResponse.json({ error: 'Invalid refund request' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, storeId: true, status: true, paymentStatus: true, total: true, stripePaymentIntentId: true },
    })
    if (!order) throw notFound('Order not found')
    assertStoreScope(admin, order.storeId)

    if (order.status === 'REFUNDED' || order.paymentStatus === 'REFUNDED') throw badRequest('This order has already been fully refunded')

    const total = Number(order.total)
    const amount = parsed.data.amount ?? total
    if (amount > total + 0.001) throw badRequest(`Refund cannot exceed the order total (A$${total.toFixed(2)})`)
    const isFull = amount >= total - 0.001
    const cents = Math.round(amount * 100)

    // 1) Money movement — Stripe, outside any transaction.
    let stripeRefundId: string | null = null
    if (order.stripePaymentIntentId) {
      const refund = await getStripe().refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: isFull ? undefined : cents,
        reason: 'requested_by_customer',
        metadata: { orderId: order.id, adminId: admin.id, note: parsed.data.reason ?? '' },
      })
      stripeRefundId = refund.id
    }

    // 2) Record the outcome in our DB.
    const newPaymentStatus = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        ...(isFull ? { status: 'REFUNDED' as const } : {}),
      },
      select: { id: true, status: true, paymentStatus: true },
    })
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        changedBy: admin.id,
        note: `Refunded A$${amount.toFixed(2)}${order.stripePaymentIntentId ? ' via Stripe' : ' (manual)'}${parsed.data.reason ? ` — ${parsed.data.reason}` : ''}`,
      },
    })

    await logAction({
      adminId: admin.id, action: 'ORDER_REFUNDED', entityType: 'Order', entityId: order.id,
      before: { status: order.status, paymentStatus: order.paymentStatus },
      after:  { status: updated.status, paymentStatus: updated.paymentStatus, amount, stripeRefundId, manual: !order.stripePaymentIntentId },
      ip: getIp(req),
    })

    return NextResponse.json({
      success: true,
      data: { id: updated.id, status: updated.status, paymentStatus: updated.paymentStatus, amount, stripeRefundId },
    })
  } catch (e: any) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    // Surface Stripe's own message so the admin sees why a refund failed.
    if (e?.type?.startsWith?.('Stripe')) return NextResponse.json({ error: e.message || 'Stripe refund failed' }, { status: 402 })
    console.error('[orders/refund] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
