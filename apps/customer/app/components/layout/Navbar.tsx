'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'

const heroPill: React.CSSProperties = {
  background:           'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
  backdropFilter:       'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border:               '1px solid rgba(255,255,255,0.12)',
  boxShadow:            [
    'inset 0 .5px 0 rgba(255,255,255,0.14)',
    'inset 0 -1px 0 rgba(255,255,255,0.08)',
    'inset 1px 0 0 rgba(255,255,255,0.1)',
    'inset -1px 0 0 rgba(255,255,255,0.1)',
    '0 8px 40px rgba(0,0,0,0.22)',
  ].join(', '),
  borderRadius: '50px',
  padding:      '12px 28px',
}

const scrolledPill: React.CSSProperties = {
  background:   'transparent',
  border:       'none',
  boxShadow:    'none',
  borderRadius: '50px',
  padding:      '12px 28px',
}

const ANIM = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)'

function scrollToBooking(e: React.MouseEvent<HTMLAnchorElement>) {
  if (window.location.pathname !== '/') return
  e.preventDefault()
  const el = document.getElementById('booking')
  if (!el) return
  const navH      = 64
  const vpH       = window.innerHeight
  const sectionH  = el.getBoundingClientRect().height
  const available = vpH - navH
  const centering = Math.max(0, (available - sectionH) / 2)
  const offset    = navH + centering
  const targetY   = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' })
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const { cartCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Home',        href: '/' },
    { label: 'Find Tyres',  href: '/tyres' },
    { label: 'Find Wheels', href: '/wheels' },
    { label: 'Service',     href: '/service' },
    { label: 'Locations',   href: '/locations' },
    { label: 'Warranty',    href: '/warranty' },
  ]

  return (
    <header
      className="w-full"
      style={{
        position:             'fixed',
        top:                   0,
        left:                  0,
        zIndex:                9999,
        paddingTop:            scrolled ? '0' : '10px',
        background:           scrolled ? 'rgba(8,8,8,0.92)' : 'rgba(0,0,0,0.15)',
        backdropFilter:       'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom:         scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        boxShadow:            scrolled ? '0 4px 32px rgba(0,0,0,0.32)' : 'none',
        transition:           'background 0.35s ease, box-shadow 0.35s ease, padding-top 0.35s ease, border-color 0.35s ease',
      }}
    >
      <nav className="w-full">
        {/* Core Page Container — w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
            Locks the nav row to the same 1280px content boundary used across
            the Hero and Best Deals sections, so logo/menu/cart stay aligned
            with page content on every viewport from laptop to ultrawide. */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center" style={{ height: '64px' }}>

          {/* ── Logo — slides right toward pill on scroll ── */}
          <div
            className="flex-1 flex items-center"
            style={{ transform: scrolled ? 'translateX(24px)' : 'translateX(0)', transition: ANIM }}
          >
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily:    "'DM Sans', sans-serif",
                fontStyle:     'italic',
                fontWeight:     700,
                fontSize:      '28px',
                color:         '#ffffff',
                letterSpacing: '0.12em',
                whiteSpace:    'nowrap',
                textShadow:    scrolled ? 'none' : '0px 4px 4px rgba(0,0,0,0.35)',
                transition:    'text-shadow 0.35s ease',
              }}>
                NOVA TYRES
              </span>
            </Link>
          </div>

          {/* ── Center pill — desktop only ── */}
          <div
            className="hidden md:flex items-center"
            style={{ ...(scrolled ? scrolledPill : heroPill), gap: '22px' }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold tracking-wide text-neutral-300 hover:text-[#FF5A1F] transition-colors duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', whiteSpace: 'nowrap', textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right utilities — slides left toward pill on scroll ── */}
          <div
            className="flex-1 flex items-center justify-end gap-4"
            style={{ transform: scrolled ? 'translateX(-24px)' : 'translateX(0)', transition: ANIM }}
          >
            {/* Cart */}
            <Link href="/cart" className="relative text-white hover:text-white/70 transition-colors">
              <i className="ti ti-shopping-cart" style={{ fontSize: '28px' }} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white rounded-full flex items-center justify-center"
                  style={{ background: '#E8572A', fontSize: '9px', fontWeight: 700, width: '16px', height: '16px', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link href="/account" className="text-white hover:text-white/70 transition-colors">
              <i className="ti ti-user-circle" style={{ fontSize: '28px' }} aria-hidden="true" />
            </Link>

            {/* Book Service — desktop only */}
            <Link
              href="/#booking"
              onClick={scrollToBooking}
              className="hidden md:inline-flex items-center"
              style={{
                background:    '#E8572A',
                color:         '#fff',
                fontFamily:    "'DM Sans', sans-serif",
                fontWeight:     700,
                fontSize:      '13px',
                letterSpacing: '0.04em',
                padding:       '9px 18px',
                borderRadius:  '50px',
                textDecoration:'none',
                whiteSpace:    'nowrap',
                boxShadow:     '0 2px 12px rgba(232,87,42,0.4)',
                transition:    'opacity 0.2s ease',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
            >
              Book Service
            </Link>

            {/* Hamburger — strictly mobile only */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
              >
                <i className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'} style={{ fontSize: '24px', color: '#fff' }} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile dropdown — only renders below md breakpoint ── */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4 mt-1"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white/80 hover:text-white py-3 px-2 uppercase border-b transition-colors"
                style={{
                  borderColor:   'rgba(255,255,255,0.07)',
                  fontFamily:    "'DM Sans', sans-serif",
                  fontSize:      '14px',
                  fontWeight:     600,
                  letterSpacing: '0.06em',
                  textDecoration:'none',
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#booking"
              onClick={e => { scrollToBooking(e); setMenuOpen(false) }}
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                marginTop:     '12px',
                background:    '#E8572A',
                color:         '#fff',
                fontFamily:    "'DM Sans', sans-serif",
                fontWeight:     700,
                fontSize:      '14px',
                padding:       '10px 22px',
                borderRadius:  '50px',
                textDecoration:'none',
              }}
            >
              Book Service
            </Link>
          </div>
        )}
        </div>
      </nav>
    </header>
  )
}
