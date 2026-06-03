'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ── Product data ─────────────────────────────────────────────────────────── */
interface WheelProduct {
  id:        string
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  image:     string
}

const ALL_PRODUCTS: WheelProduct[] = [
  { id: 'w1',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'AWOL',    size: '17×8.5', spec: '6×139.7', price: 230.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w2',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'AWOL',    size: '17×8.5', spec: '6×139.7', price: 230.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w3',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'AWOL',    size: '17×8.5', spec: '6×139.7', price: 230.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w4',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'AWOL',    size: '17×8.5', spec: '6×139.7', price: 230.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w5',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'Arsenal', size: '18×9J',  spec: '5×114.3', price: 265.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w6',  brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'Arsenal', size: '18×9J',  spec: '5×114.3', price: 265.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w7',  brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Terrain', size: '16×8J',  spec: '6×139.7', price: 195.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w8',  brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Terrain', size: '17×8J',  spec: '6×139.7', price: 210.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w9',  brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Warrior', size: '20×9J',  spec: '5×150',   price: 295.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w10', brand: 'King Wheels', brandLogo: '/images/brands/king-wheels.svg', model: 'Force',   size: '17×8J',  spec: '6×139.7', price: 185.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w11', brand: 'King Wheels', brandLogo: '/images/brands/king-wheels.svg', model: 'Force',   size: '18×9J',  spec: '5×114.3', price: 205.00, image: '/images/wheel/Wheel 1.png' },
  { id: 'w12', brand: 'Sonix',       brandLogo: '/images/brands/sonix.svg',       model: 'XR7',     size: '18×8.5', spec: '5×112',   price: 175.00, image: '/images/wheel/Wheel 1.png' },
]

const BRANDS       = ['All Brands', ...Array.from(new Set(ALL_PRODUCTS.map(p => p.brand)))]
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
    addToCart({ id: product.slug ?? product.id, productType: 'wheel', brand: product.brand, brandLogo: product.brandLogo, model: product.model, size: product.size, spec: product.spec, price: product.price, image: product.image })
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
            href={`/wheels/${(product as WheelProduct & { slug?: string }).slug ?? product.id}`}
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
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All Brands')
  const [sortBy,        setSortBy]        = useState('Default')

  /* Diameter filter — checks product size starts with the selected diameter */
  const filtered = useMemo(() => {
    let arr = selectedBrand === 'All Brands'
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter(p => p.brand === selectedBrand)

    if (initialDiameter) {
      const d = initialDiameter.replace('"', '')
      const exact = arr.filter(p => p.size.startsWith(d + '×') || p.size.startsWith(d + 'x'))
      if (exact.length > 0) arr = exact
    }
    return arr
  }, [selectedBrand, initialDiameter])

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
      <div className="max-w-7xl mx-auto px-4">

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
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
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
        {products.length === 0 ? (
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
