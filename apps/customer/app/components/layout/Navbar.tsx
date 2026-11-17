'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../../context/CartContext'
import { STORE_NETWORK_LABEL } from '../../../lib/stores'
import { smoothScrollToSection } from '../../../lib/scrollToSection'

/* Contact details surface in three places (strip, mobile bar, WhatsApp),
   so they live here once rather than being retyped per component. */
export const NOVA_PHONE      = '0402 338 805'
export const NOVA_PHONE_HREF = `tel:${NOVA_PHONE.replace(/\s/g, '')}`
export const NOVA_WA_HREF    = 'https://wa.me/61402338805'

/* `scrollTo` links (just "Locations" for now) scroll in place when the user
   is already on that link's page — a plain Link navigation there would still
   "work" (same URL), but Next.js scrolls to top on navigation by default,
   and the target page's own goto-param effect only runs on mount, so it
   would jump to the hero and stay there instead of moving to the section. */
const LINKS: { label: string; href: string; page: string; scrollTo?: string }[] = [
  { label: 'Home',        href: '/',                      page: '/' },
  { label: 'Find Tyres',  href: '/tyres',                  page: '/tyres' },
  { label: 'Find Wheels', href: '/wheels',                 page: '/wheels' },
  { label: 'Service',     href: '/service',                page: '/service' },
  { label: 'Locations',   href: '/service?goto=shops',     page: '/service', scrollTo: 'shops-head' },
  { label: 'Warranty',    href: '/warranty',                page: '/warranty' },
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

function SearchIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

interface SearchResult { id: string; name: string; slug: string; image: string | null }
interface TyreApiRow {
  id: string; brand: string; model: string; slug: string
  images: { url: string }[]
}

/* No search index behind this — a substring match against brand/model via
   the same `q` param /tyres/results now honours, good enough for a live
   dropdown of a handful of matches. */
function mapSearchResult(t: TyreApiRow): SearchResult {
  return { id: t.id, name: `${t.brand} ${t.model}`, slug: t.slug, image: t.images?.[0]?.url ?? null }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { cartCount } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  /* Route change closes the sheet — otherwise the menu stays open behind
     the new page after a nav tap. */
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])

  /* Escape closes, and body scroll locks while the compact menu is down */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  /* Same treatment for the search overlay, plus a body-scroll lock — this
     one covers the full viewport, unlike the compact dropdown. */
  useEffect(() => {
    if (!searchOpen) { setQuery(''); return }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    searchInputRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [searchOpen])

  /* "/#locations" is a same-page anchor on home but a cross-page link
     elsewhere — compare only the path part so Home doesn't light up for it. */
  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  /* Already on a `scrollTo` link's page: scroll in place instead of letting
     Link navigate (see LINKS comment for why a plain navigation breaks this). */
  function handleNavClick(link: typeof LINKS[number], e: React.MouseEvent) {
    if (link.scrollTo && pathname === link.page) {
      e.preventDefault()
      smoothScrollToSection(link.scrollTo, { offset: 96 })
      setMenuOpen(false)
    }
  }

  /* Free text: a numeric size-shaped query goes straight to a size search —
     the full "225/45R17", or a partial "225/45" or a bare width like "275"
     (someone typing a width they know without profile/rim yet) — used by
     both the live dropdown below and Enter/"See all" here. Anything else
     falls back to /tyres' brand/model substring+typo match — no real search
     index behind that second path, so it's the honest capability rather
     than a fake box. */
  function parseSize(raw: string): { width?: string; profile?: string; rim?: string } | null {
    const q = raw.replace(/\s/g, '')
    let m = q.match(/^(\d{3})\/(\d{2})R(\d{2})$/i)
    if (m) return { width: m[1], profile: m[2], rim: m[3] }
    m = q.match(/^(\d{3})\/(\d{2})$/)
    if (m) return { width: m[1], profile: m[2] }
    m = q.match(/^(\d{3})$/)
    if (m) return { width: m[1] }
    return null
  }

  function sizeParams(size: { width?: string; profile?: string; rim?: string }): string {
    const params = new URLSearchParams()
    if (size.width)   params.set('width', size.width)
    if (size.profile) params.set('profile', size.profile)
    if (size.rim)     params.set('rim', size.rim)
    return params.toString()
  }

  function sizeOrTextHref(q: string): string {
    const size = parseSize(q)
    return size
      ? `/tyres/results?${sizeParams(size)}`
      : `/tyres/results?q=${encodeURIComponent(q)}`
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(sizeOrTextHref(q))
  }

  /* Live dropdown. Three things keep this cheap on the server while still
     feeling instant on screen:
       - a per-session cache, so re-typing (or backspacing back to) a query
         you already searched is a synchronous cache hit, not a request;
       - a 2-character floor, so the least useful, highest-volume queries
         (single letters) never hit the network at all;
       - a short debounce (the query is now pg_trgm-indexed, so 150ms is
         plenty of margin) plus AbortController, so a slow response to an
         old keystroke can never race past a newer one. */
  const searchCache = useRef(new Map<string, { results: SearchResult[]; resultCount: number }>())
  const abortRef     = useRef<AbortController | null>(null)
  const [results, setResults]         = useState<SearchResult[]>([])
  const [resultCount, setResultCount] = useState(0)
  const [searching, setSearching]     = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!searchOpen || q.length < 2) {
      abortRef.current?.abort()
      setResults([]); setResultCount(0); setSearching(false)
      return
    }

    const key = q.toLowerCase()
    const cached = searchCache.current.get(key)
    if (cached) {
      setResults(cached.results); setResultCount(cached.resultCount); setSearching(false)
      return
    }

    setSearching(true)
    const t = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const size = parseSize(q)
      const url  = size
        ? `/api/tyres?${sizeParams(size)}&limit=5`
        : `/api/tyres?q=${encodeURIComponent(q)}&limit=5`
      fetch(url, { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          const mapped = { results: Array.isArray(data.tyres) ? data.tyres.map(mapSearchResult) : [], resultCount: data.pagination?.total ?? 0 }
          searchCache.current.set(key, mapped)
          setResults(mapped.results); setResultCount(mapped.resultCount)
        })
        .catch(err => { if (err.name !== 'AbortError') { setResults([]); setResultCount(0) } })
        .finally(() => setSearching(false))
    }, 150)
    return () => clearTimeout(t)
  }, [query, searchOpen])

  const hasQuery      = query.trim().length >= 2
  const showResults   = hasQuery && !searching && results.length > 0
  const showNoMatches = hasQuery && !searching && results.length === 0

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
        /* Search overlay hover/focus states */
        .nv-ov-close:hover     { color: #E8572A; }
        .nv-ov-input:focus-within { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.15); }
        .nv-result-row:hover   { background: #FAF9F5; }
      `}</style>

      {/* ── Announcement strip ── */}
      <div
        style={{
          background: '#054d25', color: '#CFE5D8', fontSize: '13px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '8px', flexWrap: 'wrap', padding: '9px 16px', textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>Fitting, balancing &amp; new valves <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>included</strong> at every store</span>
        <span style={{ color: 'rgba(207,229,216,0.55)' }}>·</span>
        <span>{STORE_NETWORK_LABEL}</span>
        <span style={{ color: 'rgba(207,229,216,0.55)' }}>·</span>
        <span>Call <a href={NOVA_PHONE_HREF} style={{ color: '#FFB07A', fontWeight: 700, textDecoration: 'none' }}>{NOVA_PHONE}</a></span>
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
                  onClick={e => handleNavClick(link, e)}
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
            <button
              onClick={() => setSearchOpen(true)} aria-label="Search" className="nv-search-icon"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '38px', height: '38px', border: 'none', background: 'transparent',
                color: '#FAF9F5', cursor: 'pointer', borderRadius: '8px', transition: 'color .2s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = '#FFB07A')}
              onMouseOut={e  => (e.currentTarget.style.color = '#FAF9F5')}
            >
              <SearchIcon />
            </button>
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
                background: '#E8572A', color: '#fff', textDecoration: 'none',
                borderRadius: '8px', padding: '11px 17px', fontSize: '12.5px',
                fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                transition: 'transform .18s cubic-bezier(.22,1,.36,1), background .2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#FF6817' }}
              onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#E8572A' }}
            >
              <CartIcon />
              Cart
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '19px', height: '19px', padding: '0 5px', borderRadius: '999px',
                background: 'rgba(0,0,0,0.25)', fontSize: '11px', lineHeight: 1,
              }}>
                {cartCount}
              </span>
            </Link>
          </div>

          {/* ── Compact: cart + hamburger — "My account" / "Sign in" live in
              the hamburger dropdown below, so a third icon here would just
              duplicate it while eating width the wordmark needs. ── */}
          <div className="nv-nav-compact" style={{ alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSearchOpen(true)} aria-label="Search" className="nv-search-icon"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', border: 'none', background: 'transparent',
                color: '#FAF9F5', cursor: 'pointer', borderRadius: '8px',
              }}
            >
              <SearchIcon />
            </button>
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
                onClick={e => handleNavClick(link, e)}
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

      {/* ── Search overlay ── scrim fades in, panel pops + settles. */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(13,26,18,0.72)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: 'min(14vh,140px) 20px 40px',
            animation: 'nv-fade-in .18s ease both',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '900px', background: '#fff', borderRadius: '16px',
              padding: '28px 28px 24px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
              fontFamily: "'DM Sans', sans-serif",
              animation: 'nv-modal-pop .22s cubic-bezier(.22,1,.36,1) both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', color: '#6E7C74', textTransform: 'uppercase' }}>
                Search
              </span>
              <button
                onClick={() => setSearchOpen(false)} aria-label="Close" className="nv-ov-close"
                style={{ border: 'none', background: 'transparent', color: '#16211B', cursor: 'pointer', display: 'inline-flex', padding: '4px', transition: 'color .2s' }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitSearch} className="nv-ov-input"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #E7E5DE', borderRadius: '10px', padding: '14px 16px', transition: 'border-color .2s, box-shadow .2s' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8572A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search tyres, wheels, sizes, brands…"
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '17px', color: '#16211B', background: 'transparent' }}
              />
            </form>

            {showResults && (
              <div style={{ marginTop: '14px', animation: 'novaIn .22s ease both' }}>
                {results.map((r, i) => (
                  <Link key={r.id} href={`/tyres/${r.slug}`} onClick={() => setSearchOpen(false)}
                    className="nv-result-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 4px',
                      textDecoration: 'none', borderBottom: '1px solid #F0EFE9',
                      animation: 'novaIn .28s cubic-bezier(.22,1,.36,1) both', animationDelay: `${i * 35}ms`,
                    }}
                  >
                    <span style={{
                      width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                      background: r.image ? `url(${r.image}) center/contain no-repeat #F0EFE9`
                        : 'repeating-linear-gradient(45deg,#F0EFE9,#F0EFE9 5px,#E7E5DE 5px,#E7E5DE 10px)',
                    }} />
                    <span style={{ flex: 1, fontSize: '14px', color: '#16211B', fontWeight: 500 }}>{r.name}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9DB0A5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                ))}
                <Link href={sizeOrTextHref(query.trim())} onClick={() => setSearchOpen(false)}
                  style={{ display: 'block', margin: '14px 0 0', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#076330', textDecoration: 'none', cursor: 'pointer' }}
                >
                  See all {resultCount} results →
                </Link>
              </div>
            )}

            {showNoMatches && (
              <div style={{ marginTop: '20px', padding: '16px 4px 4px', textAlign: 'center', color: '#6E7C74', fontSize: '13px', animation: 'novaIn .22s ease both' }}>
                No matches for &quot;{query.trim()}&quot;
              </div>
            )}

            <p style={{ margin: '18px 0 0', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '10.5px', color: '#9DB0A5' }}>
              Press Esc to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
