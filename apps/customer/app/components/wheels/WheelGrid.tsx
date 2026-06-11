'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ── Brand logo map ───────────────────────────────────────────────────────── */
const BRAND_LOGOS: Record<string, string> = {
  'black rhino':  '/images/brands/Black Rino.svg',
  'roh':          '/images/brands/roh.svg',
  'king wheels':  '/images/brands/king-wheels.svg',
  'sonix':        '/images/brands/sonix.svg',
  'fuel':         '/images/brands/fuel.svg',
  'method':       '/images/brands/method.svg',
}

/* ── Types ────────────────────────────────────────────────────────────────── */
interface WheelProduct {
  id:        string   // UUID — React key
  slug:      string   // raw DB slug → stored as CartItem.productId
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  image:     string
}

interface ApiWheel {
  id:             string
  brand:          string
  model:          string
  diameter:       number
  width:          string | number
  pcd:            string
  price:          string | number
  compareAtPrice: string | number | null
  slug:           string
  images:         { url: string; altText: string | null }[]
}

function mapWheel(w: ApiWheel): WheelProduct {
  return {
    id:        w.id,
    slug:      w.slug,
    brand:     w.brand,
    brandLogo: BRAND_LOGOS[w.brand.toLowerCase()] ?? '/images/wheel/Wheel 1.png',
    model:     w.model,
    size:      `${w.diameter}×${parseFloat(String(w.width)).toFixed(1)}`,
    spec:      w.pcd,
    price:     parseFloat(String(w.price)),
    image:     w.images[0]?.url ?? '/images/wheel/Wheel 1.png',
  }
}

const SORT_OPTIONS = ['Default', 'Price: Low to High', 'Price: High to Low', 'Name: A–Z']

/* ── Brand logo with text fallback ───────────────────────────────────────── */
function BrandLogoImg({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (err) return (
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#333' }}>{brand}</span>
  )
  return (
    <Image src={src} alt={brand} width={80} height={20}
      style={{ objectFit: 'contain', height: '18px', width: 'auto', maxWidth: '80px' }}
      onError={() => setErr(true)}
    />
  )
}

/* ── Single wheel card ────────────────────────────────────────────────────── */
function WheelCard({ product }: { product: WheelProduct }) {
  const [hovered,   setHovered]   = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addToCart({ id: product.slug, productType: 'wheel', brand: product.brand, brandLogo: product.brandLogo, model: product.model, size: product.size, spec: product.spec, price: product.price, image: product.image })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    '#fff',
        borderRadius:  '12px',
        border:        '1px solid #E5E5E5',
        overflow:      'hidden',
        position:      'relative',
        boxShadow:     hovered ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition:    'box-shadow 0.25s ease, transform 0.25s ease',
        transform:     hovered ? 'translateY(-3px)' : 'translateY(0)',
        display:       'flex',
        flexDirection: 'column',
      }}
    >
      {/* Add to cart */}
      <button
        onClick={handleAdd}
        aria-label="Add to cart"
        style={{
          position:      'absolute',
          top:           '12px',
          right:         '12px',
          width:         '34px',
          height:        '34px',
          borderRadius:  '50%',
          background:    justAdded ? '#22c55e' : '#fff',
          border:        justAdded ? 'none' : '1px solid #E5E5E5',
          boxShadow:     '0 1px 6px rgba(0,0,0,0.1)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          cursor:        'pointer',
          zIndex:         2,
          transition:    'background 0.2s ease',
        }}
      >
        <i
          className={justAdded ? 'ti ti-check' : 'ti ti-shopping-cart'}
          style={{ fontSize: '15px', color: justAdded ? '#fff' : '#E8572A' }}
          aria-hidden="true"
        />
      </button>

      {/* Wheel image */}
      <div style={{ padding: '40px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxHeight: '180px' }}>
          <Image
            src={product.image}
            alt={`${product.brand} ${product.model}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>

        <div style={{ marginBottom: '6px' }}>
          <BrandLogoImg src={product.brandLogo} brand={product.brand} />
        </div>

        <p style={{ color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '2px' }}>
          {product.brand} {product.model}
        </p>

        <p style={{ color: '#888', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, marginBottom: '10px' }}>
          {product.size}&nbsp;&nbsp;{product.spec}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <p style={{ color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", fontSize: '17px', fontWeight: 800 }}>
            A${product.price.toFixed(2)}
          </p>
          <Link
            href={`/wheels/${product.slug}`}
            className="inline-flex items-center gap-1"
            style={{ background: '#E8572A', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            VIEW MORE
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton card ────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ height: '320px', borderRadius: '12px', border: '1px solid #E5E5E5', background: '#fff', overflow: 'hidden' }}>
      <div style={{ height: '180px', background: '#F0F0F0', margin: '16px 16px 0' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ width: '64px', height: '18px', background: '#F0F0F0', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ width: '80%', height: '14px', background: '#F0F0F0', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ width: '50%', height: '12px', background: '#F0F0F0', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

/* ── Select style ─────────────────────────────────────────────────────────── */
const selectStyle: React.CSSProperties = {
  appearance: 'none', background: '#fff', border: '1px solid #D5D5D5',
  borderRadius: '8px', padding: '9px 36px 9px 14px', fontSize: '14px',
  fontWeight: 600, color: '#1A1A1A', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif", outline: 'none', minWidth: '140px',
}

/* ── Props from search URL ────────────────────────────────────────────────── */
interface WheelGridProps {
  initialBrand?:    string
  initialDiameter?: string
  initialFinish?:   string
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export default function WheelGrid({ initialBrand, initialDiameter, initialFinish }: WheelGridProps = {}) {
  const [allProducts,   setAllProducts]   = useState<WheelProduct[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All Brands')
  const [sortBy,        setSortBy]        = useState('Default')

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' })
    if (initialBrand)    params.set('brand',    initialBrand)
    if (initialDiameter) params.set('diameter', initialDiameter.replace('"', ''))
    if (initialFinish)   params.set('finish',   initialFinish)

    fetch(`/api/wheels?${params}`)
      .then(r => r.json())
      .then(data => {
        setAllProducts((data.wheels ?? []).map(mapWheel))
      })
      .catch(err => console.error('[WheelGrid] fetch failed:', err))
      .finally(() => setLoading(false))
  }, [initialBrand, initialDiameter, initialFinish])

  const brands = useMemo(
    () => ['All Brands', ...Array.from(new Set(allProducts.map(p => p.brand)))],
    [allProducts]
  )

  const filtered = useMemo(() => {
    return selectedBrand === 'All Brands'
      ? allProducts
      : allProducts.filter(p => p.brand === selectedBrand)
  }, [selectedBrand, allProducts])

  const products = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'Price: Low to High')  arr.sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.price - a.price)
    if (sortBy === 'Name: A–Z')          arr.sort((a, b) => a.model.localeCompare(b.model))
    return arr
  }, [filtered, sortBy])

  const hasActiveFilter = selectedBrand !== 'All Brands' || initialDiameter || initialFinish

  return (
    <section style={{ paddingBottom: '56px' }}>
      <div className="nv-shell">

        {/* Filter bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-4"
          style={{ padding: '20px 0', borderBottom: '1px solid #E0E0E0', marginBottom: '24px' }}
        >
          <nav style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', fontWeight: 500 }}>
            <Link href="/"       style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/wheels" style={{ color: '#888', textDecoration: 'none' }}>Wheels</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>
              {initialDiameter || initialBrand ? 'Results' : 'Collection'}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <div style={{ position: 'relative' }}>
              <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={selectStyle}>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#888', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#888', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {initialDiameter && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                <i className="ti ti-diameter" style={{ fontSize: '13px' }} aria-hidden="true" />
                {initialDiameter}
                <Link href="/wheels/results" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginLeft: '2px' }}>×</Link>
              </span>
            )}
            {initialFinish && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {initialFinish}
                <Link href="/wheels/results" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginLeft: '2px' }}>×</Link>
              </span>
            )}
            {selectedBrand !== 'All Brands' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F0F0', color: '#333', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {selectedBrand}
                <button onClick={() => setSelectedBrand('All Brands')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>
            No wheels found. Try a different filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <WheelCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
