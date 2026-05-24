'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  const [tab, setTab] = useState<'rego' | 'vehicle' | 'size'>('rego')

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '92vh' }}>

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center" style={{ minHeight: '100vh', paddingTop: '140px' }}>
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 text-white/90 text-xs font-medium tracking-widest uppercase mb-6 px-4 py-2 rounded-full border"
          style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        >
          Warehouse Direct Price
        </div>

        {/* Headline */}
        <h1 className="text-white font-bold mb-4 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 8vw, 96px)', letterSpacing: '0.03em' }}>
          Quality Tyres &amp; Wheels<br />
          at the{' '}
          <span style={{ color: '#E8572A' }}>Best Prices</span>
        </h1>

        {/* Subtext */}
        <p className="text-white/80 mb-8 text-base" style={{ maxWidth: '480px', fontSize: '15px' }}>
          Australia&apos;s most trusted tyre retailer. Fitted same day across 9 locations.
        </p>

        {/* Search finder */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ maxWidth: '560px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)' }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: '#E5E5E5' }}>
            {[
              { key: 'rego',    label: 'By Rego' },
              { key: 'vehicle', label: 'Make & Model' },
              { key: 'size',    label: 'Tyre Size' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className="flex-1 py-3 text-sm font-medium transition-all duration-200"
                style={{
                  fontSize: '13px',
                  color: tab === t.key ? '#1C3A2B' : '#888',
                  borderBottom: tab === t.key ? '2px solid #E8572A' : '2px solid transparent',
                  background: 'transparent'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">

            {/* Rego tab */}
            {tab === 'rego' && (
              <div className="flex gap-2">
                <select
                  className="border rounded-lg px-3 py-3 text-sm font-medium"
                  style={{ borderColor: '#E5E5E5', color: '#1A1A1A', fontSize: '13px', minWidth: '80px' }}
                >
                  {['VIC','NSW','QLD','SA','WA','TAS','ACT','NT'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Enter rego plate e.g. ABC123"
                  className="flex-1 border rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                />
                <button
                  className="text-white px-5 py-3 rounded-lg font-medium text-sm flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{ background: '#E8572A', fontSize: '13px' }}
                >
                  Search
                </button>
              </div>
            )}

            {/* Make & Model tab */}
            {tab === 'vehicle' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="border rounded-lg px-3 py-3 text-sm"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  >
                    <option>Make</option>
                    {['Toyota','Holden','Ford','Mazda','Hyundai','Kia','Nissan','Mitsubishi','Subaru','Honda'].map(m => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded-lg px-3 py-3 text-sm"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  >
                    <option>Model</option>
                  </select>
                  <select
                    className="border rounded-lg px-3 py-3 text-sm"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  >
                    <option>Year</option>
                    {Array.from({ length: 25 }, (_, i) => 2024 - i).map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full text-white py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ background: '#E8572A', fontSize: '13px' }}
                >
                  Find Tyres
                </button>
              </div>
            )}

            {/* Tyre Size tab */}
            {tab === 'size' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Width e.g. 205"
                    className="border rounded-lg px-3 py-3 text-sm outline-none"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  />
                  <input
                    type="number"
                    placeholder="Profile e.g. 55"
                    className="border rounded-lg px-3 py-3 text-sm outline-none"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  />
                  <input
                    type="number"
                    placeholder="Rim e.g. 16"
                    className="border rounded-lg px-3 py-3 text-sm outline-none"
                    style={{ borderColor: '#E5E5E5', fontSize: '13px' }}
                  />
                </div>
                <button
                  className="w-full text-white py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ background: '#E8572A', fontSize: '13px' }}
                >
                  Find Tyres
                </button>
              </div>
            )}

            {/* Helper text */}
            <p className="text-center mt-2 text-xs" style={{ color: '#888' }}>
              We&apos;ll match factory specs from your plate
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mt-6 flex-wrap justify-center">
          <Link
            href="/tyres"
            className="flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-all text-sm"
          >
            Find Tyres
            <i className="ti ti-arrow-right" style={{ fontSize: '16px' }} aria-hidden="true" />
          </Link>
          <Link
            href="/wheels"
            className="flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-all text-sm"
          >
            Find Wheels
            <i className="ti ti-arrow-right" style={{ fontSize: '16px' }} aria-hidden="true" />
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className="flex items-center gap-6 mt-10 flex-wrap justify-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px' }}
        >
          <div className="flex items-center gap-2 text-white">
            <i className="ti ti-star-filled" style={{ fontSize: '18px', color: '#F5A623' }} aria-hidden="true" />
            <div>
              <p className="font-bold text-lg leading-none">4.8</p>
              <p className="text-white/60 text-xs">Google Reviews</p>
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
          <div className="text-white">
            <p className="font-bold text-lg leading-none">9 AU</p>
            <p className="text-white/60 text-xs">Locations</p>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
          <div className="text-white">
            <p className="font-bold text-lg leading-none">80+</p>
            <p className="text-white/60 text-xs">Major Brands</p>
          </div>
        </div>

      </div>
    </section>
  )
}