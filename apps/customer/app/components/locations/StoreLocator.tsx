'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'

/* Map renders Leaflet against `window` — must be client-only */
const StoreMap = dynamic(() => import('./StoreMap'), { ssr: false })

/* ── Store data ──────────────────────────────────────────────────────────── */
export interface Store {
  id:      string
  name:    string
  address: string
  suburb:  string
  lat:     number
  lng:     number
}

const STORES: Store[] = [
  { id: 'alphington', name: 'Nova Tyres Alphington', address: '200 Grange Rd',        suburb: 'Alphington VIC 3078',     lat: -37.7782, lng: 145.0253 },
  { id: 'bayswater',  name: 'Nova Tyres Bayswater',  address: '194 Canterbury Rd',    suburb: 'Bayswater VIC 3153',      lat: -37.8421, lng: 145.2589 },
  { id: 'dandenong',  name: 'Nova Tyres Dandenong',  address: '55 Lonsdale St',       suburb: 'Dandenong VIC 3175',      lat: -37.9875, lng: 145.2148 },
  { id: 'sefton',     name: 'Nova Tyres Sefton',     address: '120 Hector St',        suburb: 'Sefton NSW 2162',         lat: -33.8894, lng: 151.0112 },
  { id: 'springvale', name: 'Nova Tyres Springvale', address: '800 Princes Hwy',      suburb: 'Springvale VIC 3171',     lat: -37.9482, lng: 145.1537 },
  { id: 'brisbane',   name: 'Nova Tyres Brisbane',   address: '123 Ipswich Rd',       suburb: 'Woolloongabba QLD 4102',  lat: -27.4891, lng: 153.0321 },
  { id: 'adelaide',   name: 'Nova Tyres Adelaide',   address: '456 Port Rd',          suburb: 'Hindmarsh SA 5007',       lat: -34.9287, lng: 138.5632 },
  { id: 'richmond',   name: 'Nova Tyres Richmond',   address: '310 Swan St',          suburb: 'Richmond VIC 3121',       lat: -37.8228, lng: 144.9964 },
  { id: 'geelong',    name: 'Nova Tyres Geelong',    address: '88 Latrobe Terrace',   suburb: 'Geelong VIC 3220',        lat: -38.1500, lng: 144.3600 },
]

/* MVP journey link — 125 Holden St, Fitzroy North to the Nova Tyres
   Alphington storefront. Hardcoded so the directions route flawlessly
   without runtime geolocation. */
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&origin=-37.7794723,144.9840095&destination=-37.7675693,145.0275057&travelmode=driving'

const STATE_FILTERS = ['All', 'VIC', 'NSW', 'QLD'] as const

/* ── Component ───────────────────────────────────────────────────────────── */
export default function StoreLocator() {
  const [isMounted,    setIsMounted]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [stateFilter,   setStateFilter]   = useState<typeof STATE_FILTERS[number]>('All')
  const [selectedStore, setSelectedStore] = useState<Store | null>(STORES[0])

  /* Guards client-only calculations (geolocation, map sync) from running
     during SSR — prevents the markup mismatch that was throwing a hydration error. */
  useEffect(() => { setIsMounted(true) }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return STORES.filter(s => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.suburb.toLowerCase().includes(q)
      const matchesState = stateFilter === 'All' || s.suburb.includes(stateFilter)
      return matchesQuery && matchesState
    })
  }, [search, stateFilter])

  if (!isMounted) return null

  return (
    <section className="relative py-16 px-4 overflow-hidden" style={{ background: '#1a3022' }}>
      {/* Background image — zoomed in 50%, centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/store-bg.jpg)',
          backgroundSize: '150%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.55,
          filter: 'blur(4px)',
          transform: 'scale(1.06)',
        }}
      />
      {/* Hint of green scrim */}
      <div className="absolute inset-0" style={{ background: 'rgba(22, 65, 32, 0.15)' }} />

      {/* 90% theater container — title + interactive grid both live inside it,
          so everything locks to the same edges on laptops and wide monitors */}
      <div className="relative z-10 w-[90%] max-w-[1600px] mx-auto bg-gradient-to-b from-neutral-950/90 to-neutral-900/95 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 md:p-8 my-4 h-[calc(100vh-40px)] max-h-[680px] flex flex-col overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)]">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-neutral-800/60 pb-6 w-full flex-shrink-0 mb-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full uppercase tracking-wide mb-4"
              style={{ background: 'rgba(232,87,42,0.2)', color: '#E8572A', letterSpacing: '0.1em', fontSize: '11px', fontWeight: 500 }}
            >
              <i className="ti ti-map-pin" style={{ fontSize: '12px' }} aria-hidden="true" />
              Our Locations
            </div>
            <h2 className="text-white leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              Multiple Stores{' '}
              <em style={{ color: '#E8572A', fontStyle: 'italic' }}>one phone call</em>
              <br />away for new tyres.
            </h2>
          </div>

          {/* Premium control deck — low-profile state filter + live journey link,
              baseline-aligned with the heading on the right */}
          <div className="hidden lg:flex items-center gap-3">

            <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              {STATE_FILTERS.map(state => (
                <button
                  key={state}
                  onClick={() => setStateFilter(state)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    stateFilter === state ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#f05a28] text-white hover:bg-[#d94f21] shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Find Nearest Store &amp; Get Directions</span>
            </a>
          </div>
        </div>

        {/* Side-by-side grid — explicit columns, no absolute/floating layers
            colliding with Leaflet's own positioned panes */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 flex-1 min-h-0 w-full items-stretch overflow-hidden pb-2">

          {/* Search console panel */}
          <div className="flex flex-col w-full h-full min-h-0 bg-neutral-900/40 border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="relative w-full">
              <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)' }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search suburb or store..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-neutral-500 transition-all outline-none"
              />
            </div>

            <div className="w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-3 mt-4">
              {filtered.map(store => {
                const active = selectedStore?.id === store.id
                return (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`w-full text-left p-4 rounded-xl bg-neutral-900 border border-white/5 transition-all duration-200 hover:bg-neutral-800/80 cursor-pointer ${
                      active ? '!border-l-4 !border-l-[#f05a28] bg-neutral-800/90 shadow-[inset_0_0_20px_rgba(240,90,40,0.05)]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-bold text-white tracking-tight">{store.name}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap">
                        ✓ Official
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium mt-1">
                      {store.address}, {store.suburb}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map canvas cell — Leaflet stretches to fill this cell at 100%/100% */}
          <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 z-10">
            <StoreMap stores={filtered} selectedStore={selectedStore} onSelectStore={setSelectedStore} />
          </div>
        </div>
      </div>
    </section>
  )
}
