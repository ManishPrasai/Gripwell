'use client'

import Link from 'next/link'
import Image from 'next/image'

/*
  Each card points at a filter the catalogue can actually serve. The TyreType
  enum is PASSENGER | SUV | COMMERCIAL | MUD_TERRAIN, so the design's
  "All-Terrain" slot is filled by COMMERCIAL — the one remaining real type —
  rather than linking to a filter that returns nothing.
*/
const CATEGORIES = [
  { name: 'Passenger',    tag: 'Quiet & economical', href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger car tyre' },
  { name: '4x4 / SUV',    tag: 'Built for load',     href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre' },
  { name: 'Commercial',   tag: 'Vans & utes',        href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial van tyre' },
  { name: 'Mud-Terrain',  tag: 'Maximum bite',       href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre' },
  { name: 'Wheels',       tag: 'Alloy & packages',   href: '/wheels',                         img: '/images/wheels/king-kt5.png',        alt: 'Alloy wheel' },
]

export default function BrowseByCategory() {
  return (
    <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E5DE', padding: 'clamp(52px,6vw,80px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .cat-card { position: relative; display: flex; flex-direction: column; background: #FFFFFF; border: 1px solid #E7E5DE; border-radius: 18px; padding: 22px; text-decoration: none; color: #16211B; transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .22s; }
        .cat-card:hover { border-color: #C9C7BE; transform: translateY(-5px); box-shadow: 0 6px 10px rgba(20,25,22,0.08), 0 26px 50px -22px rgba(20,25,22,0.34); }
        .nv-cat-grid { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 20px; }
        @media (max-width: 1000px) { .nv-cat-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 640px)  { .nv-cat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div data-reveal style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '16px 24px', marginBottom: 'clamp(28px,3.2vw,40px)',
        }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E8572A', marginBottom: '10px' }}>
              Shop by category
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px,3.8vw,44px)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05, color: '#16211B' }}>
              Find the right tyre for your drive
            </h2>
          </div>
          <Link href="/tyres" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#076330', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: '4px',
          }}>
            View all tyres
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div data-reveal className="nv-cat-grid nv-d1">
          {CATEGORIES.map(c => (
            <Link key={c.name} href={c.href} className="cat-card">
              <div style={{ position: 'relative', height: '210px', marginBottom: '20px' }}>
                <Image src={c.img} alt={c.alt} fill sizes="(max-width: 640px) 45vw, (max-width: 1000px) 30vw, 240px" style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>{c.name}</span>
              <span style={{ fontSize: '13.5px', color: '#6E7C74' }}>{c.tag}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
