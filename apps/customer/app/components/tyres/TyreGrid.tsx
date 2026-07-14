'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ── Brand logo map ───────────────────────────────────────────────────────── */
const BRAND_LOGOS: Record<string, string> = {
  'continental':  '/images/brands/continental.svg',
  'hankook':      '/images/brands/hankook.svg',
  'pirelli':      '/images/brands/pirelli.svg',
  'maxxis':       '/images/brands/maxxis.svg',
  'yokohama':     '/images/brands/yokohama.svg',
  'bf goodrich':  '/images/brands/bfgoodrich.svg',
  'bfgoodrich':   '/images/brands/bfgoodrich.svg',
  'nitto':        '/images/brands/nitto.svg',
  'atlander':     '/images/brands/atlander.svg',
  'bridgestone':  '/images/brands/bridgestone.svg',
  'michelin':     '/images/brands/michelin.svg',
  'toyo':         '/images/brands/toyo.svg',
}

/* ── Types ────────────────────────────────────────────────────────────────── */
interface TyreProduct {
  id:        string   // UUID — React key
  slug:      string   // raw DB slug → stored as CartItem.productId
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  isSale:    boolean
  type:      string
  image:     string
}

interface ApiTyre {
  id:             string
  brand:          string
  model:          string
  type:           string
  price:          string | number
  compareAtPrice: string | number | null
  slug:           string
  tyreSize: {
    width:       number
    profile:     number
    rimDiameter: number
    loadIndex:   number | null
    speedRating: string | null
  }
  images: { url: string; altText: string | null }[]
}

function mapTyre(t: ApiTyre): TyreProduct {
  const { width, profile, rimDiameter, loadIndex, speedRating } = t.tyreSize
  return {
    id:        t.id,
    slug:      t.slug,
    brand:     t.brand,
    brandLogo: BRAND_LOGOS[t.brand.toLowerCase()] ?? '/images/brands/continental.svg',
    model:     t.model,
    size:      `${width}/${profile}R${rimDiameter}`,
    spec:      loadIndex && speedRating ? `${loadIndex}${speedRating}` : speedRating ?? '',
    price:     parseFloat(String(t.price)),
    isSale:    t.compareAtPrice != null && parseFloat(String(t.compareAtPrice)) > parseFloat(String(t.price)),
    type:      t.type,
    image:     t.images[0]?.url ?? '/images/tyres/tyre-passenger.png',
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
          fontSize:   '15px',
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
            fontSize:   '19px',
            fontWeight:  800,
          }}>
            A${product.price.toFixed(2)}
          </p>

          <Link
            href={`/tyres/${product.slug}`}
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
  const [allProducts,   setAllProducts]   = useState<TyreProduct[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All Brands')
  const [sortBy,        setSortBy]        = useState('Default')

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' })
    if (initialType)  params.set('type', initialType)
    if (initialBrand) params.set('brand', initialBrand)
    if (initialWidth)   params.set('width',   initialWidth)
    if (initialProfile) params.set('profile', initialProfile)
    if (initialRim)     params.set('rim',     initialRim)

    fetch(`/api/tyres?${params}`)
      .then(r => r.json())
      .then(data => {
        setAllProducts((data.tyres ?? []).map(mapTyre))
      })
      .catch(err => console.error('[TyreGrid] fetch failed:', err))
      .finally(() => setLoading(false))
  }, [initialType, initialBrand, initialWidth, initialProfile, initialRim])

  const brands = useMemo(
    () => ['All Brands', ...Array.from(new Set(allProducts.map(p => p.brand)))],
    [allProducts]
  )

  /*
    Size query built from URL params — e.g. "205/55R16".
    Exact matches are preferred; if none exist the full catalogue is shown
    with an "no exact match" notice so the user still sees alternatives.
  */
  const sizeQuery = initialWidth && initialProfile && initialRim
    ? `${initialWidth}/${initialProfile}R${initialRim}`
    : null

  /* Brand filter */
  const brandFiltered = useMemo(() =>
    selectedBrand === 'All Brands'
      ? allProducts
      : allProducts.filter(p => p.brand === selectedBrand),
    [selectedBrand, allProducts]
  )

  /* Size filter — exact match first, fallback to all */
  const sizeFiltered = useMemo(() => {
    if (!sizeQuery) return brandFiltered
    const exact = brandFiltered.filter(p => p.size === sizeQuery)
    return exact.length > 0 ? exact : brandFiltered
  }, [brandFiltered, sizeQuery])

  const exactSizeMatch = sizeQuery
    ? allProducts.some(p => p.size === sizeQuery)
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
      <div className="nv-shell">

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
        {sizeQuery && !exactSizeMatch && !loading && (
          <div style={{ background: '#FFF8F5', border: '1px solid #FDDCCC', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-info-circle" style={{ fontSize: '18px', color: '#E8572A', flexShrink: 0 }} aria-hidden="true" />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', fontWeight: 400 }}>
              No exact match found for <strong style={{ color: '#1A1A1A' }}>{sizeQuery}</strong>. Showing all available tyres — contact us to order your specific size.
            </p>
          </div>
        )}

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
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
