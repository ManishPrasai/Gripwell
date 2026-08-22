'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../context/CartContext'
import { STORE_NETWORK_LABEL } from '../../../lib/stores'

/* Contact details surface in three places (strip, mobile bar, WhatsApp),
   so they live here once rather than being retyped per component. */
export const NOVA_PHONE      = '1300 66 82 89'
export const NOVA_PHONE_HREF = `tel:${NOVA_PHONE.replace(/\s/g, '')}`
export const NOVA_WA_HREF    = 'https://wa.me/611300668289'

const LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/#locations' },
  { label: 'Warranty',    href: '/warranty' },
]

function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount } = useCart()
  const pathname = usePathname()

  /* Route change closes the sheet — otherwise the menu stays open behind
     the new page after a nav tap. */
  useEffect(() => { setMenuOpen(false) }, [pathname])

  /* Escape closes, and body scroll locks while the compact menu is down */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  /* "/#locations" is a same-page anchor on home but a cross-page link
     elsewhere — compare only the path part so Home doesn't light up for it. */
  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/*
        Breakpoint is 1060px, not a Tailwind default: below it the six nav
        links plus Sign in and Cart stop fitting on one 66px row. Driven by
        CSS media queries rather than matchMedia so the correct layout is in
        the very first server-rendered paint — no flash of the wrong nav.
      */}
      <style>{`
        .nv-nav-wide   { display: flex; }
        .nv-nav-compact{ display: none; }
        @media (max-width: 1060px) {
          .nv-nav-wide   { display: none; }
          .nv-nav-compact{ display: flex; }
        }
        /* Below 1060px the wordmark keeps its desktop 21px height — at
           that height the 1600x123 asset renders ~273px wide, which is
           wider than a phone screen has left over once the icon cluster
           sits next to it. Below 480px it switches to scaling by width
           instead, so it shrinks with the viewport rather than pushing
           the icons off-screen. */
        .nv-logo-img { height: 21px; width: auto; }
        @media (max-width: 480px) {
          .nv-logo-img { height: auto; width: clamp(108px, 38vw, 180px); }
        }
      `}</style>

      {/* ── Announcement strip ── */}
      <div
        style={{
          background: '#04331B', color: '#CFE5D8', fontSize: '13px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '8px', flexWrap: 'wrap', padding: '9px 16px', textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>Fitting, balancing &amp; new valves <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>included</strong> at every store</span>
        <span style={{ color: 'rgba(207,229,216,0.55)' }}>·</span>
        <span>{STORE_NETWORK_LABEL}</span>
        <span style={{ color: 'rgba(207,229,216,0.55)' }}>·</span>
        <span>Call <a href={NOVA_PHONE_HREF} style={{ color: '#FF8A5C', fontWeight: 700, textDecoration: 'none' }}>{NOVA_PHONE}</a></span>
      </div>

      {/* ── Sticky green header ── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 60,
          background: '#076330', boxShadow: '0 2px 12px rgba(13,26,18,0.25)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', height: '66px',
          }}
        >
          <Link href="/" aria-label="Nova Tyres home"
            style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/nova-wordmark-light.png" alt="Nova Tyres"
              className="nv-logo-img" style={{ display: 'block' }} />
          </Link>

          {/* ── Wide: full link row ── */}
          <nav className="nv-nav-wide" style={{ alignItems: 'center', gap: 0, flexShrink: 0 }}>
            {LINKS.map(link => {
              const active = isActive(link.href)
              return (
                <Link key={link.href} href={link.href}
                  className="nv-navlink"
                  style={{
                    color: active ? '#FFB07A' : '#FAF9F5', textDecoration: 'none',
                    fontSize: '13.5px', fontWeight: active ? 700 : 600,
                    padding: '22px 11px', whiteSpace: 'nowrap', transition: 'color .2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#FFB07A')}
                  onMouseOut={e => (e.currentTarget.style.color = active ? '#FFB07A' : '#FAF9F5')}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="nv-nav-wide" style={{ alignItems: 'center', gap: '10px' }}>
            {/* Straight to the dashboard. /account guards itself — a signed-out
                visitor is bounced to /login?from=/account and lands back here. */}
            <Link href="/account" aria-label="My account"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#FAF9F5', textDecoration: 'none',
                border: '1.5px solid rgba(250,249,245,0.35)', borderRadius: '8px',
                padding: '10px 15px', whiteSpace: 'nowrap', transition: 'border-color .2s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#E8572A')}
              onMouseOut={e  => (e.currentTarget.style.borderColor = 'rgba(250,249,245,0.35)')}
            >
              <UserIcon />
              Account
            </Link>
            <Link href="/cart"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '9px',
                background: '#FF6817', color: '#fff', textDecoration: 'none',
                borderRadius: '8px', padding: '11px 17px', fontSize: '12.5px',
                fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                transition: 'transform .18s cubic-bezier(.22,1,.36,1)',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e  => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CartIcon />
              Cart
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '19px', height: '19px', padding: '0 5px', borderRadius: '999px',
                background: 'rgba(13,26,18,0.35)', fontSize: '11px', lineHeight: 1,
              }}>
                {cartCount}
              </span>
            </Link>
          </div>

          {/* ── Compact: cart + hamburger — "My account" / "Sign in" live in
              the hamburger dropdown below, so a third icon here would just
              duplicate it while eating width the wordmark needs. ── */}
          <div className="nv-nav-compact" style={{ alignItems: 'center', gap: '8px' }}>
            <Link href="/cart" aria-label="Cart"
              style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', width: '44px', height: '44px',
                background: '#FF6817', borderRadius: '8px', color: '#fff', textDecoration: 'none',
              }}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '19px', height: '19px', padding: '0 5px', borderRadius: '999px',
                  background: '#0D1A12', color: '#fff', fontSize: '11px', fontWeight: 700, lineHeight: 1,
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu" aria-expanded={menuOpen}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', background: 'rgba(250,249,245,0.12)',
                border: 'none', borderRadius: '8px', color: '#FAF9F5', cursor: 'pointer',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen
                  ? <path d="M6 6l12 12M18 6L6 18" />
                  : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Compact dropdown ── */}
        {menuOpen && (
          <nav
            className="nv-nav-compact"
            style={{
              background: '#076330', borderTop: '1px solid rgba(250,249,245,0.12)',
              padding: '10px clamp(16px,4vw,40px) 18px',
              flexDirection: 'column', gap: '2px', animation: 'novaIn .25s ease both',
            }}
          >
            {LINKS.map(link => (
              <Link key={link.href} href={link.href}
                style={{
                  color: isActive(link.href) ? '#FFB07A' : '#FAF9F5', textDecoration: 'none',
                  fontSize: '15px', fontWeight: 700, padding: '13px 4px',
                  borderBottom: '1px solid rgba(250,249,245,0.12)',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/account"
              style={{ color: '#FAF9F5', textDecoration: 'none', fontSize: '15px', fontWeight: 700, padding: '13px 4px', borderBottom: '1px solid rgba(250,249,245,0.12)' }}>
              My account
            </Link>
            <Link href="/login"
              style={{ color: '#FAF9F5', textDecoration: 'none', fontSize: '15px', fontWeight: 700, padding: '13px 4px' }}>
              Sign in
            </Link>
          </nav>
        )}
      </header>
    </>
  )
}
