import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@nova/database'
import { computeDiscount } from '../../../../lib/discount'
import { MAX_TYRES_PER_ORDER } from '../../../../lib/order-rules'
import { fittingRate, computeTotalsCents, isVehicleType, type VehicleType } from '../../../../lib/fitting'

// ── Stripe server client (lazy) ───────────────────────────────────────────────
// Initialised on first request, not at module load, so the build phase never
// calls new Stripe() with an undefined key and the compiler doesn't hang.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  // Cloudflare Workers: the SDK must use the fetch HTTP client, not Node http
  // (which hangs on workerd).
  _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}

// ── Dev user helper (same pattern as /api/cart) ───────────────────────────────
let _devUserId: string | null = null

async function devUserId(): Promise<string> {
  if (_devUserId) return _devUserId
  const customer = await prisma.customer.upsert({
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
  _devUserId = customer.id
  return _devUserId
}

// ── POST /api/checkout/create-payment-intent ──────────────────────────────────
// 1. Load CartItems from DB for dev user.
// 2. Look up authoritative prices from Tyre / Wheel tables (never trust client).
// 3. Add fitting fee, convert to cents, create Stripe PaymentIntent.
// 4. Return { clientSecret } to the browser.
export async function POST(req: Request) {
  try {
    const userId = await devUserId()
    const body = await req.json().catch(() => ({} as any))
    const discountCode = String(body?.discountCode || '').trim()

    // Fitting context from the cart (server re-derives the price — never trusts a
    // client-supplied amount, only the selected vehicle type + fulfilment method).
    const rawVehicle = String(body?.vehicleType || 'passenger')
    const vehicle = isVehicleType(rawVehicle) ? rawVehicle : 'passenger'
    const fulfilMethod = String(body?.method || 'fit') === 'pickup' ? 'pickup' : 'fit'
    const storeId = String(body?.storeId || '').trim()

    // ── 1. Fetch cart rows ────────────────────────────────────────────────────
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: userId },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Tyre limit is a business rule, so enforce it here too — the UI cap is
    // only a convenience and can be bypassed by posting straight to this route.
    const tyreQty = cartItems
      .filter(i => i.productType === 'tyre')
      .reduce((n, i) => n + i.quantity, 0)
    if (tyreQty > MAX_TYRES_PER_ORDER) {
      return NextResponse.json(
        { error: `A maximum of ${MAX_TYRES_PER_ORDER} tyres can be purchased per order. Your cart has ${tyreQty}.` },
        { status: 400 },
      )
    }

    // ── 2. Look up prices by slug from product tables ─────────────────────────
    const tyreSlugs  = cartItems.filter(i => i.productType === 'tyre').map(i => i.productId)
    const wheelSlugs = cartItems.filter(i => i.productType === 'wheel').map(i => i.productId)

    const [tyres, wheels] = await Promise.all([
      tyreSlugs.length
        ? prisma.tyre.findMany({
            where:  { slug: { in: tyreSlugs } },
            select: { slug: true, price: true },
          })
        : [],
      wheelSlugs.length
        ? prisma.wheel.findMany({
            where:  { slug: { in: wheelSlugs } },
            select: { slug: true, price: true },
          })
        : [],
    ])

    // Build slug → price lookup (Decimal → number)
    const priceMap = new Map<string, number>([
      ...tyres.map(t  => [t.slug, Number(t.price)]  as [string, number]),
      ...wheels.map(w => [w.slug, Number(w.price)]  as [string, number]),
    ])

    // ── 3. Calculate total ────────────────────────────────────────────────────
    const subtotalCents = cartItems.reduce((sum, item) => {
      const unitPrice = priceMap.get(item.productId) ?? 0
      return sum + Math.round(unitPrice * 100) * item.quantity
    }, 0)
    const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0)
    // How many tyres/wheels the customer chose to fit (rest go home). Default: all.
    const rawFit = Number(body?.fitCount)
    const fitCount = Number.isFinite(rawFit) ? Math.max(0, Math.min(Math.floor(rawFit), itemCount)) : itemCount

    // ── 3b. Apply discount code (server-authoritative) ────────────────────────
    let discountCents = 0
    let appliedCode = ''
    let discountId = ''
    if (discountCode) {
      const d = await computeDiscount(discountCode, subtotalCents / 100)
      if (d.valid && d.discountAmount) {
        discountCents = Math.round(d.discountAmount * 100)
        appliedCode = d.code ?? ''
        discountId = d.discountId ?? ''
      }
    }

    // ── 3c. GST (10% on products) + fitting (per-vehicle rate × items fitted).
    //  Use the chosen store's overrides when present, else app-wide defaults.
    let storePrices: Partial<Record<VehicleType, number>> | null = null
    if (storeId) {
      const rows = await prisma.storeFittingPrice.findMany({
        where: { storeId }, select: { vehicleType: true, price: true },
      })
      if (rows.length) {
        storePrices = {}
        for (const r of rows) if (isVehicleType(r.vehicleType)) storePrices[r.vehicleType] = Number(r.price)
      }
    }
    const rate = fittingRate(vehicle, storePrices)
    const { totalCents, gstCents, fittingCents } = computeTotalsCents({
      subtotalCents, itemCount: fitCount, fittingRate: rate, fit: fulfilMethod === 'fit', discountCents,
    })

    // ── 4. Create Stripe PaymentIntent ────────────────────────────────────────
    const intent = await getStripe().paymentIntents.create({
      amount:   totalCents,
      currency: 'aud',
      payment_method_types: ['card'],
      metadata: {
        customerId:  userId,
        environment: 'dev-local',
        itemCount:   cartItems.length,
        discountCode: appliedCode,
        discountId,
        discountCents: String(discountCents),
        gstCents:     String(gstCents),
        fittingCents: String(fittingCents),
        vehicleType:  vehicle,
        fulfilMethod,
        fitCount:     String(fitCount),
      },
    })

    return NextResponse.json({
      clientSecret: intent.client_secret,
      discountApplied: discountCents > 0,
      discountAmount: discountCents / 100,
      code: appliedCode,
    })
  } catch (err) {
    console.error('[create-payment-intent]', err)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
