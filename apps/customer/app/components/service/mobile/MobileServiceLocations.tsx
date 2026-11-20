'use client'

import { useState } from 'react'
import { STORES, waHref, fullAddress, directionsHref } from '@/lib/stores'

const cellBtn: React.CSSProperties = {
  flex: 1, textAlign: 'center', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 700, textDecoration: 'none',
}

export default function MobileServiceLocations() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {STORES.map(s => {
        const isOpen = open === s.id
        return (
          <div key={s.id} style={{ borderBottom: '1px solid #E7E5DE' }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : s.id)}
              aria-expanded={isOpen}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1A1D23' }}>
                {s.short} <span style={{ color: '#999', fontWeight: 600, fontSize: '9px' }}>{s.state}</span>
              </span>
              <span style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', color: '#2A2E36', fontSize: '9px', fontWeight: 700 }}>Open</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{s.address}</span>
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 2px 12px', display: 'flex', flexDirection: 'column', gap: '6px', animation: 'nvMobFade .2s ease' }}>
                <span style={{ fontSize: '10.5px', color: '#666' }}>{fullAddress(s)}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={`tel:${s.tel}`} style={{ ...cellBtn, border: '1.4px solid #2A2E36', color: '#2A2E36' }}>📞 Call</a>
                  <a href={waHref(s)} target="_blank" rel="noopener noreferrer" style={{ ...cellBtn, border: '1.4px solid #25D366', color: '#128C7E' }}>WhatsApp</a>
                  <a href={directionsHref(s)} target="_blank" rel="noopener noreferrer" style={{ ...cellBtn, background: '#1A1D23', color: '#fff' }}>Directions</a>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
