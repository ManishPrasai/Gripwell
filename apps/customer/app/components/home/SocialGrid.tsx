'use client'

import Image from 'next/image'

const images = [
  '/images/social/social-1.jpg',
  '/images/social/social-2.jpg',
  '/images/social/social-3.jpg',
  '/images/social/social-4.jpg',
  '/images/social/social-5.jpg',
  '/images/social/social-6.jpg',
  '/images/social/social-7.jpg',
  '/images/social/social-8.jpg',
]

export default function SocialGrid() {
  return (
    <section style={{ background: '#FAF9F5', overflow: 'hidden' }}>

      {/* ── Header — left-aligned ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '72px', paddingBottom: '36px' }}>
        {/* "FOLLOW US" badge */}
        <p
          style={{
            color:          '#E8572A',
            fontSize:       '11px',
            fontWeight:     700,
            letterSpacing:  '0.20em',
            textTransform:  'uppercase',
            marginBottom:   '10px',
            fontFamily:     "'DM Sans', sans-serif",
          }}
        >
          Follow Us
        </p>

        {/* Main heading */}
        <h2
          style={{
            color:       '#1A1A1A',
            fontFamily:  "'Bebas Neue', sans-serif",
            fontSize:    'clamp(30px, 4vw, 44px)',
            letterSpacing: '0.03em',
            lineHeight:  1.05,
            marginBottom: '14px',
          }}
        >
          <span style={{ color: '#E8572A' }}>#NovaTyres</span> in Social Media
        </h2>

        {/* Subtitle — readable, below heading */}
        <p
          style={{
            color:       '#444444',
            fontSize:    '15px',
            fontWeight:  400,
            lineHeight:  1.6,
            fontFamily:  "'DM Sans', sans-serif",
            marginBottom: '22px',
            maxWidth:    '440px',
          }}
        >
          Tag us in your photos and get featured on our feed.
        </p>

        {/* Instagram CTA */}
        <a
          href="https://www.instagram.com/novatyres/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2"
          style={{
            background:     '#1A1A1A',
            color:          '#fff',
            fontSize:       '13px',
            fontWeight:     600,
            padding:        '10px 20px',
            borderRadius:   '999px',
            textDecoration: 'none',
            fontFamily:     "'DM Sans', sans-serif",
          }}
        >
          <i className="ti ti-brand-instagram" style={{ fontSize: '15px' }} aria-hidden="true" />
          @novatyres
        </a>
      </div>

      {/* ── Image grid — 4×2, full bleed ── */}
      <div className="grid grid-cols-4 gap-0">
        {images.map((img, i) => (
          <a
            key={i}
            href="https://www.instagram.com/novatyres/"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            style={{
              position:    'relative',
              display:     'block',
              aspectRatio: '1',
              overflow:    'hidden',
              background:  '#E5E5E5',
            }}
          >
            <Image
              src={img}
              alt={`Nova Tyres social post ${i + 1}`}
              fill
              sizes="25vw"
              style={{
                objectFit:  'cover',
                transition: 'transform 0.5s ease',
              }}
              className="group-hover:scale-110"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(28,58,43,0.65)' }}
            >
              <i className="ti ti-brand-instagram" style={{ fontSize: '22px', color: 'white' }} aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>

    </section>
  )
}
