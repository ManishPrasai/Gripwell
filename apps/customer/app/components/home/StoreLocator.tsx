'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Store {
  id: string
  name: string
  address: string
  suburb: string
  state: string
  postcode: string
  phone: string
}

export default function StoreLocator() {
  const [stores, setStores] = useState<Store[]>([])
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(data => {
        setStores(data.stores || [])
        if (data.stores?.length) setActive(data.stores[0].id)
      })
      .catch(() => {})
  }, [])

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.suburb.toLowerCase().includes(search.toLowerCase()) ||
    s.state.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="relative z-10" style={{ maxWidth: '60%', margin: '0 auto' }}>

        <div className="mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          <div className="md:col-span-4">
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <i className="ti ti-search" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search suburb or store..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent flex-1 text-white outline-none placeholder:text-white/30"
                style={{ fontSize: '15px', fontWeight: 400 }}
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filtered.map(store => (
                <button
                  key={store.id}
                  onClick={() => setActive(store.id)}
                  className="w-full text-left rounded-xl px-4 py-3 transition-all"
                  style={{
                    background: active === store.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: active === store.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                  }}
                >
                  <p className="text-white" style={{ fontSize: '18px', fontWeight: 500 }}>{store.name}</p>
                  <p className="mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                    {store.address}, {store.suburb} {store.state} {store.postcode}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="md:col-span-8 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ minHeight: '360px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="text-center">
              <i className="ti ti-map" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.2)' }} aria-hidden="true" />
              <p className="mt-3" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 500 }}>
                Google Maps integration coming soon
              </p>
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
                style={{ background: '#E8572A', color: 'white', fontSize: '14px', fontWeight: 600 }}
              >
                View all locations
                <i className="ti ti-arrow-right" style={{ fontSize: '14px' }} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
