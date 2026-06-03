'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'

const heroPill: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: [
    'inset 0 .5px 0 rgba(255,255,255,0.14)',
    'inset 0 -1px 0 rgba(255,255,255,0.08)',
    'inset 1px 0 0 rgba(255,255,255,0.1)',
    'inset -1px 0 0 rgba(255,255,255,0.1)',
    '0 8px 40px rgba(0,0,0,0.22)',
  ].join(', '),
  borderRadius: '19px',
  height: '57px',
}

const scrolledPill: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  borderRadius: '19px',
  height: '57px',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
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
        paddingTop: scrolled ? '0' : '18px',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        transition: 'background 0.35s ease, box-shadow 0.35s ease, padding-top 0.35s ease, border-color 0.35s ease',
      }}
    >
      <nav className="w-full px-6 sm:px-10">
        <div className="flex items-center h-16">

          {/* Left — Logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center flex-shrink-0">
              <span
                className="text-white"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '30px',
                  lineHeight: '39px',
                  letterSpacing: '0.12em',
                  textShadow: scrolled ? 'none' : '0px 4px 4px rgba(0,0,0,0.35)',
                  transition: 'text-shadow 0.35s ease',
                }}
              >
                NOVA TYRES
              </span>
            </Link>
          </div>

          {/* Center — nav pill (hero) / flat links (scrolled) */}
          <div
            className="hidden md:flex items-center gap-7 px-8"
            style={scrolled ? scrolledPill : heroPill}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-white/70 uppercase transition-colors duration-200"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right — cart, profile, mobile toggle */}
          <div className="flex-1 flex items-center justify-end gap-5">
            <Link href="/cart" className="relative text-white hover:text-white/70 transition-colors">
              <i className="ti ti-shopping-cart" style={{ fontSize: '36px' }} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: '#E8572A', fontSize: '10px', fontWeight: 500 }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/account" className="text-white hover:text-white/70 transition-colors">
              <i className="ti ti-user-circle" style={{ fontSize: '36px' }} aria-hidden="true" />
            </Link>

            <button
              className="md:hidden text-white hover:text-white/70 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <i
                className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'}
                style={{ fontSize: '24px' }}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4 space-y-1 mt-1"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white/80 hover:text-white py-3 px-2 uppercase border-b transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
