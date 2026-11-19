'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ── Cart item shape ───────────────────────────────────────────────────────────
export interface CartItem {
  id:          string   // slug — unique per product, used as productId in DB
  productType: 'tyre' | 'wheel'
  brand:       string
  brandLogo:   string
  model:       string
  size:        string
  spec:        string
  price:       number
  qty:         number
  image:       string
}

// Single source of truth — the checkout API enforces these same limits.
import { DEFAULT_TYRE_QTY, MAX_TYRES_PER_ORDER, maxPerOrder } from '../../lib/order-rules'
export { DEFAULT_TYRE_QTY, MAX_TYRES_PER_ORDER }

// ── Context value ─────────────────────────────────────────────────────────────
interface CartCtx {
  items:       CartItem[]
  /** `qty` defaults to 1. Tyres are clamped so the order never exceeds MAX_TYRES_PER_ORDER. */
  addToCart:   (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, delta: number) => void
  clearCart:   () => void
  cartCount:   number
  cartTotal:   number
  /** Total tyres across the order — drives the "max 8" limit in the UI. */
  tyreCount:   number
}

const CartContext = createContext<CartCtx | null>(null)

// ── DB sync helpers (fire-and-forget) ─────────────────────────────────────────
// Called from inside setItems() updater functions so they always receive the
// freshest item snapshot — no stale-closure risk.

// POST upserts to an EXACT quantity (never blindly increments), so callers pass
// the final quantity they want the row to hold.
function dbAdd(productId: string, productType: string, quantity = 1) {
  fetch('/api/cart', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ productId, productType, quantity }),
  }).catch(err => console.error('[cart] dbAdd failed:', err))
}

function dbUpdate(productId: string, productType: string, quantity: number) {
  fetch('/api/cart', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ productId, productType, quantity }),
  }).catch(err => console.error('[cart] dbUpdate failed:', err))
}

function dbRemove(productId: string, productType: string) {
  fetch('/api/cart', {
    method:  'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ productId, productType }),
  }).catch(err => console.error('[cart] dbRemove failed:', err))
}

function dbClear() {
  fetch('/api/cart', { method: 'DELETE' })
    .catch(err => console.error('[cart] dbClear failed:', err))
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Hydrate display state from localStorage, then sync DB to match exactly.
  // This clears any stale/accumulated DB state from previous sessions so
  // the Stripe charge always reflects what the UI actually shows.
  useEffect(() => {
    let saved: CartItem[] = []
    try {
      const raw = localStorage.getItem('gw-cart')
      if (raw) saved = JSON.parse(raw)
    } catch {}

    setItems(saved)

    // Wipe DB cart, then re-seed from localStorage so quantities are in sync.
    fetch('/api/cart', { method: 'DELETE' })
      .then(() => {
        if (saved.length === 0) return
        return Promise.all(
          saved.map(item =>
            fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.id, productType: item.productType, quantity: item.qty }),
            })
          )
        )
      })
      .catch(err => console.error('[cart] DB sync on mount failed:', err))
  }, [])

  // Keep localStorage in sync so display details survive page refreshes.
  useEffect(() => {
    try { localStorage.setItem('gw-cart', JSON.stringify(items)) } catch {}
  }, [items])

  // ── addToCart ───────────────────────────────────────────────────────────────
  // Optimistic: update UI immediately, write to DB in background. Adding N units
  // is a single request — the product page used to call this in a loop, firing
  // one API call per tyre.
  const addToCart = useCallback((item: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      let want = Math.max(1, Math.floor(qty))

      // Per-type order limit (8 tyres, 8 wheels): the API refuses more.
      const sameTypeElsewhere = prev
        .filter(i => i.productType === item.productType && i.id !== item.id)
        .reduce((s, i) => s + i.qty, 0)
      const allowance = maxPerOrder(item.productType) - sameTypeElsewhere - (existing?.qty ?? 0)
      if (allowance <= 0) return prev            // already at the order limit
      want = Math.min(want, allowance)

      const newQty = (existing?.qty ?? 0) + want
      dbAdd(item.id, item.productType, newQty)   // upsert to the exact quantity
      return existing
        ? prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i)
        : [...prev, { ...item, qty: newQty }]
    })
  }, [])

  // ── updateQty ───────────────────────────────────────────────────────────────
  // delta is ±1. Floor is 1 (remove button handles deletion); each type is
  // capped at its order limit (8 tyres, 8 wheels).
  const updateQty = useCallback((id: string, delta: number) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev

      let newQty = Math.max(1, item.qty + delta)
      if (delta > 0) {
        const sameTypeElsewhere = prev
          .filter(i => i.productType === item.productType && i.id !== id)
          .reduce((s, i) => s + i.qty, 0)
        newQty = Math.max(1, Math.min(newQty, maxPerOrder(item.productType) - sameTypeElsewhere))
      }
      if (newQty === item.qty) return prev       // at the cap — nothing to write

      dbUpdate(item.id, item.productType, newQty)
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i)
    })
  }, [])

  // ── removeItem ──────────────────────────────────────────────────────────────
  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id)
      if (item) dbRemove(item.id, item.productType)
      return prev.filter(i => i.id !== id)
    })
  }, [])

  // ── clearCart ───────────────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setItems([])
    dbClear()
  }, [])

  const cartCount = items.reduce((s, i) => s + i.qty,           0)
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const tyreCount = items.reduce((s, i) => s + (i.productType === 'tyre' ? i.qty : 0), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeItem, updateQty, clearCart, cartCount, cartTotal, tyreCount }}>
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
