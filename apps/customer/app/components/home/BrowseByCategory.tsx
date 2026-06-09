'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    title:    'All Terrain Tyre',
    subtitle: 'Versatile performance. On and off the road.',
    href:     '/tyres/results?type=MUD_TERRAIN',
    image:    '/images/categories/all-terrain.jpg.png',
    bg:       '#1C2820',
  },
  {
    title:    '4×4 Tyre',
    subtitle: 'Built for power. Ready for anything.',
    href:     '/tyres/results?type=SUV',
    image:    '/images/categories/4x4.jpg.png',
    bg:       '#1A2422',
  },
  {
    title:    'Passenger Tyre',
    subtitle: 'Smooth, quiet and reliable for everyday driving.',
    href:     '/tyres/results?type=PASSENGER',
    image:    '/images/categories/passenger.jpg.png',
    bg:       '#1E2428',
  },
  {
    title:    'Mud Terrain Tyre',
    subtitle: 'Maximum traction. Conquer the mud.',
    href:     '/tyres/results?type=MUD_TERRAIN',
    image:    '/images/categories/mud-terrain.jpg.png',
    bg:       '#181E1A',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function BrowseByCategory() {
  const [hoveredCard,    setHoveredCard]    = useState<number | null>(null)
  const [premiumHovered, setPremiumHovered] = useState(false)
  const [ctaHovered,     setCtaHovered]     = useState(false)

  return (
    <section style={{ background: '#FAF9F5', paddingTop: '88px', paddingBottom: '88px' }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ TOP ROW — text block (left) + Premium Tyres banner (right) ══ */}
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-5">

          {/* ── Left: copy + CTA ── */}
          <div className="lg:flex-shrink-0 lg:max-w-[480px] pt-1">
            {/* Category badge */}
            <p
              className="uppercase mb-5"
              style={{
                color:          '#FF5A1F',
                letterSpacing:  '0.20em',
                fontSize:       '11px',
                fontWeight:     700,
                fontFamily:     "'DM Sans', sans-serif",
              }}
            >
              Browse By Category
            </p>

            {/* Main heading — Bebas Neue, full caps, industrial */}
            <h2
              style={{
                fontSize:       'clamp(36px, 4.8vw, 56px)',
                color:          '#111111',
                fontFamily:     "'Bebas Neue', sans-serif",
                letterSpacing:  '0.05em',
                lineHeight:      1.0,
                textTransform:  'uppercase',
                marginBottom:   '20px',
                maxWidth:       '480px',
              }}
            >
              Find The Right<br />Tyre For Your Drive
            </h2>

            {/* Description */}
            <p
              style={{
                color:          '#555555',
                maxWidth:       '380px',
                lineHeight:     '1.75',
                fontSize:       '15px',
                fontWeight:     400,
                fontFamily:     "'DM Sans', sans-serif",
                marginBottom:   '36px',
              }}
            >
              From everyday drives to off-road adventures, explore tyres engineered
              for performance, safety and confidence.
            </p>

            {/* Explore All Tyres — outline → solid on hover */}
            <Link
              href="/tyres"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              className="inline-flex items-center gap-2"
              style={{
                border:         '1.5px solid #111111',
                borderRadius:   '999px',
                color:          ctaHovered ? '#ffffff' : '#111111',
                background:     ctaHovered ? '#111111' : 'transparent',
                fontSize:       '14px',
                fontWeight:     700,
                fontFamily:     "'DM Sans', sans-serif",
                letterSpacing:  '0.04em',
                padding:        '12px 26px',
                textDecoration: 'none',
                transition:     'background 0.28s ease, color 0.28s ease',
              }}
            >
              Explore All Tyres
              <svg
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </Link>
          </div>

          {/* ── Right: Premium Tyres tall vertical banner ── */}
          <Link
            href="/tyres?type=premium"
            onMouseEnter={() => setPremiumHovered(true)}
            onMouseLeave={() => setPremiumHovered(false)}
            className="relative w-full lg:flex-1 lg:min-w-[360px] flex flex-col justify-between rounded-2xl overflow-hidden"
            style={{
              height:         '360px',
              background:     '#0C0D0F',
              textDecoration: 'none',
              boxShadow:      premiumHovered
                ? '0 28px 64px rgba(0,0,0,0.34)'
                : '0 6px 24px rgba(0,0,0,0.14)',
              transition:     'box-shadow 0.35s ease',
            }}
          >
            {/* Background image */}
            <Image
              src="/images/categories/premium-bg.jpg"
              alt="Premium Tyres"
              fill
              sizes="(max-width: 1024px) 100vw, 288px"
              style={{
                objectFit:      'cover',
                objectPosition: 'calc(70% + 5px) center',
                opacity:        premiumHovered ? 0.99 : 0.99,
                transform:      premiumHovered ? 'scale(1.06)' : 'scale(1)',
                transition:     'opacity 0.45s ease, transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            />

            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset:     0,
                background:
                  'linear-gradient(to top, rgba(4,4,6,0.95) 0%, rgba(4,4,6,0.50) 45%, rgba(4,4,6,0.12) 100%)',
              }}
            />

            {/* Top content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '26px 26px 0' }}>
              {/* Icon badge */}
              <div
                style={{
                  width:           '42px',
                  height:          '42px',
                  borderRadius:    '12px',
                  background:      'rgba(255,90,31,0.14)',
                  border:          '1px solid rgba(255,90,31,0.38)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  marginBottom:    '18px',
                }}
              >
                <i className="ti ti-bolt" style={{ fontSize: '19px', color: '#FF5A1F' }} aria-hidden="true" />
              </div>

              <p
                style={{
                  color:          '#ffffff',
                  fontSize:       '21px',
                  fontWeight:     700,
                  marginBottom:   '10px',
                  lineHeight:     1.2,
                  fontFamily:     "'DM Sans', sans-serif",
                  letterSpacing:  '-0.01em',
                }}
              >
                Premium Tyres
              </p>
              <p
                style={{
                  color:       'rgba(255,255,255,0.50)',
                  fontSize:    '13px',
                  fontWeight:  400,
                  lineHeight:  '1.65',
                  fontFamily:  "'DM Sans', sans-serif",
                }}
              >
                Exceptional performance.<br />
                Maximum safety. Engineered<br />
                for excellence.
              </p>
            </div>

            {/* Bottom CTA row */}
            <div style={{ position: 'relative', zIndex: 1, padding: '0 26px 26px' }}>
              <div
                className="inline-flex items-center gap-2 uppercase"
                style={{
                  color:          '#FF5A1F',
                  letterSpacing:  '0.11em',
                  fontSize:       '12px',
                  fontWeight:     700,
                  fontFamily:     "'DM Sans', sans-serif",
                }}
              >
                Explore Premium
                {/* Circular arrow — fills solid orange on card hover */}
                <div
                  style={{
                    width:           '30px',
                    height:          '30px',
                    borderRadius:    '50%',
                    background:      premiumHovered ? '#FF5A1F' : 'rgba(255,90,31,0.18)',
                    border:          '1px solid rgba(255,90,31,0.45)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    transition:      'background 0.28s ease',
                  }}
                >
                  <i
                    className="ti ti-arrow-up-right"
                    style={{
                      fontSize:   '13px',
                      color:      premiumHovered ? '#ffffff' : '#FF5A1F',
                      transition: 'color 0.28s ease',
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ══ CATEGORY GRID — 4 portrait cards ══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat, i) => {
            const isHovered = hoveredCard === i
            return (
              <Link
                key={cat.title}
                href={cat.href}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  display:        'block',
                  position:       'relative',
                  borderRadius:   '16px',
                  overflow:       'hidden',
                  aspectRatio:    '3/4',
                  minHeight:      '260px',
                  background:     cat.bg,
                  textDecoration: 'none',
                  transform:      isHovered ? 'translateY(-5px) scale(1.018)' : 'translateY(0) scale(1)',
                  boxShadow:      isHovered
                    ? '0 28px 52px rgba(0,0,0,0.30)'
                    : '0 2px 12px rgba(0,0,0,0.10)',
                  transition:
                    'transform 0.40s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.40s ease',
                  zIndex:   isHovered ? 2 : 1,
                  cursor:   'pointer',
                }}
              >
                {/* Background image — scales on hover */}
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{
                    objectFit:  'cover',
                    opacity:    isHovered ? 0.80 : 0.62,
                    transform:  isHovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}
                />

                {/* Gradient scrim — deepens on hover */}
                <div
                  style={{
                    position:   'absolute',
                    inset:       0,
                    background: isHovered
                      ? 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.22) 52%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.08) 52%, transparent 100%)',
                    transition: 'background 0.40s ease',
                  }}
                />

                {/* Bottom info bar */}
                <div
                  style={{
                    position:       'absolute',
                    bottom:          0,
                    left:            0,
                    right:           0,
                    padding:        '16px 14px 16px',
                    display:        'flex',
                    alignItems:     'flex-end',
                    justifyContent: 'space-between',
                    gap:            '8px',
                  }}
                >
                  {/* Title + subtitle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color:         '#ffffff',
                        fontSize:      'clamp(13px, 1.4vw, 16px)',
                        fontWeight:    700,
                        marginBottom:  '4px',
                        lineHeight:    1.2,
                        fontFamily:    "'DM Sans', sans-serif",
                        whiteSpace:    'nowrap',
                        overflow:      'hidden',
                        textOverflow:  'ellipsis',
                      }}
                    >
                      {cat.title}
                    </p>
                    <p
                      style={{
                        color:      'rgba(255,255,255,0.60)',
                        fontSize:   'clamp(10px, 0.9vw, 12px)',
                        fontWeight: 500,
                        lineHeight: 1.45,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Orange circular arrow — pops on hover */}
                  <div
                    style={{
                      flexShrink:    0,
                      width:         '34px',
                      height:        '34px',
                      borderRadius:  '50%',
                      background:    isHovered ? '#FF5A1F' : 'rgba(255,90,31,0.82)',
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      transform:     isHovered ? 'scale(1.16)' : 'scale(1)',
                      boxShadow:     isHovered ? '0 6px 20px rgba(255,90,31,0.55)' : 'none',
                      transition:    'background 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease',
                    }}
                  >
                    <i
                      className="ti ti-arrow-up-right"
                      style={{ fontSize: '15px', color: '#ffffff' }}
                      aria-hidden="true"
                    />
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
