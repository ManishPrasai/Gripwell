'use client'

import Link from 'next/link'
import Image from 'next/image'

const SERVICES = [
  { title: 'Wheel alignment',    free: false, body: 'Computerised four-wheel alignment for even wear and straight steering.' },
  { title: 'Puncture repair',    free: false, body: "Repaired while you wait, where it's safe to do so." },
  { title: 'Fitting & balancing',free: false, body: 'Included with every tyre — new valves and disposal too.' },
  { title: 'Log book service',   free: false, body: 'Manufacturer-schedule servicing that keeps your new-car warranty.' },
  { title: 'Safety inspection',  free: true,  body: 'Tread, pressures, brakes and lights — a 15-minute once-over.' },
  { title: 'Pre-RWC check',      free: true,  body: 'Know what needs fixing before the roadworthy test.' },
]

export default function InStoreServices() {
  return (
    <section
      style={{
        background: '#FFFFFF', borderTop: '1px solid #E7E5DE',
        padding: 'clamp(46px,5.4vw,72px) 0', fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .nv-svc-cta:hover { border-color: #076330; background: #E8F5EE; }
        .nv-svc-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; align-items: stretch; }
        .nv-svc-cards  { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3,1fr); gap: 14px; height: 100%; }
        .nv-svc-photo  { position: relative; min-height: 260px; border-radius: 14px; overflow: hidden; }
        @media (max-width: 900px) {
          .nv-svc-layout { grid-template-columns: 1fr; }
          .nv-svc-photo  { min-height: 200px; }
        }
        @media (max-width: 560px) {
          .nv-svc-cards { grid-template-columns: 1fr; grid-template-rows: none; }
        }
        .nv-svc-card:hover { border-color: #076330; box-shadow: 0 10px 22px -14px rgba(20,25,22,0.3); transform: translateY(-2px); }
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

        <div data-reveal className="nv-svc-layout nv-d1">
          <span className="nv-svc-photo">
            <Image
              src="/images/service/workshop-hero.jpg" alt="Inside a Nova Tyres workshop"
              fill sizes="(max-width: 900px) 90vw, 380px" style={{ objectFit: 'cover' }}
            />
          </span>

          <div className="nv-svc-cards">
            {SERVICES.map(sv => (
              <Link
                key={sv.title}
                href="/service"
                className="nv-svc-card"
                style={{
                  minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '16px', border: '1px solid #E7E5DE', borderRadius: '10px',
                  textDecoration: 'none', color: '#16211B',
                  transition: 'border-color .2s, box-shadow .2s, transform .2s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#16211B' }}>{sv.title}</span>
                  {sv.free && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#E8F5EE', color: '#076330', borderRadius: '3px', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em' }}>
                      FREE
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '12.5px', color: '#6E7C74', lineHeight: 1.45 }}>
                  {sv.body}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
