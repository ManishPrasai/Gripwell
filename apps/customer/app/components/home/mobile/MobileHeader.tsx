'use client'

import Link from 'next/link'
import { useCart } from '../../../context/CartContext'

/*
  The slim dark top bar for the mobile design — Gripwell wordmark + cart with a
  live count badge. Client component only for the badge; the rest is a link.
*/
export default function MobileHeader() {
  const { cartCount } = useCart()

  return (
    <header
      style={{
        background: '#2A2E36', padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 60,
      }}
    >
      <Link href="/" aria-label="Gripwell home" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-horizontal-reversed.svg" alt="Gripwell" style={{ height: '22px', width: 'auto', display: 'block' }} />
      </Link>
      <Link
        href="/cart"
        aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', background: '#FF6A1A', borderRadius: '8px', color: '#fff', textDecoration: 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="17.5" cy="20" r="1.4" />
        </svg>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', minWidth: '16px', height: '16px', padding: '0 3px', borderRadius: '999px',
            background: '#1A1D23', color: '#fff', fontSize: '9px', fontWeight: 700,
          }}>
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  )
}
