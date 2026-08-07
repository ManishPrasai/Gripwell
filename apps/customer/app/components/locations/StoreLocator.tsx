'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { STORES, STORE_NETWORK_LABEL, telHref, fullAddress, directionsHref, type Store } from '../../../lib/stores'

/* Leaflet touches `window` on import — client-only. The skeleton keeps the
   section's height stable so the page doesn't jump when the map arrives. */
const StoreMap = dynamic(() => import('./StoreMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#EFEEE8' }} />,
})

/* Re-exported so existing importers of the old location keep resolving. */
export type { Store }

const RAIL_STEP = 520

export default function StoreLocator() {
  const [active, setActive] = useState<Store>(STORES[0])
  const railRef = useRef<HTMLDivElement>(null)

  function scrollRail(delta: number) {
    railRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section id="locations" style={{ background: '#FFFFFF', padding: 'clamp(56px,6.5vw,88px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-rail-btn:hover { background: #F0EFE9; border-color: #076330; }
        .nv-store-tel:hover { background: #FF6817; }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>

        {/* ── Header ── */}
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px 24px', marginBottom: 'clamp(22px,2.6vw,30px)' }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E8572A', marginBottom: '12px' }}>
              Come see us
            </span>
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(34px,4.6vw,58px)', letterSpacing: '0.015em', lineHeight: 1, color: '#16211B' }}>
              {STORE_NETWORK_LABEL}
            </h2>
            <p style={{ margin: 0, fontSize: '15.5px', color: '#6E7C74' }}>
              Walk in for a free tyre and safety check — no booking needed.
            </p>
          </div>
          <Link
            href="/service?goto=shops"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#076330', textDecoration: 'none', borderBottom: '1.5px solid rgba(7,99,48,0.35)', paddingBottom: '3px', whiteSpace: 'nowrap' }}
          >
            All store details &amp; services
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {/* ── Map + floating detail card ── */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E7E5DE', background: '#EFEEE8' }}>
          <div style={{ width: '100%', height: 'clamp(300px,38vw,440px)' }}>
            {/* next/dynamic erases StoreMap's generic, so the callback arrives
                typed as the narrow MappableStore — resolve it back to the full
                record before storing it as the active store. */}
            <StoreMap
              stores={STORES}
              selectedStore={active}
              onSelectStore={s => {
                const full = STORES.find(x => x.id === s.id)
                if (full) setActive(full)
              }}
            />
          </div>

          {/* Sits above Leaflet's panes (which top out around z-index 800) so
              the card is never swallowed by a tile or marker layer. */}
          <div
            style={{
              position: 'absolute', left: 'clamp(12px,2vw,20px)', bottom: 'clamp(12px,2vw,20px)', right: 'clamp(12px,2vw,20px)',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '14px 16px',
              boxShadow: '0 18px 40px -24px rgba(20,25,22,0.5)', zIndex: 1000,
            }}
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.03em', lineHeight: 1.05, color: '#16211B' }}>
                {active.name}
              </span>
              <span style={{ fontSize: '12.5px', color: '#6E7C74' }}>{fullAddress(active)}</span>
            </span>
            <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={directionsHref(active)} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#F0EFE9', color: '#16211B', textDecoration: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m3 11 19-9-9 19-2-8-8-2z" />
                </svg>
                Directions
              </a>
              <a
                href={telHref(active.tel)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#076330', color: '#fff', textDecoration: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {active.tel}
              </a>
            </span>
          </div>
        </div>

        {/* ── Rail controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', margin: 'clamp(22px,2.6vw,30px) 0 14px' }}>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#16211B' }}>
            <strong>Browse stores</strong> <span style={{ color: '#6E7C74' }}>— tap a store to see it on the map</span>
          </p>
          <span style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => scrollRail(-RAIL_STEP)} aria-label="Previous stores" className="nv-rail-btn"
              style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #DEDCD4', background: '#FFFFFF', color: '#16211B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s, border-color .2s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>
            <button onClick={() => scrollRail(RAIL_STEP)} aria-label="More stores" className="nv-rail-btn"
              style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #DEDCD4', background: '#FFFFFF', color: '#16211B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s, border-color .2s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </span>
        </div>

        {/* ── Store rail ── */}
        <div
          ref={railRef}
          className="nv-rail"
          style={{ display: 'flex', gap: '16px', overflowX: 'auto', overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: '10px' }}
        >
          {STORES.map(st => {
            const on = st.id === active.id
            return (
              <div
                key={st.id}
                style={{
                  flex: '0 0 auto', width: '244px', boxSizing: 'border-box', background: '#FFFFFF',
                  border: `1px solid ${on ? '#076330' : '#E7E5DE'}`, borderRadius: '12px', padding: '18px',
                  boxShadow: on ? '0 10px 26px -18px rgba(7,99,48,0.6)' : '0 4px 6px rgba(20,25,22,0.05)',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '25px', letterSpacing: '0.03em', lineHeight: 1.05, color: '#16211B' }}>
                    {st.short}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', color: '#076330' }}>
                    {st.state}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6E7C74' }}>{st.address}</p>
                <button
                  onClick={() => setActive(st)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px',
                    padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700,
                    color: on ? '#E8572A' : '#076330',
                  }}
                >
                  {on ? 'Showing on map' : 'Show on map'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </button>
                <a
                  href={telHref(st.tel)}
                  className="nv-store-tel"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginTop: '14px', background: '#E8572A', color: '#fff', textDecoration: 'none',
                    borderRadius: '8px', padding: '13px 12px', fontSize: '14.5px', fontWeight: 700,
                    whiteSpace: 'nowrap', transition: 'background .2s',
                  }}
                >
                  {st.tel}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
