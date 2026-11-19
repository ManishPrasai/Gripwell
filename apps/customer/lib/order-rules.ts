/**
 * Order rules shared by the storefront UI and the checkout API.
 *
 * Kept framework-agnostic (no 'use client') so server routes can import it too
 * — the checkout must re-check these limits itself, since anything enforced
 * only in the UI can be bypassed by posting straight to the API.
 */

/**
 * Quantity the tyre product page opens with — a full set is the common case.
 * A convenience default only: customers can still drop it to 1.
 * Tyres only; wheels are unaffected.
 */
export const DEFAULT_TYRE_QTY = 4

/** Hard limit — two sets. Enforced in the cart AND re-checked at checkout. */
export const MAX_TYRES_PER_ORDER = 8

/** Wheels follow the same two-set limit. */
export const MAX_WHEELS_PER_ORDER = 8

export const maxPerOrder = (productType: string) =>
  productType === 'tyre' ? MAX_TYRES_PER_ORDER : MAX_WHEELS_PER_ORDER

/** A cart quantity is a whole number from 1 to one order's limit. Anything else
    (negative, zero, fractional, huge, a string) is refused, never coerced. */
export const isValidQuantity = (q: unknown): q is number =>
  typeof q === 'number' && Number.isInteger(q) && q >= 1 && q <= MAX_TYRES_PER_ORDER

export interface CartLine   { productId: string; productType: string; quantity: unknown }
export interface PricedLine { productId: string; productType: 'tyre' | 'wheel'; quantity: number; unitPrice: number }

export type LineCheck =
  | { ok: true; lines: PricedLine[] }
  | { ok: false; status: 400 | 409; error: string; unavailable?: string[] }

/**
 * The gate before any charge. Every line must have a valid quantity, the order
 * must respect the per-type limits, and every product must be live with a real
 * price. Prices come from `priceOf` (the server's database lookup); the browser
 * never supplies one.
 */
export function checkCartLines(
  items: CartLine[],
  priceOf: (productType: string, productId: string) => number | undefined,
): LineCheck {
  if (items.length === 0) return { ok: false, status: 400, error: 'Cart is empty' }

  for (const i of items) {
    if (i.productType !== 'tyre' && i.productType !== 'wheel') {
      return { ok: false, status: 400, error: 'Your basket has an item we do not sell. Remove it and try again.' }
    }
    if (!isValidQuantity(i.quantity)) {
      return { ok: false, status: 400, error: `Quantities must be whole numbers from 1 to ${MAX_TYRES_PER_ORDER}. Update your basket and try again.` }
    }
  }

  for (const [type, label] of [['tyre', 'tyres'], ['wheel', 'wheels']] as const) {
    const n = items.filter(i => i.productType === type).reduce((s, i) => s + (i.quantity as number), 0)
    if (n > maxPerOrder(type)) {
      return { ok: false, status: 400, error: `A maximum of ${maxPerOrder(type)} ${label} can be purchased per order. Your cart has ${n}.` }
    }
  }

  const unavailable = items.filter(i => !((priceOf(i.productType, i.productId) ?? 0) > 0)).map(i => i.productId)
  if (unavailable.length > 0) {
    const one = unavailable.length === 1
    return {
      ok: false, status: 409, unavailable,
      error: `${one ? 'An item' : `${unavailable.length} items`} in your basket ${one ? 'is' : 'are'} no longer available. Remove ${one ? 'it' : 'them'} from your basket and try again.`,
    }
  }

  return {
    ok: true,
    lines: items.map(i => ({
      productId: i.productId,
      productType: i.productType as 'tyre' | 'wheel',
      quantity: i.quantity as number,
      unitPrice: priceOf(i.productType, i.productId)!,
    })),
  }
}
