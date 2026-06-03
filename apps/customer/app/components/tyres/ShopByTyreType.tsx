'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TYPES = [
  { label: 'SUV Tyre',         href: '/tyres/results?type=SUV',         image: '/images/tyres/tyre-suv.png' },
  { label: 'All Terrain Tyre', href: '/tyres/results?type=ALL_TERRAIN', image: '/images/tyres/tyre-all-terrain.png' },
  { label: 'Passenger Tyre',   href: '/tyres/results?type=PASSENGER',   image: '/images/tyres/tyre-passenger.png' },
  { label: '4×4 Tyre',         href: '/tyres/results?type=SUV',         image: '/images/tyres/tyre-4x4.png' },
  { label: 'Mud Terrain Tyre', href: '/tyres/results?type=MUD_TERRAIN', image: '/images/tyres/tyre-mud.png' },
]

export default function ShopByTyreType() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section style={{ background: '#fff', paddingTop: '48px', paddingBottom: '16px' }}>
      <div className="max-w-7xl mx-auto px-4">

        <h2 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 900,
          color: '#1A1A1A',
          marginBottom: '24px',
        }}>
          Shop by Tyre Type
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            background: '#F6F6F6',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {TYPES.map((t, i) => {
            const isHov = hovered === i
            return (
              <Link
                key={t.label}
                href={t.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  /*
                    Generous horizontal padding gives the image room to scale
                    outward. overflow:hidden on the CARD clips edge bleed into
                    adjacent columns without ever clipping the top/bottom.
                  */
                  padding: '44px 28px 20px',
                  textDecoration: 'none',
                  borderRight: i < TYPES.length - 1 ? '1px solid #EBEBEB' : 'none',
                  background: isHov ? '#ECECEC' : 'transparent',
                  transition: 'background 0.3s ease-in-out',
                  overflow: 'hidden',
                }}
              >
                {/* Image wrapper — no overflow:hidden; clipping is handled by the card */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '120%',
                  }}
                >
                  <Image
                    src={t.image}
                    alt={t.label}
                    fill
                    sizes="20vw"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center',
                      transform: isHov ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.35s ease-in-out',
                    }}
                  />
                </div>

                {/* Tyre type label — larger, bolder on hover */}
                <p
                  style={{
                    textAlign: 'center',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: isHov ? 800 : 700,
                    color: isHov ? '#E8572A' : '#333',
                    marginTop: '14px',
                    lineHeight: 1.3,
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {t.label}
                </p>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
