/**
 * Shared discount evaluation — used by /api/discounts/validate and the checkout
 * payment-intent so the rules (active / expiry / max-uses / min-order) are
 * enforced identically everywhere. `subtotal` is in dollars.
 */
import { prisma } from '@nova/database'

export interface DiscountResult {
  valid: boolean
  error?: string
  code?: string
  type?: string
  value?: number
  discountAmount?: number   // dollars
  discountId?: string
}

export async function computeDiscount(codeRaw: string, subtotal: number): Promise<DiscountResult> {
  const code = String(codeRaw || '').trim().toUpperCase()
  if (!code) return { valid: false, error: 'Enter a code' }

  const d = await prisma.discount.findUnique({ where: { code } })
  if (!d || !d.isActive || d.deletedAt) return { valid: false, error: 'Invalid or inactive code' }
  if (d.expiresAt && d.expiresAt < new Date()) return { valid: false, error: 'This code has expired' }
  if (d.maxUses != null && d.currentUses >= d.maxUses) return { valid: false, error: 'This code has been fully redeemed' }
  if (d.minOrderAmount != null && subtotal < Number(d.minOrderAmount)) {
    return { valid: false, error: `Minimum order of $${Number(d.minOrderAmount)} required` }
  }

  const raw = d.type === 'percent' ? subtotal * (Number(d.value) / 100) : Number(d.value)
  const discountAmount = Math.round(Math.min(raw, subtotal) * 100) / 100

  return { valid: true, code: d.code, type: d.type, value: Number(d.value), discountAmount, discountId: d.id }
}
