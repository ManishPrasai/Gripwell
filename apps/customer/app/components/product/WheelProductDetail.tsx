'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

const BRAND_LOGOS: Record<string, string> = {
  'Black Rhino': '/images/brands/Black Rino.svg',
  'ROH':         '/images/brands/roh.svg',
  'King Wheels': '/images/brands/king-wheels.svg',
  'Sonix':       '/images/brands/sonix.svg',
}

const PAYMENT_LOGOS = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

const SIMILAR_WHEELS = [
  { brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'Arsenal',  size: '18×9',  spec: '5×114.3', price: 265, slug: 'black-rhino-arsenal-18x9', image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Terrain',  size: '16×8',  spec: '6×139.7', price: 195, slug: 'roh-terrain-16x8',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Warrior',  size: '20×9',  spec: '5×150',   price: 295, slug: 'roh-warrior-20x9',         image: '/images/wheel/Wheel 1.png' },
  { brand: 'King Wheels', brandLogo: '/images/brands/king-wheels.svg', model: 'Force',    size: '17×8',  spec: '6×139.7', price: 185, slug: 'king-force-17x8',           image: '/images/wheel/Wheel 1.png' },
]

interface WheelProduct {
  id: string; brand: string; model: string; description?: string; slug: string
  diameter: number; width: string; pcd: string; offset?: number; bore?: string
  material: string; finish?: string; price: string; compareAtPrice?: string; stockQuantity: number
  images: { url: string; altText?: string; sortOrder: number }[]
  packages: { id: string; name: string; packagePrice: string }[]
}

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <i key={i} className="ti ti-star-filled" style={{ fontSize: `${size}px`, color: i <= n ? '#F5A623' : '#E0E0E0' }} aria-hidden="true" />
      ))}
    </div>
  )
}

export default function WheelProductDetail({ wheel }: { wheel: WheelProduct }) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'pickup'>('details')
  const [addedMsg,  setAddedMsg]  = useState(false)
  const { addToCart } = useCart()

  const images   = wheel.images.length > 0 ? wheel.images : [{ url: '/images/wheel/Wheel 1.png', altText: wheel.model, sortOrder: 0 }]
  const price    = parseFloat(wheel.price)
  const compare  = wheel.compareAtPrice ? parseFloat(wheel.compareAtPrice) : null
  const inStock  = wheel.stockQuantity > 0
  const brandLogo = BRAND_LOGOS[wheel.brand]

  return (
    <main style={{ background: '#fff', paddingTop: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Top: gallery + info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start', marginBottom: '48px' }}>

          {/* Gallery */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '72px' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ width: '68px', height: '68px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${activeImg === i ? '#E8572A' : '#E0E0E0'}`, background: '#F8F8F8', padding: '4px', cursor: 'pointer', flexShrink: 0 }}>
                  <Image src={img.url} alt={img.altText ?? wheel.model} width={60} height={60} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </button>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#F8F8F8', borderRadius: '14px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src={images[activeImg]?.url ?? images[0].url} alt={wheel.model} fill style={{ objectFit: 'contain', padding: '24px' }} sizes="500px" />
            </div>
          </div>

          {/* Product info */}
          <div>
            {brandLogo && <div style={{ marginBottom: '12px' }}><Image src={brandLogo} alt={wheel.brand} width={100} height={28} style={{ objectFit: 'contain', height: '26px', width: 'auto' }} /></div>}
            {!brandLogo && <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '18px', color: '#E8572A', marginBottom: '8px' }}>{wheel.brand}</p>}

            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '28px', color: '#1A1A1A', marginBottom: '16px', lineHeight: 1.2 }}>
              {wheel.brand} {wheel.model}
            </h1>

            {/* Wheel quick specs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', border: '1px solid #EBEBEB', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                { label: 'Diameter', value: `${wheel.diameter}"` },
                { label: 'Width',    value: `${wheel.width}J` },
                { label: 'PCD',      value: wheel.pcd },
                { label: 'Offset',   value: wheel.offset !== undefined ? `ET${wheel.offset}` : '—' },
                { label: 'Finish',   value: wheel.finish ?? '—' },
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

            {inStock ? (
              <span style={{ display: 'inline-block', background: '#E8F5EC', color: '#1A7A3C', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px', textTransform: 'uppercase' }}>In Stock</span>
            ) : (
              <span style={{ display: 'inline-block', background: '#FEECEC', color: '#C0392B', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px' }}>Out of Stock</span>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '32px', color: '#E8572A' }}>A${price.toFixed(2)}</p>
              {compare && <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '18px', color: '#aaa', textDecoration: 'line-through' }}>A${compare.toFixed(2)}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D5D5D5', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '48px', background: '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: '44px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: '#1A1A1A' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '48px', background: '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button onClick={() => { for (let i=0;i<qty;i++) addToCart({ id: wheel.slug, productType: 'wheel', brand: wheel.brand, brandLogo: brandLogo??'', model: wheel.model, size: `${wheel.diameter}"×${wheel.width}`, spec: wheel.pcd, price, image: images[0]?.url??'' }); setAddedMsg(true); setTimeout(()=>setAddedMsg(false),2000) }} disabled={!inStock}
                style={{ flex: 1, height: '48px', background: inStock ? '#E8572A' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px', cursor: inStock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseOver={e => { if (inStock) e.currentTarget.style.opacity = '0.88' }}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <i className={addedMsg ? 'ti ti-check' : 'ti ti-shopping-cart'} style={{ fontSize: '16px' }} aria-hidden="true" />
                {addedMsg ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[{ icon: 'ti-truck-delivery', label: 'Fast Delivery' }, { icon: 'ti-map-pin', label: 'Multiple Fitting Locations' }, { icon: 'ti-headphones', label: 'Expert Support' }].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F5F5F5', borderRadius: '6px', padding: '6px 12px' }}>
                  <i className={`ti ${f.icon}`} style={{ fontSize: '14px', color: '#1A1A1A' }} aria-hidden="true" />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{f.label}</span>
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid #EBEBEB', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <i className="ti ti-lock" style={{ fontSize: '16px', color: '#076330' }} aria-hidden="true" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#1A1A1A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secure Checkout</span>
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

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid #EBEBEB', display: 'flex', gap: '0', marginBottom: '0' }}>
          {(['description', 'details', 'pickup'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: activeTab === t ? '#1A1A1A' : '#999', borderBottom: activeTab === t ? '2px solid #1A1A1A' : '2px solid transparent', marginBottom: '-2px' }}>
              {t === 'description' ? 'Description' : t === 'details' ? 'Product Details' : 'Pickup/Installation'}
            </button>
          ))}
        </div>
        <div style={{ padding: '28px 0 40px', borderBottom: '1px solid #EBEBEB' }}>
          {activeTab === 'description' && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#555', lineHeight: 1.75, maxWidth: '720px' }}>
              {wheel.description ?? `The ${wheel.brand} ${wheel.model} is a premium alloy wheel built for both performance and style. Engineered with high-strength aluminium alloy for durability without compromising on weight.`}
            </p>
          )}
          {activeTab === 'details' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ background: '#076330', borderRadius: '8px 8px 0 0', padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Specifications</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Details</span>
              </div>
              {[
                { label: 'Brand',    value: wheel.brand },
                { label: 'Diameter', value: `${wheel.diameter}"` },
                { label: 'Width',    value: `${wheel.width}J` },
                { label: 'PCD',      value: wheel.pcd },
                { label: 'Offset',   value: wheel.offset !== undefined ? `ET${wheel.offset}` : '—' },
                { label: 'Bore',     value: wheel.bore ? `${wheel.bore}mm` : '—' },
                { label: 'Material', value: wheel.material },
                { label: 'Finish',   value: wheel.finish ?? '—' },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 20px', background: i % 2 === 0 ? '#fff' : '#F9F9F9', borderLeft: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#1A1A1A', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'pickup' && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#555', lineHeight: 1.7 }}>
              Wheel fitting is available at all Nova Tyres locations. Add to cart to select your store and book a fitting appointment.
            </p>
          )}
        </div>

        {/* Similar wheels */}
        <div style={{ margin: '40px 0' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: '#1A1A1A', marginBottom: '20px' }}>Similar Wheels You May Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {SIMILAR_WHEELS.map((w, i) => (
              <div key={i} style={{ border: '1px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#F8F8F8', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', position: 'relative' }}>
                  <Image src={w.image} alt={w.model} fill style={{ objectFit: 'contain', padding: '12px' }} sizes="25vw" />
                </div>
                <div style={{ padding: '14px' }}>
                  <Image src={w.brandLogo} alt={w.brand} width={80} height={20} style={{ objectFit: 'contain', height: '16px', width: 'auto', marginBottom: '6px' }} />
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '2px' }}>{w.brand} {w.model}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888', marginBottom: '10px' }}>{w.size} {w.spec}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#E8572A', marginBottom: '10px' }}>A${w.price.toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/wheels/${w.slug}`} style={{ flex: 1, background: '#1A1A1A', color: '#fff', borderRadius: '6px', padding: '8px', textAlign: 'center', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Why choose banner */}
        <div style={{ background: '#0F2218', borderRadius: '14px', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <p style={{ gridColumn: '1 / -1', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Why Choose Nova Tyres?</p>
          {[{ icon: 'ti-building-warehouse', title: 'Warehouse Direct Pricing', desc: 'Best brands at the best price' }, { icon: 'ti-headphones', title: 'Expert Support', desc: "We're here to help" }, { icon: 'ti-truck-delivery', title: 'Fast & Reliable', desc: 'Quick delivery' }, { icon: 'ti-star-filled', title: 'Trusted by 1,240+ Drivers', desc: 'Rated 4.8' }].map(f => (
            <div key={f.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: '32px', color: '#E8572A' }} aria-hidden="true" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff', lineHeight: 1.3 }}>{f.title}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
