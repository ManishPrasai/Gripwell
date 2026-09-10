'use client'

import { useState } from 'react'

/*
  The "More than tyres · Services" accordion from the mobile home artboard.
  Content mirrors the desktop InStoreServices list so the two designs stay
  in sync; only the presentation differs (tap-to-expand rows on mobile).
*/
const SERVICES = [
  { id: 'fitting',  name: 'Fitting & balancing', free: true,  body: 'Included with every tyre — new valves and disposal too.' },
  { id: 'align',    name: 'Wheel alignment',     free: false, body: 'Computerised four-wheel alignment for even tyre wear and better handling.' },
  { id: 'puncture', name: 'Puncture repair',     free: false, body: "Repaired while you wait, where it's safe to do so." },
  { id: 'logbook',  name: 'Log book service',    free: false, body: 'Manufacturer-schedule servicing that keeps your new-car warranty intact.' },
  { id: 'safety',   name: 'Safety inspection',   free: true,  body: 'Tread, pressures, brakes and lights — a 15-minute once-over.' },
  { id: 'rwc',      name: 'Pre-RWC check',       free: false, body: 'Know what needs fixing before the roadworthy test.' },
]

export default function MobileServicesList() {
  const [open, setOpen] = useState<string | null>('fitting')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {SERVICES.map(svc => {
        const isOpen = open === svc.id
        return (
          <div key={svc.id} style={{ borderBottom: '1px solid #E7E5DE' }}>
            <button
              onClick={() => setOpen(isOpen ? null : svc.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                padding: '13px 2px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#16211B', display: 'flex', alignItems: 'center', gap: '7px' }}>
                {svc.name}
                {svc.free && (
                  <span style={{ background: '#E8F5EE', color: '#076330', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.06em' }}>
                    FREE
                  </span>
                )}
              </span>
              <span style={{ color: '#9DB0A5', fontSize: '13px', flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .18s' }}>›</span>
            </button>
            {isOpen && (
              <p style={{ margin: '0 0 13px', fontSize: '12.5px', color: '#6E7C74', lineHeight: 1.5, animation: 'nvMobFade .2s ease' }}>
                {svc.body}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
