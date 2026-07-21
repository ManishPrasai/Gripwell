'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import Link from 'next/link'
import { useCart, DEFAULT_TYRE_QTY, MAX_TYRES_PER_ORDER } from '../../context/CartContext'
import './pdp.css'
import {
  Breadcrumb, Accordion, FeatureChips, SecureCheckout, WriteReviewBox, FittingFeesCard,
  ExpertCard, SimilarGrid, WhyBand, ReviewsBand, LocationsBand,
  IcoTruck, IcoMinus, IcoPlus, IcoCart, IcoCheck, IcoZoom, IcoPin, IcoHeadset,
  IcoWidth, IcoProfile, IcoRim, IcoSpeed, IcoLoad,
  type SimilarItem, type ReviewCard,
} from './PdpParts'

const BRAND_LOGOS: Record<string, string> = {
  Continental: '/images/brands/continental.svg',
  Hankook:     '/images/brands/hankook.svg',
  Pirelli:     '/images/brands/pirelli.svg',
  Maxxis:      '/images/brands/maxxis.svg',
  Yokohama:    '/images/brands/yokohama.svg',
  Michelin:    '/images/brands/michelin.svg',
}

const SIMILAR_TYRES: SimilarItem[] = [
  { brand: 'Michelin', sub: 'Pilot Sport 4 · 245/45R18 · 100Y', price: 185, slug: 'michelin-pilot-sport-4',   image: '/images/tyres/Tyre 1.png' },
  { brand: 'Hankook',  sub: 'Ventus S1 · 245/45R18 · 100Y',     price: 165, slug: 'hankook-ventus-s1',        image: '/images/tyres/Tyre 1.png' },
  { brand: 'Pirelli',  sub: 'P Zero · 245/45R18 · 100Y',        price: 210, slug: 'pirelli-p-zero',           image: '/images/tyres/Tyre 1.png' },
  { brand: 'Maxxis',   sub: 'Victra Sport · 245/45R18 · 100Y',  price: 155, slug: 'maxxis-victra-sport',       image: '/images/tyres/Tyre 1.png' },
]

const DEMO_REVIEWS: ReviewCard[] = [
  { text: 'Best prices in Melbourne, hands down. Got 4 fitted at Springvale — quick, professional, cheaper than anywhere I quoted.', initials: 'SM', name: 'Sarah M.', place: 'Springvale' },
  { text: 'Great grip in the wet and noticeably quieter than my old set. Fitting was fast and the staff knew their stuff.', initials: 'JT', name: 'James T.', place: 'Sefton' },
  { text: 'Ordered online, picked up in Bayswater two days later. Easy process from start to finish.', initials: 'LN', name: 'Lena N.', place: 'Bayswater' },
]

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

const money = (n: number) => `A$${n.toFixed(2)}`
const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function TyreProductDetail({ product, similar }: { product: TyreProduct; similar?: SimilarItem[] }) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(DEFAULT_TYRE_QTY)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'pickup'>('specs')
  const [added,     setAdded]     = useState(false)
  const { addToCart, tyreCount }  = useCart()

  const ts        = product.tyreSize
  const images    = product.images.length > 0 ? product.images : [{ url: '/images/tyres/Tyre 1.png', altText: product.model, sortOrder: 0 }]
  const price     = parseFloat(product.price)
  const compare   = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null
  const inStock   = product.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[product.brand]
  const atLimit   = tyreCount >= MAX_TYRES_PER_ORDER
  const sizeStr   = `${ts.width}/${ts.profile}R${ts.rimDiameter}`
  const loadSpeed = `${ts.loadIndex ?? ''}${ts.speedRating ?? ''}` || '—'

  /* Real fitment-based recommendations from the API; fall back to demo picks. */
  const similarItems = similar && similar.length > 0 ? similar : SIMILAR_TYRES

  const avg = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 4.8
  const reviewCount = product.reviews.length > 0 ? product.reviews.length : 126

  const reviewCards: ReviewCard[] = product.reviews.length > 0
    ? product.reviews.slice(0, 3).map(r => ({
        text: r.body ?? 'Great tyre — fitted quickly and priced better than anywhere else I quoted.',
        initials: `${r.customer.firstName[0] ?? ''}${r.customer.lastName[0] ?? ''}`,
        name: `${r.customer.firstName} ${r.customer.lastName}`,
        place: 'Verified Purchase',
      }))
    : DEMO_REVIEWS

  function handleAdd() {
    addToCart(
      { id: product.slug, productType: 'tyre', brand: product.brand, brandLogo: brandLogo ?? '', model: product.model,
        size: sizeStr, spec: ts.speedRating ?? '', price, image: images[0]?.url ?? '' },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const specs = [
    { label: 'Width',   value: ts.width,               icon: <IcoWidth /> },
    { label: 'Profile', value: ts.profile,             icon: <IcoProfile /> },
    { label: 'Rim',     value: `${ts.rimDiameter}"`,   icon: <IcoRim /> },
    { label: 'Speed',   value: ts.speedRating ?? '—',  icon: <IcoSpeed /> },
    { label: 'Load',    value: ts.loadIndex ?? '—',    icon: <IcoLoad /> },
  ]

  return (
    <main className="nova-pdp" style={{ paddingTop: 64 }}>
      <div className="nv-shell pdp">
        <Breadcrumb trail={[
          { label: 'Home', href: '/' },
          { label: 'Tyres', href: '/tyres' },
          { label: product.brand, href: '/tyres' },
          { label: product.model },
        ]} />

        {/* ── gallery + info ── */}
        <div className="pdp-grid">
          <div className="pdp-colL">
            <div className="pdp-gallery">
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button key={i} type="button" className={`pdp-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <img src={img.url} alt={img.altText ?? product.model} />
                  </button>
                ))}
              </div>
              <div className="pdp-stage">
                {product.type && <span className="pdp-stage-badge">{titleCase(product.type)}</span>}
                <img src={images[activeImg]?.url ?? images[0].url} alt={product.model} />
                <span className="pdp-stage-zoom"><IcoZoom /></span>
              </div>
            </div>

            <Accordion items={[
              { q: 'Fitment & compatibility', points: [
                <><b>Size:</b> {sizeStr} · <b>Load / Speed:</b> {loadSpeed}</>,
                <>Not sure? Call any store and we&apos;ll confirm fitment for free.</>,
              ] },
              { q: 'Shipping & pickup', points: [
                <>Free pickup at any of our stores.</>,
                <>Fitting &amp; balancing available in-store — add it at the cart.</>,
                <>Fast shipping Australia-wide.</>,
              ] },
              { q: 'Warranty & returns', points: [
                <>Full manufacturer warranty against defects.</>,
                <>Warranty honoured at every Nova Tyres store.</>,
                <>Questions or claims — just contact your nearest store.</>,
              ] },
            ]} />
          </div>

          <div className="pdp-info">
            <div className="pdp-brand">
              {brandLogo ? <img src={brandLogo} alt={product.brand} /> : <span className="brand-fallback">{product.brand}</span>}
            </div>
            <h1 className="pdp-title">{product.model}</h1>
            <div className="pdp-rate">
              <span className="stars">★★★★★</span>
              <span className="rate-num">{avg.toFixed(1)}</span>
              <a href="#storeReviews">· {reviewCount} reviews</a>
            </div>

            <div className="pdp-specs">
              {specs.map(s => (
                <div className="pdp-spec" key={s.label}>
                  <span className="sp-label">{s.icon}{s.label}</span>
                  <span className="sp-val">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="pdp-status">
              {inStock
                ? <span className="stock-badge"><span className="dot" />In stock</span>
                : <span className="stock-badge out"><span className="dot" />Out of stock</span>}
              <span className="pdp-eta"><IcoTruck />Ships in <b>1–2 business days</b></span>
            </div>

            <div className="pdp-price">
              <span className="amount">{money(price)}</span>
              {compare && <span className="was">{money(compare)}</span>}
            </div>

            <div className="pdp-buy">
              <div className="pdp-qty">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease"><IcoMinus /></button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(MAX_TYRES_PER_ORDER, q + 1))} disabled={qty >= MAX_TYRES_PER_ORDER} aria-label="Increase"><IcoPlus /></button>
              </div>
              <button className="pdp-add" type="button" onClick={handleAdd} disabled={!inStock || atLimit}>
                {added ? <IcoCheck /> : <IcoCart />}
                {atLimit ? `Limit ${MAX_TYRES_PER_ORDER} reached` : added ? 'Added to cart' : <>Add to cart — {money(price * qty)}</>}
              </button>
            </div>
            <Link className="pdp-buynow" href="/cart">Buy now — checkout in one step</Link>

            {atLimit
              ? <p className="pdp-limitnote">You already have {MAX_TYRES_PER_ORDER} tyres in your cart — the maximum per order.</p>
              : tyreCount > 0 && tyreCount + qty > MAX_TYRES_PER_ORDER
                ? <p className="pdp-limitnote">Your cart has {tyreCount} tyre{tyreCount !== 1 ? 's' : ''} — only {MAX_TYRES_PER_ORDER - tyreCount} more can be added.</p>
                : <p className="pdp-maxnote">Maximum {MAX_TYRES_PER_ORDER} tyres per order · default set of {DEFAULT_TYRE_QTY}</p>}

            <FeatureChips />
            <SecureCheckout />
          </div>
        </div>

        {/* ── tabs + aside ── */}
        <div className="pdp-details">
          <div className="pdp-details-main">
            <div className="pdp-tabs">
              <button type="button" className={`pdp-tab${activeTab === 'desc' ? ' active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
              <button type="button" className={`pdp-tab${activeTab === 'specs' ? ' active' : ''}`} onClick={() => setActiveTab('specs')}>Product Details</button>
              <button type="button" className={`pdp-tab${activeTab === 'pickup' ? ' active' : ''}`} onClick={() => setActiveTab('pickup')}>Pickup / Installation</button>
            </div>

            <div className={`pdp-tabpanel${activeTab === 'desc' ? ' active' : ''}`}>
              <p>{product.description ?? `The ${product.brand} ${product.model} is engineered for outstanding all-weather performance, with advanced tread-compound technology for superior wet and dry grip and a comfortable, confident ride.`}</p>
              <p>Fully load- and speed-rated, and finished to exacting standards. Pair it with professional fitting and balancing at any Nova Tyres workshop.</p>
            </div>

            <div className={`pdp-tabpanel${activeTab === 'specs' ? ' active' : ''}`}>
              <table className="spec-table">
                <thead><tr><th>Specifications</th><th>Details</th></tr></thead>
                <tbody>
                  <tr><td>Brand</td><td>{product.brand}</td></tr>
                  <tr><td>Model</td><td>{product.model}</td></tr>
                  <tr><td>Size</td><td>{sizeStr}</td></tr>
                  <tr><td>Width</td><td>{ts.width}</td></tr>
                  <tr><td>Profile</td><td>{ts.profile}</td></tr>
                  <tr><td>Rim</td><td>{ts.rimDiameter}&quot;</td></tr>
                  <tr><td>Speed Rating</td><td>{ts.speedRating ?? '—'}</td></tr>
                  <tr><td>Load Index</td><td>{ts.loadIndex ?? '—'}</td></tr>
                  {product.fuelEfficiencyRating && <tr><td>Fuel Efficiency</td><td>{product.fuelEfficiencyRating}</td></tr>}
                  {product.wetGripRating && <tr><td>Wet Grip</td><td>{product.wetGripRating}</td></tr>}
                  {product.noiseLevelDb && <tr><td>Noise Level</td><td>{product.noiseLevelDb} dB</td></tr>}
                </tbody>
              </table>

              <div className="pdp-help">
                <span className="help-ico"><IcoHeadset /></span>
                <div>
                  <h4>Need help choosing the right tyre?</h4>
                  <p>Not sure this fits your vehicle? Our team can confirm fitment and pick the best option for you.</p>
                  <Link className="help-btn" href="/service?goto=shops"><IcoPin />Choose location</Link>
                </div>
              </div>
            </div>

            <div className={`pdp-tabpanel${activeTab === 'pickup' ? ' active' : ''}`}>
              <p><b>Free in-store pickup</b> from any of our workshops — we&apos;ll notify you the moment your order is ready to collect.</p>
              <p><b>Professional fitting</b> &amp; balancing available at checkout, done while you wait. Choose your store and vehicle type at the cart.</p>
              <p>Australia-wide shipping is dispatched within 1–2 business days.</p>
            </div>
          </div>

          <div className="pdp-details-aside">
            <WriteReviewBox />
            <FittingFeesCard />
            <ExpertCard kind="tyre" />
          </div>
        </div>

        <SimilarGrid title="Similar tyres you may like" basePath="tyres" items={similarItems} />
        <WhyBand />
        <ReviewsBand avg={avg} count="1,240+" reviews={reviewCards} />
        <LocationsBand kind="tyres" />
      </div>
    </main>
  )
}
