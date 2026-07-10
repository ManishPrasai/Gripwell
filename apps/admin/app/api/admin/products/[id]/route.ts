/**
 * PATCH  /api/admin/products/[id]  — edit price / stock / status
 * DELETE /api/admin/products/[id]  — soft-delete (removes from site + inventory)
 *
 * Products (Tyre + Wheel) are a single shared catalog across all stores, so
 * these are SUPER_ADMIN-only. The id may belong to either table — we resolve it.
 */
import { z } from 'zod'
import type { Prisma } from '@nova/database'
import { defineMutation, notFound, assertSuperAdmin } from '../../../../../lib/mutation'

const ProductPatchSchema = z.object({
  price:  z.number().nonnegative().optional(),
  stock:  z.number().int().min(0).optional(),
  status: z.enum(['active', 'draft']).optional(),
})

/** Find a product in either the Tyre or Wheel table. */
async function resolveProduct(tx: Prisma.TransactionClient, id: string) {
  const tyre = await tx.tyre.findUnique({
    where: { id },
    select: { id: true, price: true, stockQuantity: true, isActive: true },
  })
  if (tyre) return { kind: 'tyre' as const, row: tyre }

  const wheel = await tx.wheel.findUnique({
    where: { id },
    select: { id: true, price: true, stockQuantity: true, isActive: true },
  })
  if (wheel) return { kind: 'wheel' as const, row: wheel }

  return null
}

export const PATCH = defineMutation({
  schema:     ProductPatchSchema,
  action:     'PRODUCT_UPDATED',
  entityType: 'Product',
  run: async ({ data, admin, params, tx }) => {
    assertSuperAdmin(admin)

    const found = await resolveProduct(tx, params.id)
    if (!found) throw notFound('Product not found')

    const patch: Record<string, unknown> = {}
    if (data.price  !== undefined) patch.price         = data.price
    if (data.stock  !== undefined) patch.stockQuantity = data.stock
    if (data.status !== undefined) patch.isActive      = data.status === 'active'

    const before = { price: Number(found.row.price), stock: found.row.stockQuantity, active: found.row.isActive }

    const updated = found.kind === 'tyre'
      ? await tx.tyre.update({ where: { id: params.id }, data: patch, select: { id: true, price: true, stockQuantity: true, isActive: true } })
      : await tx.wheel.update({ where: { id: params.id }, data: patch, select: { id: true, price: true, stockQuantity: true, isActive: true } })

    return {
      result:   { id: updated.id, price: Number(updated.price), stock: updated.stockQuantity, status: updated.isActive ? 'active' : 'draft' },
      entityId: updated.id,
      before,
      after:    { price: Number(updated.price), stock: updated.stockQuantity, active: updated.isActive },
    }
  },
})

export const DELETE = defineMutation({
  action:     'PRODUCT_DELETED',
  entityType: 'Product',
  run: async ({ admin, params, tx }) => {
    assertSuperAdmin(admin)

    const found = await resolveProduct(tx, params.id)
    if (!found) throw notFound('Product not found')

    // Soft delete — hides it from inventory and the storefront, keeps history.
    const data = { deletedAt: new Date(), isActive: false }
    if (found.kind === 'tyre') await tx.tyre.update({ where: { id: params.id }, data })
    else                       await tx.wheel.update({ where: { id: params.id }, data })

    return {
      result:   { id: params.id, deleted: true },
      entityId: params.id,
      before:   { active: found.row.isActive },
      after:    { deleted: true },
    }
  },
})
