import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'

// ── Dev user ─────────────────────────────────────────────────────────────────
// No auth in dev. We upsert a placeholder Customer once per process so all
// CartItem FK constraints are satisfied without touching real auth.
let _devUserId: string | null = null

async function devUserId(): Promise<string> {
  if (_devUserId) return _devUserId

  const customer = await prisma.customer.upsert({
    where: { email: 'dev@local.nova' },
    update: {},
    create: {
      firstName: 'Dev',
      lastName:  'User',
      email:     'dev@local.nova',
      passwordHash: 'dev-bypass-no-auth',
    },
    select: { id: true },
  })

  _devUserId = customer.id
  return _devUserId
}

// ── GET /api/cart ─────────────────────────────────────────────────────────────
// Returns every CartItem row belonging to the dev user.
export async function GET() {
  try {
    const userId = await devUserId()
    const items = await prisma.cartItem.findMany({
      where:   { customerId: userId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (err) {
    console.error('[cart GET]', err)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// ── POST /api/cart ────────────────────────────────────────────────────────────
// Add an item. If the row already exists, increments quantity by 1.
// Body: { productId: string, productType: 'tyre'|'wheel', quantity?: number }
export async function POST(req: NextRequest) {
  try {
    const userId = await devUserId()
    const { productId, productType, quantity = 1 } = await req.json()

    if (!productId || !productType) {
      return NextResponse.json({ error: 'productId and productType are required' }, { status: 400 })
    }

    const item = await prisma.cartItem.upsert({
      where: {
        customerId_productType_productId: { customerId: userId, productType, productId },
      },
      update: { quantity },   // set exact quantity, never blindly increment
      create: { customerId: userId, productType, productId, quantity },
    })

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[cart POST]', err)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}

// ── PUT /api/cart ─────────────────────────────────────────────────────────────
// Set an item to a specific quantity. quantity ≤ 0 deletes the row.
// Body: { productId: string, productType: string, quantity: number }
export async function PUT(req: NextRequest) {
  try {
    const userId = await devUserId()
    const { productId, productType, quantity } = await req.json()

    if (!productId || !productType || quantity == null) {
      return NextResponse.json({ error: 'productId, productType and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { customerId: userId, productType, productId },
      })
      return NextResponse.json({ deleted: true })
    }

    const item = await prisma.cartItem.upsert({
      where: {
        customerId_productType_productId: { customerId: userId, productType, productId },
      },
      update: { quantity },
      create: { customerId: userId, productType, productId, quantity },
    })

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[cart PUT]', err)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
// With body { productId, productType }: removes that single row.
// With empty body:                      clears the entire dev-user cart.
export async function DELETE(req: NextRequest) {
  try {
    const userId = await devUserId()
    const body = await req.json().catch(() => ({}))
    const { productId, productType } = body as { productId?: string; productType?: string }

    if (productId && productType) {
      await prisma.cartItem.deleteMany({
        where: { customerId: userId, productType, productId },
      })
    } else {
      await prisma.cartItem.deleteMany({ where: { customerId: userId } })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cart DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete item(s)' }, { status: 500 })
  }
}
