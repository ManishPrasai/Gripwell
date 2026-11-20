'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'
import { money } from '../../../lib/fitting'

/* ── Brand logo map ───────────────────────────────────────────────────────── */
/* No manufacturer artwork: every brand renders as a text wordmark. */
const BRAND_LOGOS: Record<string, string> = {}

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
    brandLogo: BRAND_LOGOS[t.brand.toLowerCase()] ?? '',
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

/* ── Brand logo with text fallback (bare — no border chip) ────────────────── */
function BrandLogoImg({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return (
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#0A0F0C' }}>{brand}</span>
  )
  return (
    <Image src={src} alt={brand} width={80} height={20}
      style={{ objectFit: 'contain', height: '18px', width: 'auto', maxWidth: '84px' }}
      onError={() => setErr(true)}
    />
  )
}

/* ── Single product card (industrial-bold look, rounded) ──────────────────── */
function TyreCard({ product }: { product: TyreProduct }) {
  const [hovered,   setHovered]   = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ id: product.slug, productType: 'tyre', brand: product.brand, brandLogo: product.brandLogo, model: product.model, size: product.size, spec: product.spec, price: product.price, image: product.image })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <Link
      href={`/tyres/${product.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background:   '#fff',
          borderRadius: '16px',              /* keep our rounded corners */
          border:       `1px solid ${hovered ? 'rgba(7,99,48,0.45)' : 'rgba(7,99,48,0.16)'}`,
          overflow:     'hidden',
          position:     'relative',
          height:       '400px',
          display:      'flex',
          flexDirection:'column',
          boxShadow:    hovered ? '0 16px 34px rgba(17,24,20,0.14)' : '0 4px 14px rgba(17,24,20,0.08)',
          transform:    hovered ? 'translateY(-8px)' : 'translateY(0)',
          transition:   'transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease, border-color 0.3s ease',
        }}
      >
        {/* ── Photo — fixed height to match target card size ── */}
        <div style={{ position: 'relative', height: '220px', flexShrink: 0, background: '#fff', overflow: 'hidden' }}>
          {/* SALE badge */}
          {product.isSale && (
            <span style={{
              position:      'absolute',
              top:           '12px',
              left:          '12px',
              zIndex:         4,
              fontFamily:    "'DM Sans', sans-serif",
              fontWeight:     700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize:      '11.5px',
              color:         '#fff',
              background:    '#FF6A1A',
              padding:       '6px 13px',
              borderRadius:  '4px',
            }}>
              Sale
            </span>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            style={{
              position:      'absolute',
              top:           '12px',
              right:         '12px',
              zIndex:         4,
              width:         '40px',
              height:        '40px',
              borderRadius:  '50%',
              display:       'grid',
              placeItems:    'center',
              color:         justAdded ? '#fff' : '#FF6A1A',
              background:    justAdded ? '#2A2E36' : '#fff',
              border:        '1px solid rgba(7,99,48,0.16)',
              boxShadow:     '0 2px 6px rgba(17,24,20,0.12)',
              cursor:        'pointer',
              transform:     hovered ? 'scale(1.06)' : 'scale(1)',
              transition:    'transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s ease, color 0.2s ease',
            }}
          >
            <i className={justAdded ? 'ti ti-check' : 'ti ti-shopping-cart'} style={{ fontSize: '17px' }} aria-hidden="true" />
          </button>

          <Image
            src={product.image}
            alt={`${product.brand} ${product.model}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'contain', padding: '10px' }}
          />
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '12px 15px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', flex: 1, minWidth: 0 }}>

          {/* Bare brand logo — no rectangle chip */}
          <div style={{ height: '22px', display: 'flex', alignItems: 'center' }}>
            <BrandLogoImg src={product.brandLogo} brand={product.brand} />
          </div>

          {/* Model name */}
          <h3 style={{
            fontFamily:    "'DM Sans', sans-serif",
            fontWeight:     800,
            fontSize:      '18px',
            lineHeight:     1.15,
            letterSpacing: '-0.01em',
            color:         '#0A0F0C',
            whiteSpace:    'nowrap',
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            maxWidth:      '100%',
          }}>
            {product.model}
          </h3>

          {/* Size + spec */}
          <span style={{
            fontFamily:   "'DM Sans', sans-serif",
            fontSize:     '13px',
            fontWeight:    500,
            color:        '#2E3A32',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            maxWidth:     '100%',
          }}>
            {product.size}&nbsp;&nbsp;{product.spec}
          </span>

          {/* Divider */}
          <span style={{ width: '100%', height: '1px', background: 'rgba(7,99,48,0.16)', margin: '3px 0 1px' }} />

          {/* Price + View more */}
          <div style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '9px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '24px', letterSpacing: '-0.01em', color: '#E23B2E' }}>
              {money(product.price)}
            </span>
            <span style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '6px',
              padding:      '9px 15px',
              borderRadius: '8px',
              background:   '#2A2E36',
              color:        '#fff',
              fontFamily:   "'DM Sans', sans-serif",
              fontWeight:    800,
              fontSize:     '13.5px',
              whiteSpace:   'nowrap',
              filter:       hovered ? 'brightness(1.08)' : 'none',
              transition:   'filter 0.2s ease',
            }}>
              View more
              <i className="ti ti-arrow-right" style={{ fontSize: '14px' }} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Skeleton card ────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ height: '400px', borderRadius: '16px', border: '1px solid rgba(7,99,48,0.16)', background: '#fff', overflow: 'hidden' }}>
      <div style={{ height: '220px', background: '#F0F0F0', margin: '16px 16px 0' }} />
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
  initialQ?:       string
}

/* ── Main grid section ───────────────────────────────────────────────────── */
export default function TyreGrid({ initialWidth, initialProfile, initialRim, initialBrand, initialType, initialQ }: TyreGridProps = {}) {
  const [allProducts,   setAllProducts]   = useState<TyreProduct[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All Brands')
  const [sortBy,        setSortBy]        = useState('Default')
  const [onSaleOnly,    setOnSaleOnly]    = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' })
    if (initialType)  params.set('type', initialType)
    if (initialBrand) params.set('brand', initialBrand)
    if (initialWidth)   params.set('width',   initialWidth)
    if (initialProfile) params.set('profile', initialProfile)
    if (initialRim)     params.set('rim',     initialRim)
    if (initialQ)       params.set('q',       initialQ)

    fetch(`/api/tyres?${params}`)
      .then(r => r.json())
      .then(data => {
        setAllProducts((data.tyres ?? []).map(mapTyre))
      })
      .catch(err => console.error('[TyreGrid] fetch failed:', err))
      .finally(() => setLoading(false))
  }, [initialType, initialBrand, initialWidth, initialProfile, initialRim, initialQ])

  const brands = useMemo(
    () => ['All Brands', ...Array.from(new Set(allProducts.map(p => p.brand)))],
    [allProducts]
  )

  const saleCount = useMemo(() => allProducts.filter(p => p.isSale).length, [allProducts])

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

  /* Sale filter */
  const saleFiltered = useMemo(() =>
    onSaleOnly ? sizeFiltered.filter(p => p.isSale) : sizeFiltered,
    [sizeFiltered, onSaleOnly]
  )

  const exactSizeMatch = sizeQuery
    ? allProducts.some(p => p.size === sizeQuery)
    : true

  /* Sort */
  const products = useMemo(() => {
    const arr = [...saleFiltered]
    if (sortBy === 'Price: Low to High')  arr.sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.price - a.price)
    if (sortBy === 'Name: A–Z')          arr.sort((a, b) => a.model.localeCompare(b.model))
    return arr
  }, [saleFiltered, sortBy])


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

          {/* Controls — wraps rather than forcing the two 140px-min selects
              off the edge of a phone screen next to the on-sale toggle. */}
          <div className="flex flex-wrap items-center gap-3">
            {/* On-sale toggle */}
            <button
              type="button"
              onClick={() => setOnSaleOnly(v => !v)}
              aria-pressed={onSaleOnly}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '7px',
                padding:      '9px 16px',
                borderRadius: '8px',
                cursor:       'pointer',
                fontFamily:   "'DM Sans', sans-serif",
                fontSize:     '14px',
                fontWeight:    700,
                border:       onSaleOnly ? '1px solid #FF6A1A' : '1px solid #D5D5D5',
                background:   onSaleOnly ? '#FF6A1A' : '#fff',
                color:        onSaleOnly ? '#fff' : '#1A1A1A',
                transition:   'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
              }}
            >
              <i className="ti ti-discount-2" style={{ fontSize: '16px' }} aria-hidden="true" />
              On sale
              {saleCount > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: onSaleOnly ? 'rgba(255,255,255,0.25)' : '#F0F0F0',
                  color: onSaleOnly ? '#fff' : '#888',
                  borderRadius: '999px',
                  padding: '1px 7px',
                }}>
                  {saleCount}
                </span>
              )}
            </button>

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
        {(sizeQuery || selectedBrand !== 'All Brands' || onSaleOnly) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {sizeQuery && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                <i className="ti ti-ruler-2" style={{ fontSize: '13px' }} aria-hidden="true" />
                {sizeQuery}
                <Link href="/tyres/results" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginLeft: '2px' }}>×</Link>
              </span>
            )}
            {onSaleOnly && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FF6A1A', color: '#fff', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                <i className="ti ti-discount-2" style={{ fontSize: '13px' }} aria-hidden="true" />
                On sale
                <button onClick={() => setOnSaleOnly(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', padding: 0, lineHeight: 1, marginLeft: '2px' }}>×</button>
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
            <i className="ti ti-info-circle" style={{ fontSize: '18px', color: '#FF6A1A', flexShrink: 0 }} aria-hidden="true" />
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
            {onSaleOnly ? 'No tyres on sale right now. Try clearing the "On sale" filter.' : 'No tyres found. Try a different filter.'}
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
