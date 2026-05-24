'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Tyre {
  id: string
  brand: string
  model: string
  type: string
  price: number
  compareAtPrice: number
  isBestSeller: boolean
  slug: string
  tyreSize: { width: number; profile: number; rimDiameter: number; speedRating: string }
  images: { url: string; altText: string }[]
}

export default function BestDeals() {
  const [tab, setTab]         = useState<'tyres' | 'wheels'>('tyres')
  const [tyres, setTyres]     = useState<Tyre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tyres/bestsellers?limit=8')
      .then(r => r.json())
      .then(data => {
        setTyres(data.tyres || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 px-4" style={{ background: '#FAF9F5' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: '#1A1A1A', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
            Best deals on tyres &amp; wheels
          </h2>
          <div className="flex rounded-full overflow-hidden border" style={{ borderColor: '#E5E5E5' }}>
            {(['tyres', 'wheels'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 capitalize transition-all"
                style={{
                  background: tab === t ? '#1C3A2B' : 'white',
                  color: tab === t ? 'white' : '#888',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {tab === 'tyres' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="bg-gray-100 rounded-lg h-36 mb-3" />
                    <div className="bg-gray-100 h-3 rounded mb-2 w-1/2" />
                    <div className="bg-gray-100 h-4 rounded mb-1" />
                    <div className="bg-gray-100 h-3 rounded w-2/3" />
                  </div>
                ))
              : tyres.slice(0, 4).map(tyre => (
                  <Link
                    key={tyre.id}
                    href={`/tyres/${tyre.slug}`}
                    className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow group"
                    style={{ borderColor: '#E5E5E5' }}
                  >
                    {tyre.isBestSeller && (
                      <div
                        className="inline-block text-white px-2 py-0.5 rounded-full mb-2"
                        style={{ background: '#1C3A2B', fontSize: '11px', fontWeight: 500 }}
                      >
                        Best Seller
                      </div>
                    )}

                    <div className="flex items-center justify-center h-36 mb-3">
                      {tyre.images && tyre.images[0] ? (
                        <img
                          src={tyre.images[0].url}
                          alt={tyre.images[0].altText || `${tyre.brand} ${tyre.model}`}
                          className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className="w-28 h-28 rounded-full border-8 flex items-center justify-center"
                          style={{ borderColor: '#1A1A1A', background: '#F5F5F5' }}
                        >
                          <i className="ti ti-circle" style={{ fontSize: '32px', color: '#888' }} aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <p className="uppercase tracking-wide mb-0.5" style={{ color: '#E8572A', fontSize: '11px', fontWeight: 500 }}>
                      {tyre.brand}
                    </p>

                    <p className="mb-0.5" style={{ color: '#1A1A1A', fontSize: '18px', fontWeight: 500 }}>
                      {tyre.model}
                    </p>

                    <p className="mb-3" style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>
                      Size: {tyre.tyreSize.width}/{tyre.tyreSize.profile}R{tyre.tyreSize.rimDiameter} {tyre.tyreSize.speedRating}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: '#1A1A1A', fontSize: '15px', fontWeight: 400 }}>
                        From ${Number(tyre.price).toFixed(0)}
                      </span>
                      {tyre.compareAtPrice && (
                        <span className="line-through" style={{ color: '#BBB', fontSize: '12px', fontWeight: 500 }}>
                          ${Number(tyre.compareAtPrice).toFixed(0)}
                        </span>
                      )}
                    </div>

                    <button
                      className="w-full text-white py-2 rounded-lg transition-opacity hover:opacity-90"
                      style={{ background: '#1C3A2B', fontSize: '14px', fontWeight: 600 }}
                    >
                      View More
                    </button>
                  </Link>
                ))
            }
          </div>
        )}

        {tab === 'wheels' && (
          <div className="flex items-center justify-center py-16 text-center">
            <div>
              <i className="ti ti-disc" style={{ fontSize: '48px', color: '#CCC' }} aria-hidden="true" />
              <p className="mt-3" style={{ color: '#888', fontSize: '15px', fontWeight: 400 }}>
                Browse our wheel collection in store or{' '}
                <Link href="/wheels" className="underline" style={{ color: '#E8572A' }}>
                  view online
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href="/tyres"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: '#E8572A', fontSize: '14px', fontWeight: 600 }}
          >
            Shop all tyres
            <i className="ti ti-arrow-right" style={{ fontSize: '16px' }} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
