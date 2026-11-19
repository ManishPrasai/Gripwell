'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useCart, DEFAULT_TYRE_QTY, MAX_TYRES_PER_ORDER } from '../../context/CartContext'
import './pdp.css'
import {
  Breadcrumb, TrustBadges, Accordion, SimilarGrid,
  PaymentsPanel, PickupPanel, ExpertPanel, FittingPanel,
  type SimilarItem,
} from './PdpParts'
import { money } from '../../../lib/fitting'

/* No manufacturer artwork: every brand renders as a text wordmark. */
const BRAND_LOGOS: Record<string, string> = {}

const SIMILAR_TYRES: SimilarItem[] = [
  { brand: 'Veltex', sub: 'Velocity 4',     price: 185, slug: 'veltex-velocity-4', image: '/images/tyres/tyre-neutral.png' },
  { brand: 'Kova',  sub: 'Apex S1',        price: 165, slug: 'kova-apex-s1',      image: '/images/tyres/tyre-neutral.png' },
  { brand: 'Corsaro',  sub: 'Strada',         price: 210, slug: 'corsaro-strada',         image: '/images/tyres/tyre-neutral.png' },
  { brand: 'Terrain X',   sub: 'Velo Sport',     price: 155, slug: 'terrain-x-velo-sport',    image: '/images/tyres/tyre-neutral.png' },
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

const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function TyreProductDetail({ product, similar }: { product: TyreProduct; similar?: SimilarItem[] }) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(DEFAULT_TYRE_QTY)
  const [added,     setAdded]     = useState(false)
  const { addToCart, tyreCount }  = useCart()

  const ts        = product.tyreSize
  const images    = product.images.length > 0 ? product.images : [{ url: '/images/tyres/tyre-neutral.png', altText: product.model, sortOrder: 0 }]
  const price     = parseFloat(product.price)
  const inStock   = product.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[product.brand]
  const atLimit   = tyreCount >= MAX_TYRES_PER_ORDER
  const sizeStr   = `${ts.width}/${ts.profile}R${ts.rimDiameter}`
  const loadSpeed = `${ts.loadIndex ?? ''}${ts.speedRating ?? ''}` || '—'

  /* Real fitment-based recommendations from the API; fall back to demo picks. */
  const similarItems = similar && similar.length > 0 ? similar : SIMILAR_TYRES

  const reviewCount = product.reviews.length
  const avg = reviewCount > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0


  function handleAdd() {
    addToCart(
      { id: product.slug, productType: 'tyre', brand: product.brand, brandLogo: brandLogo ?? '', model: product.model,
        size: sizeStr, spec: ts.speedRating ?? '', price, image: images[0]?.url ?? '' },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <main className="nova-pdp" style={{ paddingTop: 64 }}>
      <div className="nv-shell pdp">
        <Breadcrumb trail={[
          { label: 'Home', href: '/' },
          { label: 'Tyres', href: '/tyres' },
          { label: product.brand, href: '/tyres/results' },
          { label: `${product.model} ${sizeStr}` },
        ]} />

        <div className="pdp-grid">
          {/* ── left: photo, trust pills, description, details ── */}
          <div className="pdp-colL">
            <div className="pdp-hero">
              <img src={images[activeImg]?.url ?? images[0].url} alt={images[activeImg]?.altText ?? product.model} />
            </div>

            {images.length > 1 && (
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button key={i} type="button" className={`pdp-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <img src={img.url} alt={img.altText ?? product.model} />
                  </button>
                ))}
              </div>
            )}

            <TrustBadges />

            <section className="pdp-block">
              <h2>Description</h2>
              <p>{product.description ?? `The ${product.brand} ${product.model} is engineered for outstanding all-weather performance, with advanced tread-compound technology for superior wet and dry grip and a comfortable, confident ride.`}</p>
              <ul className="pdp-feats">
                <li>Confident grip in wet and dry conditions</li>
                <li>Low road noise for everyday comfort</li>
                <li>Even-wearing tread compound</li>
                <li>Fitted and balanced at any Gripwell store</li>
              </ul>
            </section>

            <section className="pdp-block">
              <h2>Details</h2>
              <dl className="pdp-rows">
                <div><dt>Brand</dt><dd>{product.brand}</dd></div>
                <div><dt>Pattern</dt><dd>{product.model}</dd></div>
                <div><dt>Size</dt><dd>{sizeStr}</dd></div>
                <div><dt>Load / speed rating</dt><dd>{loadSpeed}</dd></div>
                {product.type && <div><dt>Type</dt><dd>{titleCase(product.type)}</dd></div>}
                {product.fuelEfficiencyRating && <div><dt>Fuel efficiency</dt><dd>{product.fuelEfficiencyRating}</dd></div>}
                {product.wetGripRating && <div><dt>Wet grip</dt><dd>{product.wetGripRating}</dd></div>}
                {product.noiseLevelDb && <div><dt>Noise level</dt><dd>{product.noiseLevelDb} dB</dd></div>}
                <div><dt>Warranty</dt><dd>Full manufacturer</dd></div>
              </dl>
            </section>
          </div>

          {/* ── right: title, buy box, accordions ── */}
          <div className="pdp-colR">
            {brandLogo ? (
              <img src={brandLogo} alt={`${product.brand} logo`} className="pdp-brand-logo" />
            ) : (
              <span className="pdp-brand-text">{product.brand}</span>
            )}
            {product.type && <span className="pdp-category">{titleCase(product.type)}</span>}
            <h1 className="pdp-title">{product.model}</h1>
            <div className="pdp-rate">
              {reviewCount > 0 && (
                <>
                  <span className="stars" aria-hidden="true">★★★★★</span>
                  <span className="count"><b>{avg.toFixed(1)}</b> ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                </>
              )}
              <span className="spec">{sizeStr}{loadSpeed !== '—' ? ` · ${loadSpeed}` : ''}</span>
            </div>

            <div className="pdp-buybox">
              <div className="pdp-price">
                <span className="amount">{money(price)}</span>
              </div>
              <div className="pdp-per">per tyre · VAT included</div>
              <div className={`pdp-stock${inStock ? '' : ' out'}`}>
                {inStock ? '● In stock — fitted same day, or ready for pickup' : '● Out of stock'}
              </div>

              <div className="pdp-qtyrow">
                <div className="pdp-qty">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1} aria-label="One less tyre">−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(MAX_TYRES_PER_ORDER, q + 1))}
                    disabled={qty >= MAX_TYRES_PER_ORDER} aria-label="One more tyre">+</button>
                </div>
                <div className="pdp-total">Total <b>{money(price * qty)}</b></div>
              </div>

              <button className="pdp-add" type="button" onClick={handleAdd} disabled={!inStock || atLimit}>
                {atLimit ? `Limit ${MAX_TYRES_PER_ORDER} reached` : added ? 'Added to cart' : 'Add to cart'}
              </button>

              {atLimit
                ? <p className="pdp-limitnote">You already have {MAX_TYRES_PER_ORDER} tyres in your cart — the maximum per order.</p>
                : tyreCount > 0 && tyreCount + qty > MAX_TYRES_PER_ORDER
                  ? <p className="pdp-limitnote">Your cart has {tyreCount} tyre{tyreCount !== 1 ? 's' : ''} — only {MAX_TYRES_PER_ORDER - tyreCount} more can be added.</p>
                  : null}

              <div className="pdp-fitnote">
                <b>Fitted at your local store</b> — usually same day, under an hour ·{' '}
                <a href="/#locations">All stores →</a>
              </div>
            </div>

            <Accordion initial={1} items={[
              { title: 'Payment methods accepted', body: <PaymentsPanel /> },
              { title: 'Pickup & Installation',    body: <PickupPanel /> },
              { title: 'Talk to a tyre expert',    body: <ExpertPanel kind="tyre" /> },
              { title: 'Fitting at our stores',    body: <FittingPanel /> },
            ]} />
          </div>
        </div>

        <SimilarGrid title="Similar tyres" basePath="tyres" items={similarItems} />
      </div>
    </main>
  )
}
