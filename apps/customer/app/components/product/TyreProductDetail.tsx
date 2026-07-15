'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useCart, DEFAULT_TYRE_QTY, MAX_TYRES_PER_ORDER } from '../../context/CartContext'

interface MapStore {
  id:      string
  name:    string
  address: string
  suburb:  string
  lat:     number
  lng:     number
}

const StoreMap = dynamic(() => import('../locations/StoreMap'), { ssr: false })

/* ── Similar tyres demo data ─────────────────────────────────────────────── */
const SIMILAR = [
  { brand: 'Michelin', brandLogo: '/images/brands/continental.svg', model: 'Pilot Sport 4', size: '245/45R18', spec: '100Y', price: 185, slug: 'michelin-pilot-sport-4', image: '/images/tyres/Tyre 1.png' },
  { brand: 'Michelin', brandLogo: '/images/brands/continental.svg', model: 'Pilot Sport 4', size: '245/45R18', spec: '100Y', price: 185, slug: 'michelin-pilot-sport-4-2', image: '/images/tyres/Tyre 1.png' },
  { brand: 'Michelin', brandLogo: '/images/brands/continental.svg', model: 'Pilot Sport 4', size: '245/45R18', spec: '100Y', price: 185, slug: 'michelin-pilot-sport-4-3', image: '/images/tyres/Tyre 1.png' },
  { brand: 'Michelin', brandLogo: '/images/brands/continental.svg', model: 'Pilot Sport 4', size: '245/45R18', spec: '100Y', price: 185, slug: 'michelin-pilot-sport-4-4', image: '/images/tyres/Tyre 1.png' },
]

const BRAND_LOGOS: Record<string, string> = {
  Continental: '/images/brands/continental.svg',
  Hankook:     '/images/brands/hankook.svg',
  Pirelli:     '/images/brands/pirelli.svg',
  Maxxis:      '/images/brands/maxxis.svg',
  Yokohama:    '/images/brands/yokohama.svg',
}

const PAYMENT_LOGOS = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

/* ── Types ───────────────────────────────────────────────────────────────── */
interface TyreProduct {
  id: string; brand: string; model: string; description?: string; type: string
  price: string; compareAtPrice?: string; stockQuantity: number
  isBestSeller: boolean; isFeatured: boolean
  fuelEfficiencyRating?: string; wetGripRating?: string; noiseLevelDb?: number
  slug: string
  tyreSize: { width: number; profile: number; rimDiameter: number; loadIndex?: number; speedRating?: string; construction?: string }
  images: { url: string; altText?: string; sortOrder: number }[]
  reviews: { id: string; rating: number; title?: string; body?: string; createdAt: string; customer: { firstName: string; lastName: string } }[]
}

/* ── Stars helper ────────────────────────────────────────────────────────── */
function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <i key={i} className="ti ti-star-filled" style={{ fontSize: `${size}px`, color: i <= n ? '#F5A623' : '#E0E0E0' }} aria-hidden="true" />
      ))}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function TyreProductDetail({ product }: { product: TyreProduct }) {
  const [activeImg,  setActiveImg]  = useState(0)
  // A full set of 4 is what most customers want — preselect it.
  const [qty,        setQty]        = useState(DEFAULT_TYRE_QTY)
  const [activeTab,  setActiveTab]  = useState<'description' | 'details' | 'pickup'>('details')
  const [addedMsg,   setAddedMsg]   = useState(false)
  const [stores,       setStores]       = useState<MapStore[]>([])
  const [storeSearch,  setStoreSearch]  = useState('')
  const [selectedStore, setSelectedStore] = useState<MapStore | null>(null)
  const { addToCart, tyreCount } = useCart()

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(data => {
        const mapped: MapStore[] = (data.stores ?? [])
          .filter((s: { latitude?: number; longitude?: number }) => s.latitude && s.longitude)
          .map((s: { id: string; name: string; address: string; suburb: string; state: string; postcode: string; latitude: number; longitude: number }) => ({
            id:      s.id,
            name:    s.name,
            address: s.address,
            suburb:  `${s.suburb} ${s.state} ${s.postcode}`,
            lat:     s.latitude,
            lng:     s.longitude,
          }))
        setStores(mapped)
        if (mapped.length) setSelectedStore(mapped[0])
      })
      .catch(() => {})
  }, [])

  const images  = product.images.length > 0 ? product.images : [{ url: '/images/tyres/Tyre 1.png', altText: product.model, sortOrder: 0 }]
  const price   = parseFloat(product.price)
  const compare = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null
  const inStock = product.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[product.brand]
  const atTyreLimit = tyreCount >= MAX_TYRES_PER_ORDER

  function handleAddToCart() {
    // One call for the whole quantity — this used to loop, firing an API
    // request per tyre. The cart clamps to MAX_TYRES_PER_ORDER.
    addToCart(
      { id: product.slug, productType: 'tyre', brand: product.brand, brandLogo: brandLogo ?? '', model: product.model, size: `${ts.width}/${ts.profile}R${ts.rimDiameter}`, spec: ts.speedRating ?? '', price, image: images[0]?.url ?? '' },
      qty,
    )
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 4.8

  const { tyreSize: ts } = product

  const filteredStores = useMemo(() => {
    const q = storeSearch.trim().toLowerCase()
    if (!q) return stores
    return stores.filter(s =>
      s.name.toLowerCase().includes(q) || s.suburb.toLowerCase().includes(q)
    )
  }, [stores, storeSearch])

  return (
    <main style={{ background: '#fff', paddingTop: '100px' }}>
      <div className="nv-shell" style={{ paddingTop: '32px', paddingBottom: '32px' }}>

        {/* ══════════════════════════════════════════════════
            TOP: image gallery + product info
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start" style={{ marginBottom: '48px' }}>

          {/* Image gallery */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Thumbnails column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '72px' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: '68px', height: '68px', borderRadius: '8px', overflow: 'hidden',
                    border: `2px solid ${activeImg === i ? '#E8572A' : '#E0E0E0'}`,
                    background: '#F8F8F8', padding: '4px', cursor: 'pointer', flexShrink: 0,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Image src={img.url} alt={img.altText ?? product.model} width={60} height={60} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </button>
              ))}
            </div>

            {/* Main image with nav arrows */}
            <div style={{ flex: 1, position: 'relative', background: '#F8F8F8', borderRadius: '14px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src={images[activeImg]?.url ?? images[0].url} alt={product.model} fill style={{ objectFit: 'contain', padding: '24px' }} sizes="500px" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-chevron-left" style={{ fontSize: '16px', color: '#555' }} aria-hidden="true" />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % images.length)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-chevron-right" style={{ fontSize: '16px', color: '#555' }} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product info */}
          <div>
            {/* Brand logo */}
            {brandLogo && (
              <div style={{ marginBottom: '12px' }}>
                <Image src={brandLogo} alt={product.brand} width={120} height={32} style={{ objectFit: 'contain', height: '28px', width: 'auto' }} />
              </div>
            )}
            {!brandLogo && <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '18px', color: '#E8572A', marginBottom: '8px' }}>{product.brand}</p>}

            {/* Name */}
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '28px', color: '#1A1A1A', marginBottom: '16px', lineHeight: 1.2 }}>
              {product.model}
            </h1>

            {/* Quick spec row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', border: '1px solid #EBEBEB', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                { label: 'Width', value: ts.width },
                { label: 'Profile', value: ts.profile },
                { label: 'Rim', value: ts.rimDiameter },
                { label: 'Speed Rating', value: ts.speedRating ?? '—' },
                { label: 'Load Index', value: ts.loadIndex ?? '—' },
              ].map((s, i, arr) => (
                <div key={s.label} style={{ flex: '1 1 auto', padding: '10px 14px', borderRight: i < arr.length - 1 ? '1px solid #EBEBEB' : 'none', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                    <i className="ti ti-info-circle" style={{ fontSize: '12px', color: '#aaa' }} aria-hidden="true" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Stock + price */}
            <div style={{ marginBottom: '16px' }}>
              {inStock ? (
                <span style={{ display: 'inline-block', background: '#E8F5EC', color: '#1A7A3C', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  In Stock
                </span>
              ) : (
                <span style={{ display: 'inline-block', background: '#FEECEC', color: '#C0392B', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px' }}>
                  Out of Stock
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '32px', color: '#E8572A' }}>
                  A${price.toFixed(2)}
                </p>
                {compare && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '18px', color: '#aaa', textDecoration: 'line-through' }}>
                    A${compare.toFixed(2)}
                  </p>
                )}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888', marginTop: '2px' }}>
                Maximum {MAX_TYRES_PER_ORDER} tyres per order
              </p>
            </div>

            {/* Qty + Add to Cart */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #D5D5D5', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity" style={{ width: '40px', height: '48px', background: '#F5F5F5', border: 'none', cursor: qty <= 1 ? 'not-allowed' : 'pointer', fontSize: '20px', color: qty <= 1 ? '#BBB' : '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: '44px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: '#1A1A1A' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(MAX_TYRES_PER_ORDER, q + 1))} disabled={qty >= MAX_TYRES_PER_ORDER} aria-label="Increase quantity" style={{ width: '40px', height: '48px', background: '#F5F5F5', border: 'none', cursor: qty >= MAX_TYRES_PER_ORDER ? 'not-allowed' : 'pointer', fontSize: '20px', color: qty >= MAX_TYRES_PER_ORDER ? '#BBB' : '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!inStock || atTyreLimit}
                style={{ flex: 1, height: '48px', background: inStock && !atTyreLimit ? '#E8572A' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px', cursor: inStock && !atTyreLimit ? 'pointer' : 'not-allowed', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseOver={e => { if (inStock && !atTyreLimit) e.currentTarget.style.opacity = '0.88' }}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <i className={addedMsg ? 'ti ti-check' : 'ti ti-shopping-cart'} style={{ fontSize: '16px' }} aria-hidden="true" />
                {atTyreLimit ? `Limit ${MAX_TYRES_PER_ORDER} tyres reached` : addedMsg ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Cart already holds tyres — say what's actually addable, so the
                button never silently clamps. */}
            {tyreCount > 0 && !atTyreLimit && tyreCount + qty > MAX_TYRES_PER_ORDER && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: '#C0431B', marginTop: '-8px', marginBottom: '16px' }}>
                Your cart has {tyreCount} tyre{tyreCount !== 1 ? 's' : ''} — only {MAX_TYRES_PER_ORDER - tyreCount} more can be added (max {MAX_TYRES_PER_ORDER} per order).
              </p>
            )}
            {atTyreLimit && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: '#C0431B', marginTop: '-8px', marginBottom: '16px' }}>
                You already have {MAX_TYRES_PER_ORDER} tyres in your cart — the maximum per order.
              </p>
            )}

            {/* Feature pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { icon: 'ti-truck-delivery', label: 'Fast Delivery' },
                { icon: 'ti-map-pin',        label: 'Multiple Fitting Locations Available' },
                { icon: 'ti-headphones',     label: 'Expert Support' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F5F5F5', borderRadius: '6px', padding: '6px 12px' }}>
                  <i className={`ti ${f.icon}`} style={{ fontSize: '14px', color: '#1A1A1A' }} aria-hidden="true" />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Secure checkout */}
            <div style={{ border: '1px solid #EBEBEB', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <i className="ti ti-lock" style={{ fontSize: '16px', color: '#076330' }} aria-hidden="true" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#1A1A1A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secure Checkout</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888' }}>Powered By</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PAYMENT_LOGOS.map(p => (
                  <div key={p.name} style={{ background: '#F8F8F8', borderRadius: '4px', padding: '3px 8px', height: '26px', display: 'flex', alignItems: 'center' }}>
                    <Image src={p.src} alt={p.name} width={40} height={16} style={{ objectFit: 'contain', height: '14px', width: 'auto' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TABS: Description / Product Details / Pickup
        ══════════════════════════════════════════════════ */}
        <div style={{ borderBottom: '2px solid #EBEBEB', display: 'flex', gap: '0', marginBottom: '0' }}>
          {(['description', 'details', 'pickup'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{
                padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px',
                color: activeTab === t ? '#1A1A1A' : '#999',
                borderBottom: activeTab === t ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: '-2px', transition: 'color 0.2s',
              }}
            >
              {t === 'description' ? 'Description' : t === 'details' ? 'Product Details' : 'Pickup/Installation'}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px 0 40px', borderBottom: '1px solid #EBEBEB' }}>
          {activeTab === 'description' && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#555', lineHeight: 1.75, maxWidth: '720px' }}>
              {product.description ?? `The ${product.brand} ${product.model} is engineered for outstanding all-weather performance. Featuring advanced tread compound technology for superior wet and dry grip, this tyre delivers a comfortable and confident driving experience.`}
            </p>
          )}

          {activeTab === 'details' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ background: '#076330', borderRadius: '8px 8px 0 0', padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Specifications</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Details</span>
              </div>
              {[
                { label: 'Brand',        value: product.brand },
                { label: 'Profile',      value: ts.profile },
                { label: 'Width',        value: ts.width },
                { label: 'Rim',          value: ts.rimDiameter },
                { label: 'Speed Rating', value: ts.speedRating ?? '—' },
                { label: 'Load Index',   value: ts.loadIndex ?? '—' },
                ...(product.fuelEfficiencyRating ? [{ label: 'Fuel Efficiency', value: product.fuelEfficiencyRating }] : []),
                ...(product.wetGripRating ? [{ label: 'Wet Grip', value: product.wetGripRating }] : []),
                ...(product.noiseLevelDb ? [{ label: 'Noise Level', value: `${product.noiseLevelDb} dB` }] : []),
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 20px', background: i % 2 === 0 ? '#fff' : '#F9F9F9', borderLeft: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#1A1A1A', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pickup' && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#555', lineHeight: 1.7, marginBottom: '16px' }}>
                Fitting and installation is available at all 9 Nova Tyres locations across Australia. Once you add to cart, select your preferred store and book a fitting time that suits you.
              </p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {['Springvale — VIC','Dandenong — VIC','Alphington — VIC','Bayswater — VIC','Sunshine — VIC','Geelong — VIC','Sefton — NSW','Brisbane — QLD','Adelaide — SA'].map(loc => (
                  <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1px solid #EBEBEB', borderRadius: '8px' }}>
                    <i className="ti ti-map-pin" style={{ fontSize: '16px', color: '#076330' }} aria-hidden="true" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{loc}</span>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#E8F5EC', color: '#1A7A3C', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                      <i className="ti ti-check" style={{ fontSize: '10px' }} /> Available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Need help CTA */}
        <div style={{ margin: '32px 0', background: '#F8F8F8', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <i className="ti ti-headphones" style={{ fontSize: '40px', color: '#1A1A1A', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '16px', color: '#1A1A1A', marginBottom: '4px' }}>Need help choosing the right tyre?</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888' }}>Not sure if this tyre is right for your vehicle? Our team can help you pick the best option.</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#076330', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
            <i className="ti ti-map-pin" style={{ fontSize: '15px' }} aria-hidden="true" />
            Choose Location
            <i className="ti ti-chevron-down" style={{ fontSize: '13px' }} aria-hidden="true" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            SIMILAR TYRES
        ══════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: '#1A1A1A', marginBottom: '20px' }}>Similar Tyres You May Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {SIMILAR.map((s, i) => (
              <div key={i} style={{ border: '1px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#F8F8F8', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', position: 'relative' }}>
                  <Image src={s.image} alt={s.model} fill style={{ objectFit: 'contain', padding: '12px' }} sizes="25vw" />
                </div>
                <div style={{ padding: '14px' }}>
                  <Image src={s.brandLogo} alt={s.brand} width={80} height={20} style={{ objectFit: 'contain', height: '16px', width: 'auto', marginBottom: '6px' }} />
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '2px' }}>{s.model}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888', marginBottom: '10px' }}>{s.size} {s.spec}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#E8572A', marginBottom: '10px' }}>A${s.price.toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/tyres/${s.slug}`} style={{ flex: 1, background: '#1A1A1A', color: '#fff', borderRadius: '6px', padding: '8px', textAlign: 'center', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      VIEW DETAILS
                    </Link>
                    <button style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid #E0E0E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-shopping-cart" style={{ fontSize: '14px', color: '#E8572A' }} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            WHY CHOOSE NOVA TYRES banner
        ══════════════════════════════════════════════════ */}
        <div style={{ background: '#0F2218', borderRadius: '14px', padding: '28px 32px', marginBottom: '48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <p style={{ gridColumn: '1 / -1', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Why Choose Nova Tyres?</p>
          {[
            { icon: 'ti-building-warehouse', title: 'Warehouse Direct Pricing', desc: 'The best brands at the best price' },
            { icon: 'ti-headphones',         title: 'Expert Support',           desc: "We're here to help you choose" },
            { icon: 'ti-truck-delivery',     title: 'Fast & Reliable',          desc: 'Quick delivery' },
            { icon: 'ti-star-filled',        title: 'Trusted by 1,240+ Drivers', desc: 'Rated 4.8' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: '32px', color: '#E8572A' }} aria-hidden="true" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff', lineHeight: 1.3 }}>{f.title}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '56px', color: '#1A1A1A', lineHeight: 1 }}>{avgRating.toFixed(1)}</p>
              <Stars n={Math.round(avgRating)} size={18} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', marginTop: '4px' }}>Based on 1,240+ reviews</p>
              <button style={{ marginTop: '10px', background: '#076330', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                Write a Review
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
              {(product.reviews.length > 0 ? product.reviews : []).slice(0, 3).map((r, i) => (
                <div key={r.id ?? i} style={{ flex: '1 1 220px', border: '1px solid #F0F0F0', borderRadius: '10px', padding: '16px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Stars n={r.rating} />
                    <i className="ti ti-brand-google" style={{ fontSize: '18px', color: '#4285F4' }} aria-hidden="true" />
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#444', lineHeight: 1.6, marginBottom: '12px' }}>
                    "{r.body ?? 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.'}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E8572A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px' }}>
                      {r.customer.firstName[0]}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>{r.customer.firstName} {r.customer.lastName}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#888' }}>Verified Purchase</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STORE LOCATOR
        ══════════════════════════════════════════════════ */}
        <div style={{ background: '#1C3A2B', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'stretch' }}>
            {/* Left: store list */}
            <div style={{ padding: '28px 24px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '11px', color: '#E8572A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Our Locations</p>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: '#fff', lineHeight: 1.2, marginBottom: '20px' }}>
                Multiple Stores <span style={{ color: '#E8572A', fontStyle: 'italic' }}>one phone call</span> away for new tyres.
              </h2>
              <div style={{ display: 'flex', marginBottom: '16px', gap: '8px' }}>
                <input
                  placeholder="Search suburb or store..."
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ maxHeight: '280px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredStores.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStore(s)}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', width: '100%',
                      background: selectedStore?.id === s.id ? 'rgba(232,87,42,0.18)' : 'rgba(255,255,255,0.06)',
                      border: selectedStore?.id === s.id ? '1px solid rgba(232,87,42,0.4)' : '1px solid transparent',
                    }}
                  >
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff', marginBottom: '2px' }}>{s.name}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{s.address}, {s.suburb}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Right: interactive Leaflet map */}
            <div style={{ minHeight: '400px', position: 'relative' }}>
              <StoreMap stores={filteredStores} selectedStore={selectedStore} onSelectStore={setSelectedStore} />
            </div>
          </div>
        </div>

        {/* Write a review bar */}
        <div style={{ background: '#F8F8F8', borderRadius: '10px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1A1A1A' }}>Write a review</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input placeholder="Say something about this product..." style={{ flex: 1, minWidth: '280px', border: '1px solid #D5D5D5', borderRadius: '6px', padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', outline: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: '#555' }}>Share</span>
              <i className="ti ti-brand-facebook" style={{ fontSize: '22px', color: '#1877F2' }} aria-hidden="true" />
              <i className="ti ti-brand-instagram" style={{ fontSize: '22px', color: '#E1306C' }} aria-hidden="true" />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
