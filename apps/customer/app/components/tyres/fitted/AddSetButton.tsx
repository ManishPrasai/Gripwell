'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart, type CartItem } from '@/app/context/CartContext'
import s from './FittedResults.module.css'

export interface StoreRecord {
  id: string; name: string; address: string; suburb: string; state: string; postcode: string; phone: string
}

/* Adds the set and carries the chosen branch to the basket's store picker. */
export default function AddSetButton({ item, qty, store }: {
  item:  Omit<CartItem, 'qty'>
  qty:   number
  store: StoreRecord | null
}) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function add() {
    if (added) return               // aria-disabled, not disabled: focus stays on the button
    addToCart(item, qty)
    if (store) {
      try { localStorage.setItem('gw_selected_store', JSON.stringify(store)) } catch {}
    }
    setAdded(true)
  }

  return (
    <div className={s.addWrap}>
      <button type="button" className={s.add} onClick={add} aria-disabled={added}>
        {added ? `${qty} in your basket` : `Add ${qty} to basket`}
      </button>
      {added && <Link href="/cart" className={s.toCart}>Go to basket</Link>}
    </div>
  )
}
