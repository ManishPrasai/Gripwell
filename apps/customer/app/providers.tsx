'use client'

import { CartProvider } from './context/CartContext'
import { ReactNode } from 'react'
import RevealManager from './components/ux/RevealManager'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <RevealManager />
      {children}
    </CartProvider>
  )
}
