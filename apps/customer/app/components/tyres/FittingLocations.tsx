'use client'

import { useState } from 'react'
import Link from 'next/link'
import StoreChat from '../chat/StoreChat'

const STORES = [
  {
    name:    'NOV A TYRES – Alphington',
    address: '200 Grange Rd, Alphington VIC 3078',
    phone:   '03 7009 7700',
    image:   '/images/stores/alphington.jpg',
    slug:    'alphington',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Springvale',
    address: '4/134 Springvale Rd, Springvale VIC 3171',
    phone:   '03 9562 4269',
    image:   '/images/stores/springvale.jpg',
    slug:    'springvale',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Sefton',
    address: '107 Carlingford St, Sefton NSW 2162',
    phone:   '04 0338 8774',
    image:   '/images/stores/sefton.jpg',
    slug:    'sefton',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Dandenong',
    address: '308 S Gippsland Hwy, Dandenong South VIC 3175',
    phone:   '03 8787 5846',
    image:   '/images/stores/dandenong.jpg',
    slug:    'dandenong',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Bayswater',
    address: '194 Canterbury Rd, Bayswater North VIC 3153',
    phone:   '03 9720 9354',
    image:   '/images/stores/bayswater.jpg',
    slug:    'bayswater',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Sunshine',
    address: '9 Devonshire Rd, Sunshine VIC 3020',
    phone:   '03 9311 0000',
    image:   '/images/stores/sunshine.jpg',
    slug:    'sunshine',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Geelong',
    address: '1/118 Bellarine Hwy, Newcomb VIC 3219',
    phone:   '04 7869 8884',
    image:   '/images/stores/geelong.jpg',
    slug:    'geelong',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Brisbane',
    address: 'Brisbane QLD',
    phone:   '07 0000 0000',
    image:   '/images/stores/brisbane.jpg',
    slug:    'brisbane',
    open:    true,
  },
  {
    name:    'NOV A TYRES – Adelaide',
    address: 'Adelaide SA',
    phone:   '08 0000 0000',
    image:   '/images/stores/adelaide.jpg',
    slug:    'adelaide',
    open:    true,
  },
]

const CARD_W  = 390
const VISIBLE = 3

/* Store image with graceful fallback — uses plain <img> for reliable onError */
function StoreImage({ src, name, open }: { src: string; name: string; open: boolean }) {
  const [err, setErr] = useState(false)
  return (
    <div style={{ position: 'relative', height: '160px', background: '#1C3A2B', overflow: 'hidden', flexShrink: 0 }}>
      {!err ? (
        <img
          src={src}
          alt={name}
          onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1C3A2B 0%, #0f2018 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ti ti-building-store" style={{ fontSize: '40px', color: 'rgba(255,255,255,0.25)' }} aria-hidden="true" />
        </div>
      )}
      {open && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#FBFBFB', borderRadius: '8px', padding: '4px 12px' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#00B450' }}>OPEN NOW</span>
        </div>
      )}
    </div>
  )
}

export default function FittingLocations() {
  const [offset, setOffset] = useState(0)
  const [chatStore, setChatStore] = useState<{ slug: string; name: string } | null>(null)
  const maxOffset = Math.max(0, STORES.length - VISIBLE)

  return (
    <section style={{ background: '#fff', paddingTop: '16px', paddingBottom: '48px' }}>
      <div className="nv-shell">

        {/* Divider separating Brands We Serve from Fitting Locations */}
        <div style={{ height: '1px', background: '#E8E8E8', marginBottom: '36px' }} />

        <h2 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontWeight: 900,
          color: '#1A1A1A',
          marginBottom: '24px',
        }}>
          Fitting Locations
        </h2>

        {/* Carousel */}
        <div style={{ position: 'relative' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              transform: `translateX(calc(-${offset} * (${CARD_W}px + 20px)))`,
              transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}>
              {STORES.map(store => (
                <div
                  key={store.slug}
                  style={{
                    flexShrink: 0,
                    width: `${CARD_W}px`,
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #E5E5E5',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  <StoreImage src={store.image} name={store.name} open={store.open} />

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1A1A1A', marginBottom: '6px', lineHeight: 1.3 }}>
                      {store.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                      <i className="ti ti-map-pin" style={{ fontSize: '14px', color: '#076330', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#838383', fontWeight: 400, lineHeight: 1.4 }}>
                        {store.address}
                      </p>
                    </div>

                    {/* Phone */}
                    <div style={{ border: '1px solid #D2D2D2', borderRadius: '10px', padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '14px 0' }}>
                      <i className="ti ti-phone" style={{ fontSize: '16px', color: '#076330' }} aria-hidden="true" />
                      <a href={`tel:${store.phone.replace(/\s/g, '')}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '17px', color: '#1A1A1A', textDecoration: 'none' }}>
                        {store.phone}
                      </a>
                    </div>

                    {/* Chat with Store */}
                    <button
                      onClick={() => setChatStore({ slug: store.slug, name: store.name })}
                      aria-label={`Chat with ${store.name}`}
                      style={{ width: '100%', border: '1px solid #E8572A', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fff', cursor: 'pointer', marginBottom: '12px' }}
                    >
                      <i className="ti ti-message-circle" style={{ fontSize: '18px', color: '#E8572A' }} aria-hidden="true" />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '16px', color: '#E8572A' }}>Chat with Store</span>
                    </button>

                    {/* View Store */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Link href={`/locations/${store.slug}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#076330', textDecorationLine: 'underline' }}>
                        View Store
                      </Link>
                      <i className="ti ti-arrow-right" style={{ fontSize: '14px', color: '#076330' }} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev button */}
          {offset > 0 && (
            <button onClick={() => setOffset(o => Math.max(o - 1, 0))} aria-label="Previous store"
              style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #E5E5E5', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <i className="ti ti-chevron-left" style={{ fontSize: '18px', color: '#1A1A1A' }} aria-hidden="true" />
            </button>
          )}

          {/* Next button */}
          {offset < maxOffset && (
            <button onClick={() => setOffset(o => Math.min(o + 1, maxOffset))} aria-label="Next store"
              style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #E5E5E5', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <i className="ti ti-chevron-right" style={{ fontSize: '18px', color: '#1A1A1A' }} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* View all stores */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
          <Link href="/locations" style={{ border: '1px solid #C5C5C5', borderRadius: '10px', padding: '14px 40px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '18px', color: '#1A1A1A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            View all stores
            <i className="ti ti-arrow-right" style={{ fontSize: '20px' }} aria-hidden="true" />
          </Link>
        </div>

      </div>

      {chatStore && (
        <StoreChat storeSlug={chatStore.slug} storeName={chatStore.name} onClose={() => setChatStore(null)} />
      )}
    </section>
  )
}
