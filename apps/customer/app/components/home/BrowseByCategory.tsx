'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/*
  Each card points at a filter the catalogue can actually serve. The TyreType
  enum is PASSENGER | SUV | COMMERCIAL | MUD_TERRAIN, so the design's
  "All-Terrain" slot is filled by COMMERCIAL — the one remaining real type —
  rather than linking to a filter that returns nothing.
*/
const CATEGORIES = [
  { name: 'PASSENGER',  tag: 'QUIET & ECONOMICAL', cta: 'Shop Passenger',  href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger car tyre' },
  { name: '4X4 / SUV',  tag: 'BUILT FOR LOAD',     cta: 'Shop 4x4 / SUV',  href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre' },
  { name: 'COMMERCIAL', tag: 'VANS & UTES',        cta: 'Shop Commercial', href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial van tyre' },
  { name: 'MUD-TERRAIN',tag: 'MAXIMUM BITE',       cta: 'Shop Mud-Terrain',href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre' },
  { name: 'WHEELS',     tag: 'ALLOY & PACKAGES',   cta: 'Shop Wheels',     href: '/wheels',                         img: '/images/wheels/king-kt5.png',        alt: 'Alloy wheel' },
]

export default function BrowseByCategory() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section style={{ background: '#FAF9F5', padding: 'clamp(32px,3.6vw,48px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-cat-grid { display: grid; gap: 16px; grid-template-columns: repeat(3,minmax(0,1fr)); }
        @media (max-width: 780px) { .nv-cat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 520px) { .nv-cat-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div data-reveal style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(30px,3.4vw,40px)', letterSpacing: '0.02em', color: '#16211B' }}>
            Find the right tyre for your drive
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '56ch', color: '#6E7C74', fontSize: '14px' }}>
            Engineered for performance, safety and confidence.
          </p>
        </div>

        <div data-reveal className="nv-cat-grid nv-d1">
          {CATEGORIES.map((c, i) => {
            const on = hovered === i
            return (
              <Link
                key={c.name}
                href={c.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  boxSizing: 'border-box', overflow: 'hidden', borderRadius: '14px', textDecoration: 'none',
                  background: '#1C3A2B',
                  border: `1px solid ${on ? 'rgba(250,249,245,0.42)' : 'rgba(250,249,245,0.18)'}`,
                  transform: on ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: on ? '0 20px 34px -18px rgba(0,0,0,0.5)' : 'none',
                  transition: 'transform .3s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s',
                }}
              >
                <span style={{
                  position: 'relative', height: 'clamp(160px,14vw,190px)', background: '#E7EFE9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Image src={c.img} alt={c.alt} fill sizes="(max-width: 780px) 90vw, 380px" style={{ objectFit: 'contain' }} />
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '999px',
                    background: on ? '#E8572A' : '#1C3A2B', color: '#F1EFE7',
                    transition: 'background .25s',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>

                <span style={{ padding: '10px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#FF8A5C', marginBottom: '7px' }}>
                    {c.tag}
                  </span>
                  <span style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '0.02em', color: '#F1EFE7', lineHeight: 1, marginBottom: '12px' }}>
                    {c.name}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px', paddingTop: '11px',
                    borderTop: '1px solid rgba(250,249,245,0.16)', width: '100%',
                    fontSize: '13px', fontWeight: 700, color: '#F1EFE7', marginTop: 'auto',
                  }}>
                    {c.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            )
          })}

          <Link
            href="/tyres"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
              borderRadius: '14px', border: '1.5px dashed #C9C7BE', textDecoration: 'none', color: '#076330',
              minHeight: 'clamp(160px,14vw,190px)',
              transition: 'border-color .25s, background .25s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#076330'; e.currentTarget.style.background = '#E8F5EE' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#C9C7BE'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.03em' }}>View all tyres</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
