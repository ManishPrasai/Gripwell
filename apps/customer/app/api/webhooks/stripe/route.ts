import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@nova/database'

// ── Stripe server client (lazy) ───────────────────────────────────────────────
// Both getStripe() and getWebhookSecret() defer env reads to request time so
// the build phase never evaluates them with undefined values.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set')
  return secret
}
const FITTING_FEE    = 25.00

// ── Dev user (same pattern as other routes) ───────────────────────────────────
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

// ── Dev store ─────────────────────────────────────────────────────────────────
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

// ── POST /api/webhooks/stripe ─────────────────────────────────────────────────
//
// Flow:
//  1. Read raw body — required for Stripe signature verification.
//  2. Verify the Stripe-Signature header against STRIPE_WEBHOOK_SECRET.
//  3. Persist a WebhookEvent row immediately (audit trail).
//  4. Dispatch to the appropriate event handler.
//  5. Update WebhookEvent.status to 'processed' or 'failed'.
//  6. Always return 200 to Stripe (non-200 triggers retries).
//
// IMPORTANT: Next.js must NOT buffer or re-parse the body before it reaches
// this handler. App Router reads `req.text()` as the original byte stream,
// which is what stripe.webhooks.constructEvent expects.
export async function POST(req: NextRequest) {
  // ── 1. Raw body ────────────────────────────────────────────────────────────
  const rawBody = await req.text()
  const sig     = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('[webhook/stripe] Missing Stripe-Signature header')
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 })
  }

  // ── 2. Verify signature ────────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, getWebhookSecret())
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook/stripe] Signature verification failed:', msg)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${msg}` },
      { status: 400 },
    )
  }

  // ── 3. Persist audit log ───────────────────────────────────────────────────
  const webhookLog = await prisma.webhookEvent.create({
    data: {
      source:    'stripe',
      eventType: event.type,
      payload:   JSON.stringify(event),
      status:    'received',
    },
    select: { id: true },
  })

  console.log(`[webhook/stripe] Received ${event.type} (evt: ${event.id})`)

  // ── 4. Dispatch ────────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        console.warn(`[webhook/stripe] Payment failed for PI ${pi.id}: ${pi.last_payment_error?.message ?? 'unknown error'}`)
        break
      }

      default:
        // Unhandled events are acknowledged without processing — Stripe will
        // not retry events that receive a 2xx response.
        console.log(`[webhook/stripe] Unhandled event type ignored: ${event.type}`)
    }

    // ── 5a. Mark processed ─────────────────────────────────────────────────
    await prisma.webhookEvent.update({
      where: { id: webhookLog.id },
      data:  { status: 'processed', processedAt: new Date() },
    })

    return NextResponse.json({ received: true })

  } catch (err) {
    // ── 5b. Mark failed ────────────────────────────────────────────────────
    console.error('[webhook/stripe] Handler error:', err)

    await prisma.webhookEvent.update({
      where: { id: webhookLog.id },
      data:  { status: 'failed' },
    }).catch(() => {}) // don't let log update shadow the original error

    // Return 200 so Stripe doesn't retry indefinitely for non-transient errors.
    // Change to 500 if you want Stripe to retry on infrastructure failures.
    return NextResponse.json({ error: 'Handler error — logged' }, { status: 200 })
  }
}

// ── payment_intent.succeeded ──────────────────────────────────────────────────
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const piId         = paymentIntent.id
  // Stripe amount is in the smallest currency unit (cents for AUD).
  const stripeTotal  = paymentIntent.amount / 100

  // ── Idempotency: skip if an Order already exists for this PI ──────────────
  // The client-side /api/checkout/success route may have already run.
  const existing = await prisma.order.findFirst({
    where:  { stripePaymentIntentId: piId },
    select: { id: true },
  })
  if (existing) {
    console.log(`[webhook/stripe] Order already recorded for PI ${piId} — skipping duplicate creation`)
    return
  }

  const [userId, storeId] = await Promise.all([devUserId(), devStoreId()])

  // ── Fetch active cart rows ─────────────────────────────────────────────────
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId: userId },
  })

  if (cartItems.length === 0) {
    // Cart was already cleared (client-side success flow ran first but somehow
    // didn't create the Order — or there's a genuine data issue).
    // Log a warning and do not create a duplicate. Stripe amount is the
    // ground truth; manual review may be needed.
    console.warn(
      `[webhook/stripe] PI ${piId} succeeded (A$${stripeTotal.toFixed(2)}) ` +
      `but cart is empty and no Order exists — requires manual review.`,
    )
    return
  }

  // ── Resolve CartItem slugs → DB UUIDs + authoritative prices ─────────────
  const tyreSlugs  = cartItems.filter(i => i.productType === 'tyre' ).map(i => i.productId)
  const wheelSlugs = cartItems.filter(i => i.productType === 'wheel').map(i => i.productId)

  type ProductRow = { id: string; slug: string; price: { toString(): string } }

  const [tyreRows, wheelRows]: [ProductRow[], ProductRow[]] = await Promise.all([
    tyreSlugs.length
      ? prisma.tyre.findMany({
          where:  { slug: { in: tyreSlugs } },
          select: { id: true, slug: true, price: true },
        }) as Promise<ProductRow[]>
      : Promise.resolve([] as ProductRow[]),
    wheelSlugs.length
      ? prisma.wheel.findMany({
          where:  { slug: { in: wheelSlugs } },
          select: { id: true, slug: true, price: true },
        }) as Promise<ProductRow[]>
      : Promise.resolve([] as ProductRow[]),
  ])

  const tyreMap  = new Map<string, ProductRow>(tyreRows.map(t  => [t.slug, t]))
  const wheelMap = new Map<string, ProductRow>(wheelRows.map(w => [w.slug, w]))

  // ── Financials ─────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => {
    const row = item.productType === 'tyre'
      ? tyreMap.get(item.productId)
      : wheelMap.get(item.productId)
    return sum + Number(row?.price ?? 0) * item.quantity
  }, 0)

  // Use the Stripe-confirmed amount as the canonical total so the Order
  // always reflects what was actually charged, even if there's a price
  // discrepancy between the DB and the PaymentIntent (e.g. price updated mid-session).
  const total = stripeTotal

  // ── Atomic: create Order + clear cart ─────────────────────────────────────
  const order = await prisma.$transaction(async tx => {
    const newOrder = await tx.order.create({
      data: {
        customerId:            userId,
        storeId,
        status:                'CONFIRMED',
        paymentStatus:         'PAID',
        subtotal,
        discountAmount:        0,
        total,
        paymentMethod:         'stripe',
        stripePaymentIntentId: piId,
        items: {
          create: [
            // ── Product line items ────────────────────────────────────────
            ...cartItems.map(item => {
              const isTyre   = item.productType === 'tyre'
              const row      = isTyre ? tyreMap.get(item.productId) : wheelMap.get(item.productId)
              const unitCost = Number(row?.price ?? 0)
              return {
                itemType:   item.productType,
                tyreId:     isTyre  ? (row?.id ?? null) : null,
                wheelId:    !isTyre ? (row?.id ?? null) : null,
                quantity:   item.quantity,
                unitPrice:  unitCost,
                totalPrice: unitCost * item.quantity,
              }
            }),
            // ── Fitting & balancing fee ───────────────────────────────────
            {
              itemType:   'fitting',
              quantity:   1,
              unitPrice:  FITTING_FEE,
              totalPrice: FITTING_FEE,
            },
          ],
        },
      },
      select: { id: true },
    })

    // Clear cart now that the order is safely persisted
    await tx.cartItem.deleteMany({ where: { customerId: userId } })

    return newOrder
  })

  const orderNumber = `NVT-${order.id.slice(0, 8).toUpperCase()}`
  console.log(`[webhook/stripe] Order ${orderNumber} created via webhook — A$${total.toFixed(2)}`)
}
