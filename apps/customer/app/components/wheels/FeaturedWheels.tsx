'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ── 3 featured wheels ───────────────────────────────────────────────────── */
const WHEELS = [
  { brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'Crawler',  size: '17" × 8J', spec: '6×139.7', slug: '/wheels', image: '/images/wheel/Wheel 1.png' },
  { brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg', model: 'Arsenal',  size: '18" × 9J', spec: '5×114.3', slug: '/wheels', image: '/images/wheel/Wheel 1.png' },
  { brand: 'ROH',         brandLogo: '/images/brands/roh.svg',         model: 'Crawler', size: '20" × 9J', spec: '5×150',   slug: '/wheels', image: '/images/wheel/Wheel 1.png' },
]

/* Layout constants ─────────────────────────────────────────────────────── */
const BTN_H  = 54   // VIEW MORE section height (btn 38px + 16px bottom pad)
const INFO_H = 108  // Content flow layer height (badge + title + specs + padding)

/* ── Card component ──────────────────────────────────────────────────────── */
function WheelCard({ product }: { product: typeof WHEELS[0] }) {
  const [hovered, setHovered] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  /*
    Asymmetric clamped physics — spec §2.
    Only allows rotation to the RIGHT (V_x > 0) and UPWARD (V_y < 0)
    to match the fixed perspective angle of the 2D source image.
  */
  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!imgRef.current) return
    const r     = e.currentTarget.getBoundingClientRect()
    const X_pos = e.clientX - r.left          // raw px from card top-left
    const Y_pos = e.clientY - r.top
    const V_x   = X_pos / r.width  - 0.5      // normalised  −0.5 … +0.5
    const V_y   = Y_pos / r.height - 0.5

    /* Yaw: only right-side mouse position triggers rotation */
    const Rotate_Y = V_x > 0 ? V_x * 25 : 0
    /* Pitch: only upper-half mouse position triggers tilt */
    const Rotate_X = V_y < 0 ? -(V_y * 20) : 0

    imgRef.current.style.transition =
      'transform 0.1s ease-out'
    imgRef.current.style.transform  =
      `perspective(1200px) rotateX(${Rotate_X}deg) rotateY(${Rotate_Y}deg) scale3d(1.06, 1.06, 1.06)`
  }

  /*
    Damped inertia return — spec §4.
    Heavy cubic-bezier simulates physical mass slowing back to neutral.
  */
  function onMouseLeave() {
    setHovered(false)
    if (!imgRef.current) return
    imgRef.current.style.transition =
      'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    imgRef.current.style.transform  =
      'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    /*
      Card Container — event bounding box + overflow:hidden to mask VIEW MORE.
      Link makes the whole card keyboard/screen-reader navigable.
    */
    <Link
      href={product.slug}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      style={{
        display:      'block',
        position:     'relative',
        textDecoration: 'none',
        background:   '#fff',
        borderRadius: '16px',
        border:       '1px solid #E5E5E5',
        height:       '380px',
        overflow:     'hidden',   /* masks VIEW MORE in its default off-screen state */
        boxShadow:    hovered
          ? '0 20px 56px rgba(0,0,0,0.15)'
          : '0 1px 6px rgba(0,0,0,0.06)',
        transition:   'box-shadow 0.3s ease',
        cursor:       'pointer',
      }}
    >

      {/*
        ── Image Viewport (spec §1) ──
        Absolutely positioned, covers the card above the text zone.
        perspective + preserve-3d create the 3D rendering context.
        pointer-events:none lets mouse events reach the Card Container.
      */}
      <div
        style={{
          position:       'absolute',
          top:            0,
          left:           0,
          right:          0,
          bottom:         `${BTN_H + INFO_H}px`,
          perspective:    '1200px',
          transformStyle: 'preserve-3d',
          pointerEvents:  'none',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '24px 20px 12px',
        }}
      >
        {/*
          Wheel Image Element — plain <img> so ref is directly on the DOM node.
          transform-origin: center center as spec §3 requires.
          Initial transform and fallback transition set inline.
        */}
        <img
          ref={imgRef}
          src={product.image}
          alt={`${product.brand} ${product.model}`}
          style={{
            width:           '90%',
            height:          '100%',
            objectFit:       'contain',
            transformOrigin: 'center center',
            transform:       'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition:      'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange:      'transform',
            display:         'block',
          }}
        />
      </div>

      {/*
        ── Content Flow Layer (spec §1 + §5) ──
        Stable 2D space — never receives any 3D perspective transform.
        Shifts upward 10px on hover to clear space for the rising button.
      */}
      <div
        style={{
          position:   'absolute',
          bottom:     `${BTN_H}px`,
          left:       0,
          right:      0,
          background: '#fff',
          padding:    '14px 16px 10px',
          transform:  hovered ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'transform 0.3s ease-out',
          zIndex:     2,
        }}
      >
        {/* Brand logo badge — left-aligned with text column */}
        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          border:       '1px solid #E8E8E8',
          borderRadius: '6px',
          padding:      '4px 10px',
          background:   '#fff',
          height:       '30px',
          marginBottom: '10px',
        }}>
          <Image
            src={product.brandLogo}
            alt={product.brand}
            width={72}
            height={18}
            style={{ objectFit: 'contain', height: '16px', width: 'auto' }}
          />
        </div>

        {/* Title — bold, heavy, high-contrast */}
        <p style={{
          color:        '#1A1A1A',
          fontFamily:   "'DM Sans', sans-serif",
          fontSize:     '17px',
          fontWeight:   800,
          marginBottom: '4px',
          lineHeight:   1.25,
        }}>
          {product.brand} {product.model}
        </p>

        {/* Specs — clean, readable */}
        <p style={{
          color:          '#3A3A3A',
          fontFamily:     "'DM Sans', sans-serif",
          fontSize:       '14px',
          fontWeight:     600,
          letterSpacing:  '0.02em',
        }}>
          {product.size}&nbsp;&nbsp;{product.spec}
        </p>
      </div>

      {/*
        ── VIEW MORE Button (spec §5) ──
        Pinned to card bottom. Default: opacity 0, translateY(100%) → fully hidden
        below fold (card overflow:hidden clips it). Hover: slides up + fades in.
      */}
      <div
        style={{
          position:     'absolute',
          bottom:       0,
          left:         0,
          right:        0,
          padding:      '0 16px 16px',
          background:   '#fff',
          opacity:      hovered ? 1 : 0,
          transform:    hovered ? 'translateY(0)' : 'translateY(100%)',
          transition:   'opacity 0.3s ease-out, transform 0.3s ease-out',
          pointerEvents: hovered ? 'auto' : 'none',
          zIndex:        3,
        }}
      >
        <div style={{
          padding:       '12px 16px',
          background:    '#1A1A1A',
          color:         '#fff',
          borderRadius:  '8px',
          fontFamily:    "'DM Sans', sans-serif",
          fontSize:      '13px',
          fontWeight:    700,
          letterSpacing: '0.07em',
          textAlign:     'center',
          textTransform: 'uppercase',
        }}>
          View More
        </div>
      </div>

    </Link>
  )
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export default function FeaturedWheels() {
  return (
    <section className="px-4" style={{ background: '#FAF9F5', paddingTop: '48px', paddingBottom: '48px' }}>
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 style={{
            color:        '#1A1A1A',
            fontFamily:   "'Bebas Neue', sans-serif",
            fontSize:     'clamp(28px, 4vw, 40px)',
            letterSpacing:'0.02em',
            lineHeight:    1.1,
          }}>
            Featured Wheels
          </h2>
          <Link
            href="/wheels"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{ color: '#E8572A', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
          >
            Shop all wheels
            <i className="ti ti-arrow-right" style={{ fontSize: '16px' }} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WHEELS.map((w, i) => <WheelCard key={i} product={w} />)}
        </div>

      </div>
    </section>
  )
}
