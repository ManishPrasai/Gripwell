'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
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
    <header className="w-full transition-all duration-300" style={{ background: 'transparent' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-white font-bold uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.12em' }}
            >
              Nova Tyres
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-white/80 uppercase transition-colors duration-200"
                style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">

            <Link href="/cart" className="relative text-white/80 hover:text-white transition-colors">
              <i className="ti ti-shopping-cart" style={{ fontSize: '22px' }} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: '#E8572A', fontSize: '10px', fontWeight: 500 }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/account" className="text-white/80 hover:text-white transition-colors">
              <i className="ti ti-user-circle" style={{ fontSize: '22px' }} aria-hidden="true" />
            </Link>

            <Link
              href="/book"
              className="hidden md:flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90"
              style={{ background: '#E8572A', fontSize: '14px', fontWeight: 600 }}
            >
              <i className="ti ti-calendar" style={{ fontSize: '14px' }} aria-hidden="true" />
              Book Appointment
            </Link>

            <button
              className="md:hidden text-white/80 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <i
                className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'}
                style={{ fontSize: '22px' }}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4 space-y-1"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white/80 hover:text-white py-3 px-2 uppercase border-b transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em'
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/book"
              className="flex items-center justify-center gap-2 text-white py-3 mt-3 rounded-full"
              style={{ background: '#E8572A', fontSize: '14px', fontWeight: 600 }}
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-calendar" style={{ fontSize: '16px' }} aria-hidden="true" />
              Book Appointment
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
