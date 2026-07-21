'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import './pdp.css'
import {
  Breadcrumb, Accordion, FeatureChips, SecureCheckout, WriteReviewBox, FittingFeesCard,
  ExpertCard, SimilarGrid, WhyBand, ReviewsBand, LocationsBand,
  IcoInfo, IcoTruck, IcoMinus, IcoPlus, IcoCart, IcoCheck, IcoZoom, IcoPin, IcoHeadset,
  type SimilarItem, type ReviewCard,
} from './PdpParts'

const BRAND_LOGOS: Record<string, string> = {
  'Black Rhino': '/images/brands/Black Rino.svg',
  'ROH':         '/images/brands/roh.svg',
  'King Wheels': '/images/brands/king-wheels.svg',
  'Sonix':       '/images/brands/sonix.svg',
}

const SIMILAR_WHEELS: SimilarItem[] = [
  { brand: 'Black Rhino', sub: 'Arsenal · 18×9 · 5×114.3',  price: 265, slug: 'black-rhino-arsenal-18x9', image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         sub: 'Terrain · 16×8 · 6×139.7',  price: 195, slug: 'roh-terrain-16x8',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         sub: 'Warrior · 20×9 · 5×150',    price: 295, slug: 'roh-warrior-20x9',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'King Wheels', sub: 'Force · 17×8 · 6×139.7',    price: 185, slug: 'king-force-17x8',           image: '/images/wheel/Wheel 1.png' },
]

const DEMO_REVIEWS: ReviewCard[] = [
  { text: 'Best prices in Melbourne, hands down. Got 4 AWOLs fitted at Springvale — quick, professional, cheaper than anywhere I quoted.', initials: 'SM', name: 'Sarah M.', place: 'Springvale' },
  { text: 'Great fitment advice over the phone before I ordered. Wheels look mint and the balance is spot on.', initials: 'JT', name: 'James T.', place: 'Sefton' },
  { text: 'Ordered online, picked up in Bayswater two days later. Easy process and the staff knew their stuff.', initials: 'LN', name: 'Lena N.', place: 'Bayswater' },
]

interface WheelProduct {
  id: string; brand: string; model: string; description?: string; slug: string
  diameter: number; width: string; pcd: string; offset?: number; bore?: string
  material: string; finish?: string; price: string; compareAtPrice?: string; stockQuantity: number
  images: { url: string; altText?: string; sortOrder: number }[]
  packages: { id: string; name: string; packagePrice: string }[]
}

const money = (n: number) => `A$${n.toFixed(2)}`

export default function WheelProductDetail({ wheel, similar }: { wheel: WheelProduct; similar?: SimilarItem[] }) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'pickup'>('specs')
  const [added,     setAdded]     = useState(false)
  const { addToCart } = useCart()

  const images    = wheel.images.length > 0 ? wheel.images : [{ url: '/images/wheel/Wheel 1.png', altText: wheel.model, sortOrder: 0 }]
  const price     = parseFloat(wheel.price)
  const compare   = wheel.compareAtPrice ? parseFloat(wheel.compareAtPrice) : null
  const inStock   = wheel.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[wheel.brand]
  const offset    = wheel.offset !== undefined ? `ET${wheel.offset > 0 ? '+' : ''}${wheel.offset}` : '—'

  /* Real fitment-based recommendations from the API; fall back to demo picks. */
  const similarItems = similar && similar.length > 0 ? similar : SIMILAR_WHEELS

  function handleAdd() {
    addToCart(
      { id: wheel.slug, productType: 'wheel', brand: wheel.brand, brandLogo: brandLogo ?? '', model: wheel.model,
        size: `${wheel.diameter}"×${wheel.width}`, spec: wheel.pcd, price, image: images[0]?.url ?? '' },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const specs = [
    { label: 'Diameter', value: `${wheel.diameter}"` },
    { label: 'Width',    value: `${wheel.width}J` },
    { label: 'PCD',      value: wheel.pcd },
    { label: 'Offset',   value: offset },
    { label: 'Finish',   value: wheel.finish ?? '—' },
  ]

  return (
    <main className="nova-pdp" style={{ paddingTop: 64 }}>
      <div className="nv-shell pdp">
        <Breadcrumb trail={[
          { label: 'Home', href: '/' },
          { label: 'Wheels', href: '/wheels' },
          { label: wheel.brand, href: '/wheels' },
          { label: wheel.model },
        ]} />

        {/* ── gallery + info ── */}
        <div className="pdp-grid">
          <div className="pdp-colL">
            <div className="pdp-gallery">
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button key={i} type="button" className={`pdp-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <img src={img.url} alt={img.altText ?? wheel.model} />
                  </button>
                ))}
              </div>
              <div className="pdp-stage">
                {wheel.finish && <span className="pdp-stage-badge">{wheel.finish}</span>}
                <img src={images[activeImg]?.url ?? images[0].url} alt={wheel.model} />
                <span className="pdp-stage-zoom"><IcoZoom /></span>
              </div>
            </div>

            <Accordion items={[
              { q: 'Fitment & compatibility', points: [
                <><b>Bolt pattern:</b> {wheel.pcd} · <b>Offset:</b> {offset}</>,
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
              {brandLogo ? <img src={brandLogo} alt={wheel.brand} /> : <span className="brand-fallback">{wheel.brand}</span>}
            </div>
            <h1 className="pdp-title">{wheel.brand} {wheel.model}</h1>
            <div className="pdp-rate">
              <span className="stars">★★★★★</span>
              <span className="rate-num">4.8</span>
              <a href="#storeReviews">· 126 reviews</a>
            </div>

            <div className="pdp-specs">
              {specs.map(s => (
                <div className="pdp-spec" key={s.label}>
                  <span className="sp-label"><IcoInfo />{s.label}</span>
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
                <button type="button" onClick={() => setQty(q => Math.min(8, q + 1))} disabled={qty >= 8} aria-label="Increase"><IcoPlus /></button>
              </div>
              <button className="pdp-add" type="button" onClick={handleAdd} disabled={!inStock}>
                {added ? <IcoCheck /> : <IcoCart />}
                {added ? 'Added to cart' : <>Add to cart — {money(price * qty)}</>}
              </button>
            </div>
            <Link className="pdp-buynow" href="/cart">Buy now — checkout in one step</Link>
            <p className="pdp-maxnote">Sold per wheel · fitting &amp; balancing available in-store</p>

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
              <p>{wheel.description ?? `The ${wheel.brand} ${wheel.model} is a premium alloy wheel built for both performance and style — engineered with high-strength alloy for durability without compromising on weight.`}</p>
              <p>Every wheel is hub-centric, fully pressure-tested and finished with a durable powder coat. Pair it with your choice of rubber and we&apos;ll fit and balance it at any Nova Tyres workshop.</p>
            </div>

            <div className={`pdp-tabpanel${activeTab === 'specs' ? ' active' : ''}`}>
              <table className="spec-table">
                <thead><tr><th>Specifications</th><th>Details</th></tr></thead>
                <tbody>
                  <tr><td>Brand</td><td>{wheel.brand}</td></tr>
                  <tr><td>Model</td><td>{wheel.model}</td></tr>
                  <tr><td>Diameter</td><td>{wheel.diameter}&quot;</td></tr>
                  <tr><td>Width</td><td>{wheel.width}J</td></tr>
                  <tr><td>PCD / Bolt pattern</td><td>{wheel.pcd}</td></tr>
                  <tr><td>Offset</td><td>{offset}</td></tr>
                  {wheel.bore && <tr><td>Bore</td><td>{wheel.bore}mm</td></tr>}
                  <tr><td>Material</td><td>{wheel.material}</td></tr>
                  <tr><td>Finish</td><td>{wheel.finish ?? '—'}</td></tr>
                </tbody>
              </table>

              <div className="pdp-help">
                <span className="help-ico"><IcoHeadset /></span>
                <div>
                  <h4>Need help choosing the right wheel?</h4>
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
            <ExpertCard kind="wheel" />
          </div>
        </div>

        <SimilarGrid title="Similar wheels you may like" basePath="wheels" items={similarItems} />
        <WhyBand />
        <ReviewsBand avg={4.8} count="1,240+" reviews={DEMO_REVIEWS} />
        <LocationsBand kind="wheels" />
      </div>
    </main>
  )
}
