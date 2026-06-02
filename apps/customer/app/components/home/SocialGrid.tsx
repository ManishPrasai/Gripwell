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

      {/* ── Text header — left-aligned, above the grid ── */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <p style={{
          color: '#E8572A',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Follow Us
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 style={{
            color: '#1A1A1A',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}>
            <span style={{ color: '#E8572A' }}>#NovaTyres</span> in Social Media
          </h2>
          <div className="flex items-center gap-4">
            <p style={{ color: '#888', fontSize: '13px', fontWeight: 400 }}>
              Tag us in your photos and get featured on our feed.
            </p>
            <a
              href="https://instagram.com/novatyres"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 flex-shrink-0"
              style={{
                background: '#1A1A1A',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: '999px',
                textDecoration: 'none',
              }}
            >
              <i className="ti ti-brand-instagram" style={{ fontSize: '15px' }} aria-hidden="true" />
              @novatyres
            </a>
          </div>
        </div>
      </div>

      {/* ── Image grid — flush, no gaps, full width ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}
      >
        {images.map((img, i) => (
          <a
            key={i}
            href="https://instagram.com/novatyres"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            style={{
              position: 'relative',
              display: 'block',
              aspectRatio: '1',
              overflow: 'hidden',
              background: '#E5E5E5',
            }}
          >
            <Image
              src={img}
              alt={`Nova Tyres social post ${i + 1}`}
              fill
              sizes="25vw"
              style={{
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              className="group-hover:scale-110"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(28,58,43,0.65)' }}
            >
              <i className="ti ti-brand-instagram" style={{ fontSize: '26px', color: 'white' }} aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>

    </section>
  )
}
