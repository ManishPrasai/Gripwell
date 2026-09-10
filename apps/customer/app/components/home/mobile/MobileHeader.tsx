'use client'

import Link from 'next/link'
import { useCart } from '../../../context/CartContext'

/*
  The slim green top bar for the mobile design — NOVA wordmark + cart with a
  live count badge. Client component only for the badge; the rest is a link.
*/
export default function MobileHeader() {
  const { cartCount } = useCart()

  return (
    <header
      style={{
        background: '#076330', padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 60,
      }}
    >
      <Link href="/" style={{ color: '#FAF9F5', fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.04em', textDecoration: 'none' }}>
        NOVA TYRES
      </Link>
      <Link
        href="/cart"
        aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', background: '#FF6817', borderRadius: '8px', color: '#fff', textDecoration: 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="17.5" cy="20" r="1.4" />
        </svg>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', minWidth: '16px', height: '16px', padding: '0 3px', borderRadius: '999px',
            background: '#0D1A12', color: '#fff', fontSize: '9px', fontWeight: 700,
          }}>
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  )
}
