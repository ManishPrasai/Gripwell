import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'

const FITTING_FEE = 25.00   // A$25.00 — must match FITTING_COST on the frontend

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
    const paymentIntentId  = (body as { paymentIntentId?: string }).paymentIntentId ?? null

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

    type ProductRow = { id: string; slug: string; price: { toString: () => string } }

    const [tyreRows, wheelRows]: [ProductRow[], ProductRow[]] = await Promise.all([
      tyreSlugs.length
        ? prisma.tyre.findMany({ where: { slug: { in: tyreSlugs } }, select: { id: true, slug: true, price: true } }) as Promise<ProductRow[]>
        : Promise.resolve([] as ProductRow[]),
      wheelSlugs.length
        ? prisma.wheel.findMany({ where: { slug: { in: wheelSlugs } }, select: { id: true, slug: true, price: true } }) as Promise<ProductRow[]>
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

    const total = subtotal + FITTING_FEE

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
          discountAmount:        0,
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
              // ── Fitting & balancing fee ────────────────────────────────────
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

      // Clear cart now that the order is safely persisted in the same transaction
      await tx.cartItem.deleteMany({ where: { customerId: userId } })

      return newOrder
    })

    const orderNumber = `NVT-${order.id.slice(0, 8).toUpperCase()}`

    console.log(`[checkout/success] Order ${orderNumber} created — A$${total.toFixed(2)}`)

    return NextResponse.json({ orderId: order.id, orderNumber, total })

  } catch (err) {
    console.error('[checkout/success]', err)
    return NextResponse.json({ error: 'Failed to record order.' }, { status: 500 })
  }
}
