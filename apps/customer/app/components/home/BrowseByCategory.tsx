'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    title: 'All Terrain Tyre',
    subtitle: 'Versatile performance. On and off the road.',
    href: '/tyres/results?type=MUD_TERRAIN',
    bgImage: '/images/categories/all-terrain.jpg.png',
    color: '#2D4A35',
  },
  {
    title: '4×4 Tyre',
    subtitle: 'Built for power. Ready for anything.',
    href: '/tyres/results?type=SUV',
    bgImage: '/images/categories/4x4.jpg.png',
    color: '#1C3A2B',
  },
  {
    title: 'Passenger Tyre',
    subtitle: 'Smooth, quiet and reliable for everyday driving.',
    href: '/tyres/results?type=PASSENGER',
    bgImage: '/images/categories/passenger.jpg.png',
    color: '#2A3F35',
  },
  {
    title: 'Mud Terrain Tyre',
    subtitle: 'Maximum traction. Conquer the mud.',
    href: '/tyres/results?type=MUD_TERRAIN',
    bgImage: '/images/categories/mud-terrain.jpg.png',
    color: '#1A2E22',
  },
]

export default function BrowseByCategory() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-16 px-4" style={{ background: '#FAF9F5' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto' }}>

        {/* ── Header row ── */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-6">

          {/* Left: label · heading · body copy · CTA */}
          <div>
            <p
              className="uppercase mb-2"
              style={{ color: '#E8572A', letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Browse by Category
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: '#1A1A1A',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              Find the Right<br />Tyre for Your Drive
            </h2>
            <p
              className="mt-3"
              style={{ color: '#666', maxWidth: '320px', lineHeight: '1.6', fontSize: '15px', fontWeight: 400 }}
            >
              From everyday drives to off-road adventures, explore tyres engineered
              for performance, safety and confidence.
            </p>

            {/* Clean outline pill — no icon */}
            <Link
              href="/tyres"
              className="inline-flex items-center mt-5 border rounded-full transition-all hover:bg-gray-50"
              style={{
                borderColor: '#1A1A1A',
                color: '#1A1A1A',
                fontSize: '14px',
                fontWeight: 600,
                padding: '9px 22px',
                textDecoration: 'none',
              }}
            >
              Explore All Tyres
            </Link>
          </div>

          {/* ── Premium Tyres card ──
              Drop a night-time sports-car shot at:
                /public/images/categories/premium-bg.jpg
              The gradient overlay below shows as the fallback until that image
              is present — the card looks great either way. */}
          <div
            className="rounded-2xl overflow-hidden flex flex-col justify-between"
            style={{
              position: 'relative',
              minWidth: '240px',
              maxWidth: '280px',
              minHeight: '215px',
              background: '#0D1F17',
              flexShrink: 0,
            }}
          >
            {/* Background image — silently absent until file is added */}
            <Image
              src="/images/categories/premium-bg.jpg"
              alt=""
              fill
              sizes="280px"
              style={{ objectFit: 'cover', opacity: 0.65 }}
            />

            {/* Dark gradient overlay — semi-transparent so the image shows through */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(10,25,18,0.62) 0%, rgba(4,4,4,0.52) 100%)',
              }}
            />

            {/* Card content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '22px 22px 0' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(232,87,42,0.15)',
                  border: '1px solid rgba(232,87,42,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <i className="ti ti-bolt" style={{ fontSize: '16px', color: '#E8572A' }} aria-hidden="true" />
              </div>
              <p style={{ color: '#fff', fontSize: '19px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.2 }}>
                Premium Tyres
              </p>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '13px', fontWeight: 400, lineHeight: '1.55' }}>
                Exceptional performance. Maximum safety. Engineered for excellence.
              </p>
            </div>

            <Link
              href="/tyres?type=premium"
              className="inline-flex items-center gap-2 uppercase transition-opacity hover:opacity-80"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '16px 22px 22px',
                color: '#E8572A',
                letterSpacing: '0.1em',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore Premium
              <i className="ti ti-arrow-right" style={{ fontSize: '14px' }} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ── Category grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => {
            const isHovered = hoveredCard === i
            return (
              <Link
                key={cat.title}
                href={cat.href}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  /*
                    The Link IS the card — position:relative lets next/image fill
                    work correctly, display:block turns the <a> into a block
                    for aspect-ratio, and overflow:hidden clips the scaled contents.
                  */
                  display: 'block',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  minHeight: '240px',
                  background: cat.color,
                  textDecoration: 'none',
                  /* Whole-card scale lift on hover */
                  transform: isHovered ? 'scale(1.025)' : 'scale(1)',
                  boxShadow: isHovered
                    ? '0 20px 56px rgba(0,0,0,0.30)'
                    : '0 2px 10px rgba(0,0,0,0.08)',
                  transition:
                    'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease',
                  /* Lift hovered card above its siblings */
                  zIndex: isHovered ? 2 : 1,
                  cursor: 'pointer',
                }}
              >

                {/* Layer 1 — Background environment image */}
                <Image
                  src={cat.bgImage}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    opacity: isHovered ? 0.72 : 0.58,
                    transition: 'opacity 0.4s ease',
                  }}
                />

                {/* Layer 2 — Gradient scrim (deepens on hover) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isHovered
                      ? 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.22) 55%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
                    transition: 'background 0.4s ease',
                  }}
                />

                {/*
                  Layer 4 — Bottom info bar.
                  Flex row: text on the left, orange arrow button on the right.
                  Both are always visible — the button brightens & pops on hover.
                */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '14px 14px 16px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  {/* Title + subtitle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: '#fff',
                        fontSize: 'clamp(13px, 1.5vw, 17px)',
                        fontWeight: 600,
                        marginBottom: '3px',
                        lineHeight: 1.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cat.title}
                    </p>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: 'clamp(10px, 1vw, 12px)',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Orange circular ↗ button — always present, pops on hover */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#E8572A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isHovered ? 1 : 0.82,
                      transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                      boxShadow: isHovered ? '0 4px 18px rgba(232,87,42,0.55)' : 'none',
                      transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    <i className="ti ti-arrow-up-right" style={{ fontSize: '15px', color: '#fff' }} aria-hidden="true" />
                  </div>
                </div>

              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
