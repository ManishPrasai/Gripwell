'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERVICES = [
  { title: 'Wheel alignment',    free: false, body: 'Computerised four-wheel alignment for even wear and straight steering.' },
  { title: 'Puncture repair',    free: false, body: "Repaired while you wait, where it's safe to do so." },
  { title: 'Fitting & balancing',free: false, body: 'Included with every tyre — new valves and disposal too.' },
  { title: 'Log book service',   free: false, body: 'Manufacturer-schedule servicing that keeps your new-car warranty.' },
  { title: 'Safety inspection',  free: true,  body: 'Tread, pressures, brakes and lights — a 15-minute once-over.' },
  { title: 'Pre-RWC check',      free: true,  body: 'Know what needs fixing before the roadworthy test.' },
]

export default function InStoreServices() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section
      style={{
        background: '#FFFFFF', borderTop: '1px solid #E7E5DE',
        padding: 'clamp(46px,5.4vw,72px) 0', fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .nv-svc-grid { display: grid; gap: 12px; align-items: stretch; grid-template-columns: repeat(6,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-svc-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-svc-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        .nv-svc-cta:hover { border-color: #076330; background: #E8F5EE; }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div
          data-reveal
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px 24px', marginBottom: 'clamp(22px,2.6vw,32px)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E8572A', marginBottom: '10px' }}>
              More than tyres
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(30px,3.6vw,42px)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05, textTransform: 'uppercase', color: '#16211B' }}>
              In-store services
            </h2>
          </div>
          <Link
            href="/service"
            className="nv-svc-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#076330', textDecoration: 'none', border: '1.5px solid #C9C7BE',
              borderRadius: '4px', padding: '15px 26px', whiteSpace: 'nowrap',
              transition: 'border-color .2s, background .2s',
            }}
          >
            Book a service
          </Link>
        </div>

        <div data-reveal className="nv-svc-grid nv-d1">
          {SERVICES.map((sv, i) => {
            const on = hovered === i
            return (
              <Link
                key={sv.title}
                href="/service"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  minWidth: 0, display: 'block', background: '#FFFFFF',
                  border: `1px solid ${on ? '#FFFFFF' : '#E7E5DE'}`, borderRadius: '6px',
                  padding: '18px 16px', textDecoration: 'none', color: '#16211B',
                  transform: on ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: on ? '0 16px 32px -20px rgba(20,25,22,0.45)' : 'none',
                  transition: 'transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .22s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15.5px', fontWeight: 700, letterSpacing: '-0.01em', color: '#16211B' }}>{sv.title}</span>
                  {sv.free && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#E8F5EE', color: '#076330', borderRadius: '3px', padding: '3px 7px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
                      FREE
                    </span>
                  )}
                </span>
                <span style={{ display: 'block', fontSize: '13px', lineHeight: 1.5, color: '#6E7C74', textWrap: 'pretty', marginBottom: '14px' }}>
                  {sv.body}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#076330' }}>
                  Learn more →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
