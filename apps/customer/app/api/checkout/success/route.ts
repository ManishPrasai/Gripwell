import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@nova/database'
import { sendOrderConfirmation } from '../../../../lib/email'
import { resolveCartCustomerId, resolveOrderCustomerId, attachGuestCookie } from '../../../lib/guest-cart'

// STRIPE_SECRET_KEY is required here — this route decides whether an order
// gets marked PAID, so unlike other best-effort Stripe lookups elsewhere, a
// missing key must hard-fail rather than silently skip verification.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
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
//  1. Verify the PaymentIntent actually succeeded — the sole source of truth
//     for whether an order gets created and marked PAID.
//  2. Idempotency guard — if paymentIntentId already has an Order, return it.
//  3. Fetch CartItems for this browser's guest cart.
//  4. Resolve slug → UUID + price from Tyre/Wheel tables.
//  5. Verify the charged amount matches the current cart's computed total.
//  6. In a single DB transaction: create Order + OrderItems, then delete CartItems.
//  7. Return { orderId, orderNumber, total } to the frontend.
export async function POST(req: NextRequest) {
  try {
    const body             = await req.json().catch(() => ({}))
    const b                = body as { paymentIntentId?: string; email?: string; name?: string; storeName?: string }
    const paymentIntentId  = b.paymentIntentId ?? null
    const contactEmail     = (b.email ?? '').trim()
    const contactName      = (b.name ?? '').trim() || 'Customer'
    const storeName        = (b.storeName ?? '').trim()

    const [{ customerId: userId, guestId, isNew }, storeId] = await Promise.all([
      resolveCartCustomerId(req),
      devStoreId(),
    ])

    // ── 1. A real, successful PaymentIntent is required — no payment, no order.
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId.' }, { status: 400 })
    }

    // ── 2. Idempotency: don't create duplicate orders for the same payment ────
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

    // ── 3. Verify the PaymentIntent with Stripe — hard fail on any mismatch.
    //  This is the only check that proves money actually changed hands; every
    //  other field below is derived from data this route already trusted, so a
    //  forged/absent/unpaid/wrong-cart paymentIntentId must be rejected here.
    let intent: Stripe.PaymentIntent
    try {
      intent = await getStripe().paymentIntents.retrieve(paymentIntentId)
    } catch {
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 402 })
    }
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment has not completed.' }, { status: 402 })
    }
    if (intent.metadata?.customerId !== userId) {
      return NextResponse.json({ error: 'Payment does not belong to this cart.' }, { status: 403 })
    }

    // ── 4. Fetch active cart rows ─────────────────────────────────────────────
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

    // ── 5. Resolve slug → { id, price } from product tables ──────────────────
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

    // ── 6. Build financials ───────────────────────────────────────────────────
    const subtotal = cartItems.reduce((sum, item) => {
      const row = item.productType === 'tyre'
        ? tyreMap.get(item.productId)
        : wheelMap.get(item.productId)
      return sum + Number(row?.price ?? 0) * item.quantity
    }, 0)

    // Recover discount + GST + fitting from the already-verified PaymentIntent's
    // metadata (set by create-payment-intent when the charge was created).
    const m = intent.metadata
    let discountAmount = 0
    let discountId = ''
    const dcents = Number(m.discountCents || 0)
    if (dcents > 0) { discountAmount = dcents / 100; discountId = m.discountId || '' }
    const gst      = m.gstCents     != null ? Number(m.gstCents)     / 100 : Math.round(subtotal * 0.10 * 100) / 100
    const fitting  = m.fittingCents != null ? Number(m.fittingCents) / 100 : 0
    const fulfilMethod: 'fit' | 'pickup' = m.fulfilMethod === 'pickup' ? 'pickup' : 'fit'
    const fitCount = m.fitCount != null ? Number(m.fitCount) : 0

    const total = Math.max(0, subtotal + gst + fitting - discountAmount)

    // ── 6b. The charged amount must match what this cart computes right now —
    //  otherwise the cart was mutated after payment (e.g. pay for one cheap
    //  item, then swap in an expensive cart before calling this route). A
    //  1-cent tolerance absorbs float rounding noise, not real tampering.
    if (Math.abs(Math.round(total * 100) - intent.amount) > 1) {
      return NextResponse.json({ error: 'Cart no longer matches the amount paid.' }, { status: 409 })
    }

    // ── 6c. Attribute the order to a real, identifiable customer when an email
    //  was given at checkout (find-or-create by email — matches an existing
    //  registered account if there is one); otherwise it stays on the
    //  anonymous guest-cart placeholder.
    const orderCustomerId = await resolveOrderCustomerId(contactEmail, contactName, userId)

    // ── 7. Create Order + clear cart atomically ───────────────────────────────
    const order = await prisma.$transaction(async tx => {

      const newOrder = await tx.order.create({
        data: {
          customerId:            orderCustomerId,
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
        await tx.discountUsage.create({ data: { discountId, customerId: orderCustomerId, orderId: newOrder.id } })
      }

      // Clear cart now that the order is safely persisted in the same transaction
      await tx.cartItem.deleteMany({ where: { customerId: userId } })

      return newOrder
    })

    const orderNumber = `NVT-${order.id.slice(0, 8).toUpperCase()}`

    console.log(`[checkout/success] Order ${orderNumber} created — A$${total.toFixed(2)}`)

    // ── 8. Order confirmation + invoice email (best-effort; never blocks) ─────
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

    return attachGuestCookie(NextResponse.json({ orderId: order.id, orderNumber, total }), guestId, isNew)

  } catch (err) {
    console.error('[checkout/success]', err)
    return NextResponse.json({ error: 'Failed to record order.' }, { status: 500 })
  }
}
