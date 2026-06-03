'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ── Product data ─────────────────────────────────────────────────────────── */
interface TyreProduct {
  id:        string
  slug:      string
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  isSale:    boolean
  type:      string   // PASSENGER | SUV | ALL_TERRAIN | MUD_TERRAIN | COMMERCIAL
  image:     string
}

const ALL_PRODUCTS: TyreProduct[] = [
  { id: '1',  slug: 'continental-crosscontact-at-245-70r16',       brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',   size: '245/70R16', spec: '118/115S', price: 91.50,  isSale: true,  type: 'ALL_TERRAIN', image: '/images/tyres/Tyre 1.png' },
  { id: '2',  slug: 'hankook-ventus-s1-evo3-215-65r16',            brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: false, type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '3',  slug: 'continental-crosscontact-at-245-70r16-b',     brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',   size: '245/70R16', spec: '118/115S', price: 91.50,  isSale: true,  type: 'SUV',         image: '/images/tyres/Tyre 1.png' },
  { id: '4',  slug: 'continental-ultracontact-ux7-215-65r16',      brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'UltraContact UX7',  size: '215/65R16', spec: '98H',      price: 91.50,  isSale: true,  type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '5',  slug: 'hankook-ventus-s1-evo3-215-65r16-b',          brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',    size: '215/65R16', spec: '98H',      price: 120.50, isSale: true,  type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '6',  slug: 'maxxis-at771-245-70r16',                      brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'AT771 Bravo',       size: '245/70R16', spec: '113/110S', price: 105.00, isSale: false, type: 'ALL_TERRAIN', image: '/images/tyres/Tyre 1.png' },
  { id: '7',  slug: 'hankook-dynapro-at2-265-65r17',               brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Dynapro AT2',       size: '265/65R17', spec: '120S',     price: 135.00, isSale: false, type: 'SUV',         image: '/images/tyres/Tyre 1.png' },
  { id: '8',  slug: 'maxxis-razr-mt-265-75r16',                    brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'Razr MT',           size: '265/75R16', spec: '119Q',     price: 165.00, isSale: true,  type: 'MUD_TERRAIN', image: '/images/tyres/Tyre 1.png' },
  { id: '9',  slug: 'pirelli-p-zero-sport-245-45r18',              brand: 'Pirelli',     brandLogo: '/images/brands/pirelli.svg',     model: 'P Zero Sport',      size: '245/45R18', spec: '100Y',     price: 185.00, isSale: false, type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '10', slug: 'maxxis-victra-sport-5-225-40r18',             brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'Victra Sport 5',    size: '225/40R18', spec: '92Y',      price: 145.00, isSale: true,  type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '11', slug: 'hankook-kinergy-eco2-205-55r16',              brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Kinergy Eco 2',     size: '205/55R16', spec: '91V',      price: 98.00,  isSale: false, type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '12', slug: 'pirelli-cinturato-p7-225-50r17',              brand: 'Pirelli',     brandLogo: '/images/brands/pirelli.svg',     model: 'Cinturato P7',      size: '225/50R17', spec: '98W',      price: 160.00, isSale: false, type: 'PASSENGER',   image: '/images/tyres/Tyre 1.png' },
  { id: '13', slug: 'yokohama-geolandar-at-265-70r16',             brand: 'Yokohama',    brandLogo: '/images/brands/yokohama.svg',    model: 'Geolandar A/T',     size: '265/70R16', spec: '112H',     price: 148.00, isSale: false, type: 'ALL_TERRAIN', image: '/images/tyres/Tyre 1.png' },
  { id: '14', slug: 'continental-crosscontact-suv-235-65r17',      brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact SUV',  size: '235/65R17', spec: '108H',     price: 115.00, isSale: true,  type: 'SUV',         image: '/images/tyres/Tyre 1.png' },
  { id: '15', slug: 'maxxis-bravo-mt-762-31x105r15',               brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'Bravo MT-762',      size: '31×10.5R15',spec: '109Q',     price: 172.00, isSale: false, type: 'MUD_TERRAIN', image: '/images/tyres/Tyre 1.png' },
  { id: '16', slug: 'hankook-dynapro-mt2-265-70r17',               brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Dynapro MT2',       size: '265/70R17', spec: '121Q',     price: 178.00, isSale: true,  type: 'MUD_TERRAIN', image: '/images/tyres/Tyre 1.png' },
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
function TyreCard({ product }: { product: TyreProduct }) {
  const [hovered,   setHovered]   = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addToCart({ id: product.slug, productType: 'tyre', brand: product.brand, brandLogo: product.brandLogo, model: product.model, size: product.size, spec: product.spec, price: product.price, image: product.image })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

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
        onClick={handleAdd}
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
            href={`/tyres/${product.slug ?? product.id}`}
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

/* ── Props from search URL ────────────────────────────────────────────────── */
interface TyreGridProps {
  initialWidth?:   string
  initialProfile?: string
  initialRim?:     string
  initialBrand?:   string
  initialType?:    string
}

/* ── Main grid section ───────────────────────────────────────────────────── */
export default function TyreGrid({ initialWidth, initialProfile, initialRim, initialBrand, initialType }: TyreGridProps = {}) {
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All Brands')
  const [sortBy,        setSortBy]        = useState('Default')

  /*
    Size query built from URL params — e.g. "205/55R16".
    Exact matches are preferred; if none exist the full catalogue is shown
    with an "no exact match" notice so the user still sees alternatives.
  */
  const sizeQuery = initialWidth && initialProfile && initialRim
    ? `${initialWidth}/${initialProfile}R${initialRim}`
    : null

  /* Type filter (from URL param) applied first, brand filter on top */
  const typeFiltered = useMemo(() =>
    initialType
      ? ALL_PRODUCTS.filter(p => p.type === initialType)
      : ALL_PRODUCTS,
    [initialType]
  )

  const brandFiltered = useMemo(() =>
    selectedBrand === 'All Brands'
      ? typeFiltered
      : typeFiltered.filter(p => p.brand === selectedBrand),
    [selectedBrand, typeFiltered]
  )

  /* Size filter — exact match first, fallback to all */
  const sizeFiltered  = useMemo(() => {
    if (!sizeQuery) return brandFiltered
    const exact = brandFiltered.filter(p => p.size === sizeQuery)
    return exact.length > 0 ? exact : brandFiltered   // fallback = show all with notice
  }, [brandFiltered, sizeQuery])

  const exactSizeMatch = sizeQuery
    ? brandFiltered.some(p => p.size === sizeQuery)
    : true

  /* Sort */
  const products = useMemo(() => {
    const arr = [...sizeFiltered]
    if (sortBy === 'Price: Low to High')  arr.sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.price - a.price)
    if (sortBy === 'Name: A–Z')          arr.sort((a, b) => a.model.localeCompare(b.model))
    return arr
  }, [sizeFiltered, sortBy])


  return (
    <section style={{ paddingBottom: '56px' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Filter bar ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-4"
          style={{ padding: '20px 0', borderBottom: '1px solid #E0E0E0', marginBottom: '24px' }}
        >
          {/* Breadcrumb */}
          <nav style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', fontWeight: 500 }}>
            <Link href="/"      style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/tyres" style={{ color: '#888', textDecoration: 'none' }}>Tyres</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>
              {sizeQuery ? `Results for ${sizeQuery}` : initialType ? `${initialType.replace('_', ' ')} Tyres` : 'Collection'}
            </span>
          </nav>

          {/* Dropdowns */}
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

        {/* ── Active filter chips ── */}
        {(sizeQuery || selectedBrand !== 'All Brands') && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {sizeQuery && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                <i className="ti ti-ruler-2" style={{ fontSize: '13px' }} aria-hidden="true" />
                {sizeQuery}
                <Link href="/tyres/results" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginLeft: '2px' }}>×</Link>
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

        {/* ── No exact size match notice ── */}
        {sizeQuery && !exactSizeMatch && (
          <div style={{ background: '#FFF8F5', border: '1px solid #FDDCCC', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-info-circle" style={{ fontSize: '18px', color: '#E8572A', flexShrink: 0 }} aria-hidden="true" />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', fontWeight: 400 }}>
              No exact match found for <strong style={{ color: '#1A1A1A' }}>{sizeQuery}</strong>. Showing all available tyres — contact us to order your specific size.
            </p>
          </div>
        )}

        {/* ── Product grid ── */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>
            No tyres found. Try a different filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => (
              <TyreCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
