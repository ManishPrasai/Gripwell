'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ── Product data ─────────────────────────────────────────────────────────── */
interface TyreProduct {
  id:        string
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  isSale:    boolean
  image:     string
}

const ALL_PRODUCTS: TyreProduct[] = [
  { id: '1',  brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',   size: '245/70R16', spec: '118/115S', price: 91.50,  isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '2',  brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: false, image: '/images/tyres/Tyre 1.png' },
  { id: '3',  brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',   size: '245/70R16', spec: '118/115S', price: 91.50,  isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '4',  brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'UltraContact UX7',  size: '215/65R16', spec: '98H',      price: 91.50,  isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '5',  brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '6',  brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',   size: '245/70R16', spec: '118/115S', price: 91.50,  isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '7',  brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: false, image: '/images/tyres/Tyre 1.png' },
  { id: '8',  brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: false, image: '/images/tyres/Tyre 1.png' },
  { id: '9',  brand: 'Pirelli',     brandLogo: '/images/brands/pirelli.svg',     model: 'P Zero Sport',      size: '245/45R18', spec: '100Y',     price: 185.00, isSale: false, image: '/images/tyres/Tyre 1.png' },
  { id: '10', brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'Victra Sport 5',    size: '225/40R18', spec: '92Y',      price: 145.00, isSale: true,  image: '/images/tyres/Tyre 1.png' },
  { id: '11', brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Kinergy Eco 2',     size: '205/55R16', spec: '91V',      price: 98.00,  isSale: false, image: '/images/tyres/Tyre 1.png' },
  { id: '12', brand: 'Pirelli',     brandLogo: '/images/brands/pirelli.svg',     model: 'Cinturato P7',      size: '225/50R17', spec: '98W',      price: 160.00, isSale: false, image: '/images/tyres/Tyre 1.png' },
]

const BRANDS      = ['All Brands', ...Array.from(new Set(ALL_PRODUCTS.map(p => p.brand)))]
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

/* ── Single product card ──────────────────────────────────────────────────── */
function TyreCard({ product, onAddToCart, justAdded }: {
  product:    TyreProduct
  onAddToCart: (id: string) => void
  justAdded:  boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   '#fff',
        borderRadius: '12px',
        border:       '1px solid #E5E5E5',
        overflow:     'hidden',
        position:     'relative',
        boxShadow:    hovered ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition:   'box-shadow 0.25s ease, transform 0.25s ease',
        transform:    hovered ? 'translateY(-3px)' : 'translateY(0)',
        display:      'flex',
        flexDirection: 'column',
      }}
    >
      {/* SALE badge */}
      {product.isSale && (
        <div style={{
          position:     'absolute',
          top:          '12px',
          left:         '12px',
          background:   '#E8572A',
          color:        '#fff',
          fontSize:     '11px',
          fontWeight:   800,
          letterSpacing:'0.08em',
          padding:      '4px 10px',
          borderRadius: '4px',
          fontFamily:   "'DM Sans', sans-serif",
          zIndex:        2,
        }}>
          SALE
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={() => onAddToCart(product.id)}
        aria-label="Add to cart"
        style={{
          position:     'absolute',
          top:          '12px',
          right:        '12px',
          width:        '34px',
          height:       '34px',
          borderRadius: '50%',
          background:   justAdded ? '#22c55e' : '#fff',
          border:       justAdded ? 'none' : '1px solid #E5E5E5',
          boxShadow:    '0 1px 6px rgba(0,0,0,0.1)',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'center',
          cursor:       'pointer',
          zIndex:        2,
          transition:   'background 0.2s ease',
        }}
      >
        <i
          className={justAdded ? 'ti ti-check' : 'ti ti-shopping-cart'}
          style={{ fontSize: '15px', color: justAdded ? '#fff' : '#E8572A' }}
          aria-hidden="true"
        />
      </button>

      {/* Tyre image */}
      <div style={{ padding: '48px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* Info section */}
      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>

        {/* Brand logo */}
        <div style={{ marginBottom: '6px' }}>
          <BrandLogoImg src={product.brandLogo} brand={product.brand} />
        </div>

        {/* Model name */}
        <p style={{
          color:      '#1A1A1A',
          fontFamily: "'DM Sans', sans-serif",
          fontSize:   '14px',
          fontWeight:  700,
          lineHeight:  1.3,
          marginBottom:'2px',
        }}>
          {product.model}
        </p>

        {/* Size + spec */}
        <p style={{
          color:      '#888',
          fontFamily: "'DM Sans', sans-serif",
          fontSize:   '12px',
          fontWeight:  500,
          marginBottom:'10px',
        }}>
          {product.size}&nbsp;&nbsp;{product.spec}
        </p>

        {/* Price + VIEW MORE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <p style={{
            color:      '#1A1A1A',
            fontFamily: "'DM Sans', sans-serif",
            fontSize:   '17px',
            fontWeight:  800,
          }}>
            A${product.price.toFixed(2)}
          </p>

          <Link
            href={`/tyres/${product.id}`}
            className="inline-flex items-center gap-1"
            style={{
              background:    '#E8572A',
              color:         '#fff',
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      '12px',
              fontWeight:     700,
              letterSpacing: '0.04em',
              padding:       '7px 14px',
              borderRadius:  '6px',
              textDecoration:'none',
              whiteSpace:    'nowrap',
            }}
          >
            VIEW MORE
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Filter bar ───────────────────────────────────────────────────────────── */
const selectStyle: React.CSSProperties = {
  appearance:   'none',
  background:   '#fff',
  border:       '1px solid #D5D5D5',
  borderRadius: '8px',
  padding:      '9px 36px 9px 14px',
  fontSize:     '14px',
  fontWeight:    600,
  color:        '#1A1A1A',
  cursor:       'pointer',
  fontFamily:   "'DM Sans', sans-serif",
  outline:      'none',
  minWidth:     '140px',
}

/* ── Main grid section ───────────────────────────────────────────────────── */
export default function TyreGrid() {
  const [selectedBrand, setSelectedBrand] = useState('All Brands')
  const [sortBy,        setSortBy]        = useState('Default')
  const [justAdded,     setJustAdded]     = useState<string | null>(null)

  /* Filter */
  const filtered = useMemo(() =>
    selectedBrand === 'All Brands'
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter(p => p.brand === selectedBrand),
    [selectedBrand]
  )

  /* Sort */
  const products = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'Price: Low to High')  arr.sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.price - a.price)
    if (sortBy === 'Name: A–Z')          arr.sort((a, b) => a.model.localeCompare(b.model))
    return arr
  }, [filtered, sortBy])

  function addToCart(id: string) {
    setJustAdded(id)
    setTimeout(() => setJustAdded(null), 1400)
  }

  return (
    <section style={{ paddingBottom: '56px' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Filter bar ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-4"
          style={{ padding: '20px 0 20px', borderBottom: '1px solid #E0E0E0', marginBottom: '24px' }}
        >
          {/* Breadcrumb */}
          <nav style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', fontWeight: 500 }}>
            <Link href="/"       style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/tyres"  style={{ color: '#888', textDecoration: 'none' }}>Tyres</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>Collection</span>
          </nav>

          {/* Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Brand filter */}
            <div style={{ position: 'relative' }}>
              <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={selectStyle}>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#888', pointerEvents: 'none' }} aria-hidden="true" />
            </div>

            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#888', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ── Product grid — 4 columns ── */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>
            No tyres found for the selected brand.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => (
              <TyreCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                justAdded={justAdded === product.id}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
