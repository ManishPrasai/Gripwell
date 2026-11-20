'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'
import { money, DEFAULT_FITTING_PRICES } from '../../../lib/fitting'

/* ─── Brand logo map ──────────────────────────────────────────────────────── */
/* No manufacturer artwork: every brand renders as a text wordmark. */
const BRAND_LOGOS: Record<string, string> = {}

/* Brands without artwork fall back to a text wordmark chip rather than a
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
    image:     w.images[0]?.url ?? '/images/wheels/wheel-neutral.png',
  }
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ height: '410px', background: '#FFFFFF', border: '1px solid #DEDCD4', borderRadius: '18px', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ height: '172px', background: '#F0EFE9', borderRadius: '10px', marginBottom: '14px' }} />
      <div style={{ width: '110px', height: '30px', background: '#F0EFE9', borderRadius: '8px', marginBottom: '12px' }} />
      <div style={{ width: '70%', height: '17px', background: '#F0EFE9', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ width: '45%', height: '13px', background: '#F0EFE9', borderRadius: '4px' }} />
    </div>
  )
}

/* ─── Card ────────────────────────────────────────────────────────────────── */
function DealCard({ deal }: { deal: Deal }) {
  const unit = `per ${deal.tab === 'wheels' ? 'wheel' : 'tyre'} · fitting from ${money(DEFAULT_FITTING_PRICES.passenger, { whole: true })} per tyre fitted`
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
        position: 'relative', minWidth: 0, height: '410px', boxSizing: 'border-box', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#FFFFFF', border: `1px solid ${hovered ? '#C9C7BE' : '#DEDCD4'}`,
        borderRadius: '18px', padding: '20px', textDecoration: 'none', color: '#1A1D23',
        boxShadow: hovered
          ? '0 6px 10px rgba(20,25,22,0.08), 0 26px 50px -22px rgba(20,25,22,0.34)'
          : '0 4px 6px rgba(20,25,22,0.06), 0 10px 24px -14px rgba(20,25,22,0.14)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .22s',
      }}
    >
      {deal.was != null && (
        <span style={{
          position: 'absolute', top: 0, right: 0, background: '#FF6A1A', color: '#fff',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          padding: '6px 14px', borderRadius: '0 18px 0 12px', zIndex: 1,
        }}>
          SALE
        </span>
      )}

      <span style={{ position: 'relative', display: 'block', height: '172px', flexShrink: 0, marginBottom: '14px' }}>
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
          height: '30px', minWidth: '110px', padding: '0 12px', marginBottom: '12px', background: '#FFFFFF',
        }}>
          <Image src={deal.brandLogo} alt={deal.brand} width={88} height={13}
            style={{ objectFit: 'contain', width: '88px', height: '13px' }} />
        </span>
      ) : (
        <span style={{
          display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
          border: '1px solid #E7E5DE', borderRadius: '8px', height: '30px',
          padding: '0 12px', marginBottom: '12px', background: '#FFFFFF',
          fontFamily: 'var(--gw-font)', fontSize: '12px', fontWeight: 800,
          letterSpacing: '0.08em', color: '#1A1D23',
        }}>
          {deal.brand.toUpperCase()}
        </span>
      )}

      <span style={{ display: 'block', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', marginBottom: '3px' }}>
        {deal.model}
      </span>
      <span style={{ display: 'block', fontFamily: 'var(--gw-font)', fontSize: '12.5px', color: '#6B7280', marginBottom: '10px', overflowWrap: 'anywhere' }}>
        {deal.size}{deal.spec ? `  ${deal.spec}` : ''}
      </span>

      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '10px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #E7E5DE',
      }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--gw-font)', fontSize: '21px', fontWeight: 800, lineHeight: 1,
            color: deal.was != null ? '#FF6A1A' : '#1A1D23',
          }}>
            {money(deal.price, { whole: true })}
          </span>
          <span style={{ fontSize: '11.5px', color: '#6B7280' }}>{unit}</span>
        </span>

        <button
          onClick={handleAdd}
          aria-label={`Add ${deal.brand} ${deal.model} to cart`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: justAdded ? '#0A7D3D' : '#2A2E36', color: '#fff',
            padding: '9px 13px', borderRadius: '8px', border: 'none',
            fontFamily: 'var(--gw-font)', fontSize: '12.5px', fontWeight: 700,
            flexShrink: 0, cursor: 'pointer', transition: 'background .2s', whiteSpace: 'nowrap',
          }}
        >
          {justAdded ? 'Added' : 'Add'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
/* Which products show here is an admin call (the isFeatured flag on each
   Tyre/Wheel, set from the inventory edit drawer) — no customer-facing tab to
   switch between tyres and wheels; both show together in one grid. */
export default function BestDeals() {
  const [deals, setDeals]     = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/tyres/featured?limit=4').then(r => r.json()),
      fetch('/api/wheels/featured?limit=4').then(r => r.json()),
    ])
      .then(([tyreData, wheelData]) => {
        const tyreDeals  = Array.isArray(tyreData.tyres)   ? tyreData.tyres.map(mapTyre)   : []
        const wheelDeals = Array.isArray(wheelData.wheels) ? wheelData.wheels.map(mapWheel) : []
        setDeals([...tyreDeals, ...wheelDeals])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      style={{
        background: '#FAF9F5',
        maxWidth: '1180px', margin: '0 auto',
        padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,40px)',
        fontFamily: 'var(--gw-font)',
      }}
    >
      <style>{`
        .nv-deals-grid { display: grid; gap: 16px; grid-template-columns: repeat(4,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-deals-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-deals-grid { grid-template-columns: repeat(1,minmax(0,1fr)); } }
      `}</style>

      {/* ── Header ── */}
      <div data-reveal style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: '16px 24px', marginBottom: '26px',
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6A1A' }}>
            Best deals
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(30px,3.6vw,42px)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05, color: '#1A1D23' }}>
            Warehouse-direct pricing, every day
          </h2>
        </div>
        <Link href="/tyres/results" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#2A2E36', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: '4px',
        }}>
          View all deals
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* ── Grid — admin-curated via each product's "Featured" flag ── */}
      <div className="nv-deals-grid" style={{ animation: 'novaIn .35s cubic-bezier(.22,1,.36,1) both' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </div>

      {!loading && deals.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '15px', padding: '32px 0' }}>
          No featured deals right now — check back soon.
        </p>
      )}

    </section>
  )
}
