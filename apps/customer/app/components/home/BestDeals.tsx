'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ─── Brand logo map ──────────────────────────────────────────────────────── */
const BRAND_LOGOS: Record<string, string> = {
  'continental':  '/images/brands/continental.svg',
  'hankook':      '/images/brands/hankook.svg',
  'pirelli':      '/images/brands/pirelli.svg',
  'maxxis':       '/images/brands/maxxis.svg',
  'yokohama':     '/images/brands/yokohama.svg',
  'bridgestone':  '/images/brands/bridgestone.svg',
  'michelin':     '/images/brands/michelin.svg',
  'bf goodrich':  '/images/brands/bfgoodrich.svg',
  'bfgoodrich':   '/images/brands/bfgoodrich.svg',
  'black rhino':  '/images/brands/Black Rino.svg',
  'roh':          '/images/brands/roh.svg',
  'king wheels':  '/images/brands/king-wheels.svg',
  'sonix':        '/images/brands/sonix.svg',
  'nitto':        '/images/brands/nitto.svg',
  'atlander':     '/images/brands/atlander.svg',
}

/* Brands without artwork fall back to a Bebas wordmark chip rather than a
   wrong logo — the design supports both chip variants. */
function brandLogoFor(brand: string): string | null {
  return BRAND_LOGOS[brand.toLowerCase()] ?? null
}

/* ─── Shared card shape ───────────────────────────────────────────────────── */
interface Deal {
  id:        string
  brand:     string
  brandLogo: string | null
  model:     string
  size:      string
  spec:      string
  price:     number
  was:       number | null
  slug:      string
  image:     string
  tab:       'tyres' | 'wheels'
}

/* ─── API response types ──────────────────────────────────────────────────── */
interface TyreItem {
  id: string; brand: string; model: string; slug: string
  price: string | number
  compareAtPrice: string | number | null
  tyreSize: { width: number; profile: number; rimDiameter: number; loadIndex: number | null; speedRating: string | null }
  images: { url: string; altText: string | null }[]
}

interface WheelItem {
  id: string; brand: string; model: string; slug: string
  price: string | number
  compareAtPrice: string | number | null
  diameter: number; width: string | number; pcd: string
  images: { url: string; altText: string | null }[]
}

/* A deal is "on sale" only when the compare price is genuinely higher —
   same rule the tyre collection grid uses, so badges agree across the site. */
function wasPrice(price: string | number, compareAt: string | number | null): number | null {
  if (compareAt == null) return null
  const was = parseFloat(String(compareAt))
  return was > parseFloat(String(price)) ? was : null
}

function mapTyre(t: TyreItem): Deal {
  const { width, profile, rimDiameter, loadIndex, speedRating } = t.tyreSize
  return {
    tab:       'tyres',
    id:        t.slug,
    brand:     t.brand,
    brandLogo: brandLogoFor(t.brand),
    model:     t.model,
    size:      `${width}/${profile}R${rimDiameter}`,
    spec:      loadIndex && speedRating ? `${loadIndex}${speedRating}` : speedRating ?? '',
    price:     parseFloat(String(t.price)),
    was:       wasPrice(t.price, t.compareAtPrice),
    slug:      `/tyres/${t.slug}`,
    image:     t.images[0]?.url ?? '/images/tyres/tyre-passenger.png',
  }
}

function mapWheel(w: WheelItem): Deal {
  return {
    tab:       'wheels',
    id:        w.slug,
    brand:     w.brand,
    brandLogo: brandLogoFor(w.brand),
    model:     w.model,
    size:      `${w.diameter} × ${parseFloat(String(w.width)).toFixed(1)}`,
    spec:      w.pcd,
    price:     parseFloat(String(w.price)),
    was:       wasPrice(w.price, w.compareAtPrice),
    slug:      `/wheels/${w.slug}`,
    image:     w.images[0]?.url ?? '/images/wheels/king-kt5.png',
  }
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #DEDCD4', borderRadius: '18px', padding: '22px', height: '420px' }}>
      <div style={{ height: '180px', background: '#F0EFE9', borderRadius: '10px', marginBottom: '18px' }} />
      <div style={{ width: '120px', height: '34px', background: '#F0EFE9', borderRadius: '8px', marginBottom: '14px' }} />
      <div style={{ width: '70%', height: '19px', background: '#F0EFE9', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ width: '45%', height: '14px', background: '#F0EFE9', borderRadius: '4px' }} />
    </div>
  )
}

/* ─── Card ────────────────────────────────────────────────────────────────── */
function DealCard({ deal, unit }: { deal: Deal; unit: string }) {
  const { addToCart } = useCart()
  const [hovered, setHovered] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  /* The whole card is a Link, so the Add control has to cancel navigation
     before it can put the item in the cart. */
  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: deal.id, productType: deal.tab === 'tyres' ? 'tyre' : 'wheel',
      brand: deal.brand, brandLogo: deal.brandLogo ?? '', model: deal.model,
      size: deal.size, spec: deal.spec, price: deal.price, image: deal.image,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <Link
      href={deal.slug}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column',
        background: '#FFFFFF', border: `1px solid ${hovered ? '#C9C7BE' : '#DEDCD4'}`,
        borderRadius: '18px', padding: '22px', textDecoration: 'none', color: '#16211B',
        boxShadow: hovered
          ? '0 6px 10px rgba(20,25,22,0.08), 0 26px 50px -22px rgba(20,25,22,0.34)'
          : '0 4px 6px rgba(20,25,22,0.06), 0 10px 24px -14px rgba(20,25,22,0.14)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .22s',
      }}
    >
      {deal.was != null && (
        <span style={{
          position: 'absolute', top: 0, right: 0, background: '#E8572A', color: '#fff',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          padding: '6px 14px', borderRadius: '0 18px 0 12px', zIndex: 1,
        }}>
          SALE
        </span>
      )}

      <span style={{ position: 'relative', display: 'block', height: '180px', marginBottom: '18px' }}>
        <Image
          src={deal.image}
          alt={`${deal.brand} ${deal.model}`}
          fill
          sizes="(max-width: 780px) 90vw, (max-width: 1100px) 45vw, 260px"
          style={{ objectFit: 'contain' }}
        />
      </span>

      {/* Brand chip — artwork when we have it, wordmark when we don't */}
      {deal.brandLogo ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-start', border: '1px solid #E7E5DE', borderRadius: '8px',
          height: '34px', minWidth: '120px', padding: '0 14px', marginBottom: '14px', background: '#FFFFFF',
        }}>
          <Image src={deal.brandLogo} alt={deal.brand} width={96} height={14}
            style={{ objectFit: 'contain', width: '96px', height: '14px' }} />
        </span>
      ) : (
        <span style={{
          display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
          border: '1px solid #E7E5DE', borderRadius: '8px', height: '34px',
          padding: '0 14px', marginBottom: '14px', background: '#FFFFFF',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px',
          letterSpacing: '0.08em', color: '#1C3A2B',
        }}>
          {deal.brand.toUpperCase()}
        </span>
      )}

      <span style={{ display: 'block', fontSize: '19px', fontWeight: 700, color: '#1A1A1A', marginBottom: '5px' }}>
        {deal.model}
      </span>
      <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '13.5px', color: '#6E7C74', marginBottom: '16px', overflowWrap: 'anywhere' }}>
        {deal.size}{deal.spec ? `  ${deal.spec}` : ''}
      </span>

      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E7E5DE',
      }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '7px', flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', lineHeight: 1,
            color: deal.was != null ? '#E23B2E' : '#1C3A2B',
          }}>
            ${deal.price.toFixed(0)}
          </span>
          {deal.was != null && (
            <span style={{ color: '#6E7C74', textDecoration: 'line-through', fontSize: '13px' }}>
              ${deal.was.toFixed(0)}
            </span>
          )}
          <span style={{ fontSize: '12.5px', color: '#6E7C74' }}>{unit}</span>
        </span>

        <button
          onClick={handleAdd}
          aria-label={`Add ${deal.brand} ${deal.model} to cart`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: justAdded ? '#0A7D3D' : '#076330', color: '#fff',
            padding: '10px 14px', borderRadius: '8px', border: 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700,
            flexShrink: 0, cursor: 'pointer', transition: 'background .2s',
          }}
        >
          {justAdded ? 'Added' : 'Add'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {justAdded
              ? <path d="M20 6 9 17l-5-5" />
              : <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h2.2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H5.5" /></>}
          </svg>
        </button>
      </span>
    </Link>
  )
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function BestDeals() {
  const [tab, setTab] = useState<'tyres' | 'wheels'>('tyres')
  const [tyreDeals, setTyreDeals]   = useState<Deal[]>([])
  const [wheelDeals, setWheelDeals] = useState<Deal[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/tyres/bestsellers?limit=4').then(r => r.json()),
      fetch('/api/wheels?limit=4').then(r => r.json()),
    ])
      .then(([tyreData, wheelData]) => {
        if (Array.isArray(tyreData.tyres))   setTyreDeals(tyreData.tyres.map(mapTyre))
        if (Array.isArray(wheelData.wheels)) setWheelDeals(wheelData.wheels.map(mapWheel))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const isWheels = tab === 'wheels'
  const deals    = isWheels ? wheelDeals : tyreDeals
  const unit     = isWheels ? 'per wheel, fitted' : 'per tyre, fitted'

  return (
    <section
      style={{
        maxWidth: '1180px', margin: '0 auto',
        padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,40px)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .nv-deals-grid { display: grid; gap: 16px; grid-template-columns: repeat(4,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-deals-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-deals-grid { grid-template-columns: repeat(1,minmax(0,1fr)); } }
      `}</style>

      {/* ── Header ── */}
      <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '26px' }}>
        <div>
          <p style={{ margin: '0 0 8px', fontFamily: "'DM Mono', monospace", fontSize: '11.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E8572A' }}>
            This week
          </p>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(34px,4vw,46px)', letterSpacing: '0.02em', color: '#1C3A2B' }}>
            Best deals on tyres &amp; wheels
          </h2>
        </div>

        {/* Segmented switch — the pill is one absolutely-positioned element that
            slides, so the label text never reflows mid-transition. */}
        <button
          onClick={() => setTab(t => (t === 'tyres' ? 'wheels' : 'tyres'))}
          role="switch" aria-checked={isWheels}
          aria-label="Switch between tyre and wheel deals"
          style={{
            fontFamily: "'DM Sans', sans-serif", position: 'relative',
            display: 'inline-flex', alignItems: 'center', background: '#FFFFFF',
            border: '1.5px solid #DEDCD4', borderRadius: '999px', padding: '5px',
            cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 3px rgba(20,25,22,0.06)',
          }}
        >
          <span style={{
            position: 'absolute', top: '5px', bottom: '5px',
            left: isWheels ? '50%' : '5px', width: 'calc(50% - 5px)',
            borderRadius: '999px', background: '#1C3A2B',
            boxShadow: '0 2px 8px -2px rgba(28,58,43,0.5)',
            transition: 'left .3s cubic-bezier(.22,1,.36,1)',
          }} />
          <span style={{ position: 'relative', zIndex: 1, padding: '10px 26px', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', color: isWheels ? '#3A453E' : '#FFFFFF', transition: 'color .3s' }}>Tyres</span>
          <span style={{ position: 'relative', zIndex: 1, padding: '10px 26px', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', color: isWheels ? '#FFFFFF' : '#3A453E', transition: 'color .3s' }}>Wheels</span>
        </button>
      </div>

      {/* ── Grid — keyed per tab so the panel re-enters on every switch ── */}
      <div key={tab} className="nv-deals-grid" style={{ animation: 'novaIn .35s cubic-bezier(.22,1,.36,1) both' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : deals.map(deal => <DealCard key={deal.id} deal={deal} unit={unit} />)}
      </div>

      {!loading && deals.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6E7C74', fontSize: '15px', padding: '32px 0' }}>
          No {isWheels ? 'wheel' : 'tyre'} deals right now — check back soon.
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <Link
          href={isWheels ? '/wheels/results' : '/tyres/results'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#076330', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}
        >
          {isWheels ? 'Shop all wheels' : 'Shop all tyres'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
