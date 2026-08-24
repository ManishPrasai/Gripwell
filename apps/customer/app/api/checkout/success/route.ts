import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@nova/database'
import { sendOrderConfirmation } from '../../../../lib/email'

let _stripe: Stripe | null = null
function getStripe(): Stripe | null {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}

// ── Dev user (same pattern as /api/cart) ─────────────────────────────────────
let _devUserId: string | null = null

async function devUserId(): Promise<string> {
  if (_devUserId) return _devUserId
  const c = await prisma.customer.upsert({
    where:  { email: 'dev@local.nova' },
    update: {},
    create: {
      firstName:    'Dev',
      lastName:     'User',
      email:        'dev@local.nova',
      passwordHash: 'dev-bypass-no-auth',
    },
    select: { id: true },
  })
  _devUserId = c.id
  return _devUserId
}

// ── Dev store (Nova Tyres Sefton — the default fitting station) ───────────────
// Order.storeId is a non-nullable FK, so we upsert the store once per process.
let _devStoreId: string | null = null

async function devStoreId(): Promise<string> {
  if (_devStoreId) return _devStoreId
  const s = await prisma.store.upsert({
    where:  { slug: 'nova-tyres-sefton' },
    update: {},
    create: {
      name:      'Nova Tyres Sefton',
      slug:      'nova-tyres-sefton',
      address:   '107 Carlingford St',
      suburb:    'Sefton',
      state:     'NSW',
      postcode:  '2162',
      latitude:  -33.8952,
      longitude: 151.0114,
      phone:     '0403388774',
      email:     'sefton.novatyres@gmail.com',
    },
    select: { id: true },
  })
  _devStoreId = s.id
  return _devStoreId
}

// ── POST /api/checkout/success ────────────────────────────────────────────────
// Called immediately after a successful Stripe payment confirmation.
//
// Flow:
//  1. Idempotency guard — if paymentIntentId already has an Order, return it.
//  2. Fetch CartItems for dev user.
//  3. Resolve slug → UUID + price from Tyre/Wheel tables.
//  4. In a single DB transaction: create Order + OrderItems, then delete CartItems.
//  5. Return { orderId, orderNumber, total } to the frontend.
export async function POST(req: NextRequest) {
  try {
    const body             = await req.json().catch(() => ({}))
    const b                = body as { paymentIntentId?: string; email?: string; name?: string; storeName?: string }
    const paymentIntentId  = b.paymentIntentId ?? null
    const contactEmail     = (b.email ?? '').trim()
    const contactName      = (b.name ?? '').trim() || 'Customer'
    const storeName        = (b.storeName ?? '').trim()

    const [userId, storeId] = await Promise.all([devUserId(), devStoreId()])

    // ── 1. Idempotency: don't create duplicate orders for the same payment ────
    if (paymentIntentId) {
      const existing = await prisma.order.findFirst({
        where:  { stripePaymentIntentId: paymentIntentId },
        select: { id: true, total: true },
      })
      if (existing) {
        return NextResponse.json({
          orderId:     existing.id,
          orderNumber: `NVT-${existing.id.slice(0, 8).toUpperCase()}`,
          total:       Number(existing.total),
        })
      }
    }

    // ── 2. Fetch active cart rows ─────────────────────────────────────────────
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: userId },
    })

    if (cartItems.length === 0) {
      // Cart already cleared — order was likely already recorded
      return NextResponse.json(
        { error: 'Cart is empty — the order may have already been recorded.' },
        { status: 400 },
      )
    }

    // ── 3. Resolve slug → { id, price } from product tables ──────────────────
    // CartItem.productId stores the slug; OrderItem.tyreId/wheelId need the UUID.
    const tyreSlugs  = cartItems.filter(i => i.productType === 'tyre').map(i => i.productId)
    const wheelSlugs = cartItems.filter(i => i.productType === 'wheel').map(i => i.productId)

    type ProductRow = {
      id: string; slug: string; price: { toString: () => string }; brand: string; model: string
      tyreSize?: { width: number; profile: number; rimDiameter: number; loadIndex: number | null; speedRating: string | null } | null
      diameter?: number; width?: unknown; pcd?: string
    }

    const [tyreRows, wheelRows]: [ProductRow[], ProductRow[]] = await Promise.all([
      tyreSlugs.length
        ? prisma.tyre.findMany({ where: { slug: { in: tyreSlugs } }, select: { id: true, slug: true, price: true, brand: true, model: true, tyreSize: { select: { width: true, profile: true, rimDiameter: true, loadIndex: true, speedRating: true } } } }) as Promise<ProductRow[]>
        : Promise.resolve([] as ProductRow[]),
      wheelSlugs.length
        ? prisma.wheel.findMany({ where: { slug: { in: wheelSlugs } }, select: { id: true, slug: true, price: true, brand: true, model: true, diameter: true, width: true, pcd: true } }) as Promise<ProductRow[]>
        : Promise.resolve([] as ProductRow[]),
    ])

    const tyreMap  = new Map<string, ProductRow>(tyreRows.map(t  => [t.slug, t]))
    const wheelMap = new Map<string, ProductRow>(wheelRows.map(w => [w.slug, w]))

    // ── 4. Build financials ───────────────────────────────────────────────────
    const subtotal = cartItems.reduce((sum, item) => {
      const row = item.productType === 'tyre'
        ? tyreMap.get(item.productId)
        : wheelMap.get(item.productId)
      return sum + Number(row?.price ?? 0) * item.quantity
    }, 0)

    // ── 4b. Recover discount + GST + fitting from the PaymentIntent metadata ──
    //  The PaymentIntent is the source of truth for what was actually charged.
    let discountAmount = 0
    let discountId = ''
    let gst = Math.round(subtotal * 0.10 * 100) / 100   // fallback if metadata missing
    let fitting = 0
    let fulfilMethod: 'fit' | 'pickup' = 'fit'
    let fitCount = 0
    if (paymentIntentId) {
      try {
        const intent = await getStripe()?.paymentIntents.retrieve(paymentIntentId)
        const m = intent?.metadata ?? {}
        const dcents = Number(m.discountCents || 0)
        if (dcents > 0) { discountAmount = dcents / 100; discountId = m.discountId || '' }
        if (m.gstCents     != null) gst     = Number(m.gstCents) / 100
        if (m.fittingCents != null) fitting = Number(m.fittingCents) / 100
        if (m.fulfilMethod === 'pickup') fulfilMethod = 'pickup'
        if (m.fitCount != null) fitCount = Number(m.fitCount)
      } catch { /* fall back to computed GST, no discount/fitting */ }
    }

    const total = Math.max(0, subtotal + gst + fitting - discountAmount)

    // ── 5. Create Order + clear cart atomically ───────────────────────────────
    const order = await prisma.$transaction(async tx => {

      const newOrder = await tx.order.create({
        data: {
          customerId:            userId,
          storeId,
          // Enums passed as string literals — Prisma accepts the string value
          status:                'CONFIRMED' as const,
          paymentStatus:         'PAID'      as const,
          subtotal,
          discountAmount,
          total,
          paymentMethod:         'stripe',
          stripePaymentIntentId: paymentIntentId,
          items: {
            create: [
              // ── Product line items (tyres + wheels) ────────────────────────
              ...cartItems.map(item => {
                const isTyre   = item.productType === 'tyre'
                const row      = isTyre ? tyreMap.get(item.productId) : wheelMap.get(item.productId)
                const unitCost = Number(row?.price ?? 0)
                return {
                  itemType:   item.productType,
                  tyreId:     isTyre ? (row?.id ?? null) : null,
                  wheelId:    !isTyre ? (row?.id ?? null) : null,
                  quantity:   item.quantity,
                  unitPrice:  unitCost,
                  totalPrice: unitCost * item.quantity,
                }
              }),
              // ── Fitting service (only when fitting was chosen) ─────────────
              ...(fitting > 0
                ? [{ itemType: 'fitting', quantity: 1, unitPrice: fitting, totalPrice: fitting }]
                : []),
            ],
          },
        },
        select: { id: true },
      })

      // Record discount usage (increment counter + usage row) atomically.
      if (discountId && discountAmount > 0) {
        await tx.discount.update({ where: { id: discountId }, data: { currentUses: { increment: 1 } } })
        await tx.discountUsage.create({ data: { discountId, customerId: userId, orderId: newOrder.id } })
      }

      // Clear cart now that the order is safely persisted in the same transaction
      await tx.cartItem.deleteMany({ where: { customerId: userId } })

      return newOrder
    })

    const orderNumber = `NVT-${order.id.slice(0, 8).toUpperCase()}`

    console.log(`[checkout/success] Order ${orderNumber} created — A$${total.toFixed(2)}`)

    // ── 6. Order confirmation + invoice email (best-effort; never blocks) ─────
    if (contactEmail) {
      const emailItems = cartItems.map(item => {
        const isTyre = item.productType === 'tyre'
        const row    = isTyre ? tyreMap.get(item.productId) : wheelMap.get(item.productId)
        const unit   = Number(row?.price ?? 0)
        let sub = ''
        if (isTyre && row?.tyreSize) {
          const ts = row.tyreSize
          sub = `${ts.width}/${ts.profile}R${ts.rimDiameter}${ts.loadIndex && ts.speedRating ? ` · ${ts.loadIndex}${ts.speedRating}` : ''}`
        } else if (!isTyre && row) {
          sub = `${row.diameter}"×${Number(row.width)} · ${row.pcd}`
        }
        return {
          name: `${row?.brand ?? ''} ${row?.model ?? ''}`.trim() || (isTyre ? 'Tyre' : 'Wheel'),
          sub, qty: item.quantity, unitPrice: unit, total: unit * item.quantity,
        }
      })
      const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0)
      try {
        await sendOrderConfirmation({
          to: contactEmail, customerName: contactName, orderNumber, items: emailItems,
          subtotal, gst, fitting, discount: discountAmount, total,
          fulfilMethod, fitCount: fitCount || itemCount, itemCount,
          storeName: storeName || undefined,
        })
      } catch (e) { console.error('[checkout/success] confirmation email failed', e) }
    }

    return NextResponse.json({ orderId: order.id, orderNumber, total })

  } catch (err) {
    console.error('[checkout/success]', err)
    return NextResponse.json({ error: 'Failed to record order.' }, { status: 500 })
  }
}
