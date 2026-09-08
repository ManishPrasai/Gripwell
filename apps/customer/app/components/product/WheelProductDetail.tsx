'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { STORES } from '../../../lib/stores'
import './pdp.css'
import {
  Breadcrumb, TrustBadges, Accordion, SimilarGrid,
  PaymentsPanel, PickupPanel, ExpertPanel, FittingPanel, ReviewPanel,
  type SimilarItem,
} from './PdpParts'

const BRAND_LOGOS: Record<string, string> = {
  'Black Rhino': '/images/brands/Black Rino.svg',
  'ROH':         '/images/brands/roh.svg',
  'King Wheels': '/images/brands/king-wheels.svg',
  'Sonix':       '/images/brands/sonix.svg',
}

const SIMILAR_WHEELS: SimilarItem[] = [
  { brand: 'Black Rhino', sub: 'Arsenal 18×9',  price: 265, slug: 'black-rhino-arsenal-18x9', image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         sub: 'Terrain 16×8',  price: 195, slug: 'roh-terrain-16x8',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         sub: 'Warrior 20×9',  price: 295, slug: 'roh-warrior-20x9',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'King Wheels', sub: 'Force 17×8',    price: 185, slug: 'king-force-17x8',          image: '/images/wheel/Wheel 1.png' },
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
  const [added,     setAdded]     = useState(false)
  const { addToCart } = useCart()

  const images    = wheel.images.length > 0 ? wheel.images : [{ url: '/images/wheel/Wheel 1.png', altText: wheel.model, sortOrder: 0 }]
  const price     = parseFloat(wheel.price)
  const inStock   = wheel.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[wheel.brand]
  const offset    = wheel.offset !== undefined ? `ET${wheel.offset > 0 ? '+' : ''}${wheel.offset}` : '—'
  const sizeStr   = `${wheel.diameter}″ × ${wheel.width}J`

  /* Real fitment-based recommendations from the API; fall back to demo picks. */
  const similarItems = similar && similar.length > 0 ? similar : SIMILAR_WHEELS

  const nearby     = STORES.slice(0, 4).map(s => s.short).join(', ')
  const extraCount = STORES.length - 4

  function handleAdd() {
    addToCart(
      { id: wheel.slug, productType: 'wheel', brand: wheel.brand, brandLogo: brandLogo ?? '', model: wheel.model,
        size: `${wheel.diameter}"×${wheel.width}`, spec: wheel.pcd, price, image: images[0]?.url ?? '' },
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
          { label: 'Wheels', href: '/wheels' },
          { label: wheel.brand, href: '/wheels/results' },
          { label: `${wheel.model} ${sizeStr}` },
        ]} />

        <div className="pdp-grid">
          {/* ── left: photo, trust pills, description, details ── */}
          <div className="pdp-colL">
            <div className="pdp-hero">
              <img src={images[activeImg]?.url ?? images[0].url} alt={images[activeImg]?.altText ?? wheel.model} />
            </div>

            {images.length > 1 && (
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button key={i} type="button" className={`pdp-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <img src={img.url} alt={img.altText ?? wheel.model} />
                  </button>
                ))}
              </div>
            )}

            <TrustBadges />

            <section className="pdp-block">
              <h2>Description</h2>
              <p>{wheel.description ?? `The ${wheel.brand} ${wheel.model} is a premium alloy wheel built for both performance and style — engineered with high-strength alloy for durability without compromising on weight.`}</p>
              <ul className="pdp-feats">
                <li>Hub-centric fit for a vibration-free ride</li>
                <li>Fully pressure-tested for strength</li>
                <li>Durable powder-coat finish</li>
                <li>Fitted and balanced at any Nova store</li>
              </ul>
            </section>

            <section className="pdp-block">
              <h2>Details</h2>
              <dl className="pdp-rows">
                <div><dt>Brand</dt><dd>{wheel.brand}</dd></div>
                <div><dt>Model</dt><dd>{wheel.model}</dd></div>
                <div><dt>Diameter</dt><dd>{wheel.diameter}″</dd></div>
                <div><dt>Width</dt><dd>{wheel.width}J</dd></div>
                <div><dt>PCD / bolt pattern</dt><dd>{wheel.pcd}</dd></div>
                <div><dt>Offset</dt><dd>{offset}</dd></div>
                {wheel.bore && <div><dt>Bore</dt><dd>{wheel.bore}mm</dd></div>}
                <div><dt>Material</dt><dd>{wheel.material}</dd></div>
                <div><dt>Finish</dt><dd>{wheel.finish ?? '—'}</dd></div>
                <div><dt>Warranty</dt><dd>Full manufacturer</dd></div>
              </dl>
            </section>
          </div>

          {/* ── right: title, buy box, accordions ── */}
          <div className="pdp-colR">
            <span className="pdp-kicker">
              {wheel.brand}{wheel.finish ? ` · ${wheel.finish}` : ''}
            </span>
            <h1 className="pdp-title">{wheel.model}</h1>
            <div className="pdp-rate">
              <span className="stars">★★★★★</span>
              <span className="count"><b>4.8</b> (126 reviews)</span>
              <span className="spec">{sizeStr} · {wheel.pcd}</span>
            </div>

            <div className="pdp-buybox">
              <div className="pdp-price">
                <span className="amount">{money(price)}</span>
              </div>
              <div className="pdp-per">per wheel · GST included</div>
              <div className={`pdp-stock${inStock ? '' : ' out'}`}>
                {inStock ? '● In stock — fitted same day, or ready for pickup' : '● Out of stock'}
              </div>

              <div className="pdp-qtyrow">
                <div className="pdp-qty">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1} aria-label="One less wheel">−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(8, q + 1))}
                    disabled={qty >= 8} aria-label="One more wheel">+</button>
                </div>
                <div className="pdp-total">Total <b>{money(price * qty)}</b></div>
              </div>

              <button className="pdp-add" type="button" onClick={handleAdd} disabled={!inStock}>
                {added ? 'Added to cart' : 'Add to cart'}
              </button>

              <div className="pdp-fitnote">
                <b>Fitted at your local store</b> — usually same day, under an hour. In stock at{' '}
                <span className="stores">{nearby}</span>
                {extraCount > 0 ? ` +${extraCount} more` : ''} ·{' '}
                <a href="/#locations">All stores →</a>
              </div>
            </div>

            <Accordion initial={1} items={[
              { title: 'Payment methods accepted', body: <PaymentsPanel /> },
              { title: 'Pickup & Installation',    body: <PickupPanel /> },
              { title: 'Talk to a wheel expert',   body: <ExpertPanel kind="wheel" /> },
              { title: 'Fitting at our stores',    body: <FittingPanel /> },
              { title: 'Write a review',           body: <ReviewPanel /> },
            ]} />
          </div>
        </div>

        <SimilarGrid title="Similar wheels" basePath="wheels" items={similarItems} />
      </div>
    </main>
  )
}
