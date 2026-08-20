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
