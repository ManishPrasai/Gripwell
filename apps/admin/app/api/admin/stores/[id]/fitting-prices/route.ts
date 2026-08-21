/**
 * Fitting/balancing prices for a store, by vehicle type.
 *
 *   GET  → the store's current prices (defaults merged with any overrides).
 *   PUT  → upsert the four vehicle-type prices for the store.
 *
 * Requires the `stores` permission; store managers are scoped to their own store.
 * On save the customer-facing `stores:all` cache is invalidated so the storefront
 * cart reflects the new rates immediately.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, deleteCache } from '@nova/database'
import { defineMutation, requireAdmin, assertPermission, assertStoreScope, notFound } from '../../../../../../lib/mutation'
import { DEFAULT_FITTING_PRICES, isVehicleType } from '../../../../../../lib/fitting'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req)
    assertPermission(admin, 'stores', 1)
    const { id } = await ctx.params

    const store = await prisma.store.findUnique({ where: { id }, select: { id: true } })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    assertStoreScope(admin, id)

    const rows = await prisma.storeFittingPrice.findMany({
      where: { storeId: id }, select: { vehicleType: true, price: true },
    })
    const prices: Record<string, number> = { ...DEFAULT_FITTING_PRICES }
    for (const r of rows) if (isVehicleType(r.vehicleType)) prices[r.vehicleType] = Number(r.price)

    return NextResponse.json({ prices })
  } catch (err: unknown) {
    const status = typeof (err as { status?: number })?.status === 'number' ? (err as { status: number }).status : 500
    return NextResponse.json({ error: (err as Error)?.message || 'Failed to load prices' }, { status })
  }
}

const price = z.number().min(0).max(100000)
const PricesSchema = z.object({
  prices: z.object({ passenger: price, suv: price, commercial: price, truck: price }),
})

export const PUT = defineMutation({
  schema:     PricesSchema,
  action:     'STORE_UPDATED',
  entityType: 'Store',
  run: async ({ data, admin, params, tx, assertScope }) => {
    assertPermission(admin, 'stores', 2)

    const store = await tx.store.findUnique({ where: { id: params.id }, select: { id: true, name: true } })
    if (!store) throw notFound('Store not found')
    assertScope(store.id)

    for (const [vehicleType, value] of Object.entries(data.prices)) {
      await tx.storeFittingPrice.upsert({
        where:  { storeId_vehicleType: { storeId: store.id, vehicleType } },
        create: { storeId: store.id, vehicleType, price: value },
        update: { price: value },
      })
    }

    // Storefront reads /api/stores (cached) — clear it so new rates show at once.
    await deleteCache('stores:all')

    return {
      result:   { ok: true, prices: data.prices },
      entityId: store.id,
      before:   null,
      after:    { store: store.name, prices: data.prices },
    }
  },
})
