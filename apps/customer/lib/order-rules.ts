/**
 * Order rules shared by the storefront UI and the checkout API.
 *
 * Kept framework-agnostic (no 'use client') so server routes can import it too
 * — the checkout must re-check these limits itself, since anything enforced
 * only in the UI can be bypassed by posting straight to the API.
 */

/** A standard fitment is a set of 4 — preselected on the product page. */
export const DEFAULT_TYRE_QTY = 4

/** Two sets. The most we'll accept in a single order. */
export const MAX_TYRES_PER_ORDER = 8
