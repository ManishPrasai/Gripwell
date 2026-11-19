'use client'

import { useState } from 'react'

/*
  Service-menu accordion from the Mobile Service Page artboard — the five
  service levels. Same tier data as the desktop service page.
*/
const TIERS = [
  {
    id: 'logbook', num: '01', name: 'Manufacturer Service', eyebrow: 'Warranty-safe servicing', big: 'OEM', lab: 'per maker schedule',
    desc: 'For newer vehicles still following their manufacturer service schedule. Carried out by fully qualified mechanics — without affecting your new-car warranty.',
    inc: ['Quality Parts & Oils', 'Service Book Stamp', 'Safety Inspection', 'Fully Qualified'],
  },
  {
    id: 'yearly', num: '02', name: 'Yearly Service', eyebrow: 'Essential maintenance', big: '15K', lab: 'km · every 1 year',
    desc: 'Usually done every 10,000 miles. Prevents unnecessary wear and tear and keeps your car running in optimal condition.',
    inc: ['Engine Oil Change', 'Oil Filter', 'Safety Inspection', 'Under-Bonnet Check'],
  },
  {
    id: '3year', num: '03', name: '3 Year Service', eyebrow: 'Yearly + filters & fluids', big: '45K', lab: 'km · every 3 years',
    desc: 'Includes everything in a Yearly Service, plus air filter and brake fluid change.',
    inc: ['Engine Oil Change', 'Oil Filter', 'Air Filter', 'Brake Fluid Change'],
  },
  {
    id: '6year', num: '04', name: '6 Year Service', eyebrow: '3 Year + ignition & cooling', big: '100K', lab: 'km · every 6 years',
    desc: 'Includes everything in a 3 Year Service, plus coolant, spark plugs and fuel filter change.',
    inc: ['Engine Coolant', 'Spark Plugs', 'Fuel Filter', 'Safety Inspection'],
  },
  {
    id: 'ultimate', num: '05', name: 'Ultimate Service', eyebrow: 'The complete overhaul', big: 'MAX', lab: 'every fluid & filter',
    desc: 'The most comprehensive service. Includes everything in a 6 Year Service, plus fuel injection cleaning and fuel tank treatment.',
    inc: ['Fuel Injection Clean', 'Fuel Tank Treatment', 'All 6 Year items', 'Full Safety Check'],
  },
]

export default function MobileServiceTiers() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {TIERS.map(t => {
        const isOpen = open === t.id
        return (
          <div key={t.id} style={{ borderBottom: '1px solid #E7E5DE' }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : t.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 2px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1A1D23' }}>{t.num} {t.name}</span>
              <span style={{ color: '#FF6A1A', fontSize: '12px', flexShrink: 0 }}>{isOpen ? '⌄' : '›'}</span>
            </button>

            {isOpen && (
              <div style={{ padding: '0 2px 14px', animation: 'nvMobFade .2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                  <span style={{ fontSize: '9px', color: '#FF6A1A', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.eyebrow}</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1D23', flexShrink: 0 }}>
                    {t.big} <span style={{ fontSize: '8px', color: '#999', fontWeight: 600 }}>· {t.lab}</span>
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: '#666', lineHeight: 1.5 }}>{t.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
                  {t.inc.map(item => (
                    <span key={item} style={{ fontSize: '11px', color: '#1A1D23', display: 'flex', gap: '5px' }}>
                      <span style={{ color: '#2A2E36' }}>✓</span>{item}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '12px' }}>
                  <a href="#svc-book" style={{ background: '#FF6A1A', color: '#fff', fontSize: '11.5px', fontWeight: 700, borderRadius: '8px', padding: '9px 14px', textDecoration: 'none', flexShrink: 0 }}>
                    Book this service →
                  </a>
                  <span style={{ fontSize: '8.5px', color: '#999' }}>Call-back within the hour</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
