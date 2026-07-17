'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

/* ── Mobile bottom-sheet menu — portalled to <body>, slides up with a spring,
   drag-down or overlay-tap to dismiss. Rendered below md only. ── */
function MobileNavSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  /* Lock body scroll + Escape-to-close while the sheet is open */
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  const font = "'DM Sans', sans-serif"

  const shop = [
    { label: 'Tyres',    href: '/tyres',    icon: 'ti ti-circle-dot' },
    { label: 'Wheels',   href: '/wheels',   icon: 'ti ti-disc' },
    { label: 'Packages', href: '/packages', icon: 'ti ti-package' },
  ]
  const items = [
    { label: 'Service',   sub: 'Book & manage servicing', href: '/service',   icon: 'ti ti-tool' },
    { label: 'Locations', sub: 'Find a store near you',   href: '/service?goto=shops', icon: 'ti ti-map-pin' },
    { label: 'Warranty',  sub: 'Coverage & claims',       href: '/warranty',  icon: 'ti ti-shield-check' },
  ]

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-sheet-overlay"
          className="fixed inset-0 z-[10055] md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="nav-sheet"
          className="fixed left-0 right-0 bottom-0 z-[10060] md:hidden rounded-t-2xl border-t border-white/10"
          style={{ background: '#161616', boxShadow: '0 -20px 60px rgba(0,0,0,0.6)', maxHeight: '90svh' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 600) onClose() }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* relative wrapper gives the absolute handle a containing block without
              affecting the sheet's own fixed positioning */}
          <div className="relative">
          {/* Drag handle — absolute so it floats above content without pushing pills down */}
          <div className="absolute top-0 left-0 right-0 flex justify-center pt-2.5 pointer-events-none">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-3 gap-2.5">
              {shop.map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={onClose}
                  className="flex flex-col items-center justify-center gap-1.5 h-[66px] rounded-xl bg-white/[0.06] border border-white/10 text-white/85 active:scale-95 transition-transform"
                  style={{ fontFamily: font }}
                >
                  <i className={s.icon} style={{ fontSize: '21px' }} aria-hidden="true" />
                  <span className="text-[12.5px] font-semibold">{s.label}</span>
                </Link>
              ))}
            </div>

            {/* Primary nav links */}
            <div className="mt-5">
              {items.map(it => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onClose}
                  className="flex items-center gap-3.5 min-h-[52px] py-2 border-b border-white/[0.06] active:bg-white/[0.03] transition-colors"
                  style={{ fontFamily: font }}
                >
                  <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/80">
                    <i className={it.icon} style={{ fontSize: '18px' }} aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-white font-semibold text-[15px] leading-tight">{it.label}</span>
                    <span className="block text-white/45 text-[12px] leading-tight mt-0.5">{it.sub}</span>
                  </span>
                  <i className="ti ti-chevron-right text-white/30 flex-shrink-0" style={{ fontSize: '18px' }} aria-hidden="true" />
                </Link>
              ))}
            </div>

            {/* Book Service CTA — above the safe-area inset */}
            <Link
              href="/#booking"
              onClick={e => { scrollToBooking(e); onClose() }}
              className="mt-5 flex items-center justify-center w-full rounded-xl text-white font-bold active:scale-[0.98] transition-transform"
              style={{ background: '#E8572A', padding: '14px', fontFamily: font, fontSize: '15px', boxShadow: '0 6px 20px rgba(232,87,42,0.35)' }}
            >
              Book Service
            </Link>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)
  const { cartCount } = useCart()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  /* Hysteresis prevents oscillation near the threshold on mobile inertial scroll:
     arm at 80px scrolling down, disarm at 36px scrolling up. */
  const scrolledRef = useRef(false)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const wasScrolled = scrolledRef.current
      const next = wasScrolled ? y > 36 : y > 80
      if (next !== wasScrolled) {
        scrolledRef.current = next
        setScrolled(next)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const links = [
    { label: 'Home',        href: '/' },
    { label: 'Find Tyres',  href: '/tyres' },
    { label: 'Find Wheels', href: '/wheels' },
    { label: 'Service',     href: '/service' },
    { label: 'Locations',   href: '/service?goto=shops' },
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
        paddingTop:            0,
        background:           scrolled ? 'rgba(8,8,8,0.92)' : 'rgba(0,0,0,0.15)',
        backdropFilter:       'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom:         scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        boxShadow:            scrolled ? '0 4px 32px rgba(0,0,0,0.32)' : 'none',
        transition:           'background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
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
            style={{ transform: scrolled && !isMobile ? 'translateX(24px)' : 'translateX(0)', transition: ANIM }}
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
            style={{ transform: scrolled && !isMobile ? 'translateX(-24px)' : 'translateX(0)', transition: ANIM }}
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
                aria-expanded={menuOpen}
                style={{
                  width:          '32px',
                  height:         '32px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  background:     'rgba(255,255,255,0.08)',
                  border:         '1px solid rgba(255,255,255,0.18)',
                  borderRadius:   '9px',
                  cursor:         'pointer',
                  color:          '#fff',
                }}
              >
                <i className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'} style={{ fontSize: '20px', color: '#fff' }} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile bottom sheet — replaces the old dropdown (below md only) ── */}
        <MobileNavSheet open={menuOpen} onClose={closeMenu} />
        </div>
      </nav>
    </header>
  )
}
