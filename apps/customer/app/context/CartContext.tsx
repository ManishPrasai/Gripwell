'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

/* ── Cart item shape ─────────────────────────────────────────────────────── */
export interface CartItem {
  id:          string   // slug (unique per product)
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

/* ── Context value ───────────────────────────────────────────────────────── */
interface CartCtx {
  items:       CartItem[]
  addToCart:   (item: Omit<CartItem, 'qty'>) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, delta: number) => void
  clearCart:   () => void
  cartCount:   number
  cartTotal:   number
}

const CartContext = createContext<CartCtx | null>(null)

/* ── Provider ────────────────────────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  /* Hydrate from localStorage once on client */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nova-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  /* Persist every change */
  useEffect(() => {
    try { localStorage.setItem('nova-cart', JSON.stringify(items)) } catch {}
  }, [items])

  const addToCart = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = items.reduce((s, i) => s + i.qty, 0)
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeItem, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
