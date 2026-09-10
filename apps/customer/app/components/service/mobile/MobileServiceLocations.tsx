'use client'

import { useState } from 'react'

/*
  "Where to find us" store accordion from the Mobile Service Page artboard.
  Open branches expand to address + Call / WhatsApp / Directions; the two
  "coming soon" markets are shown greyed. Same list as the desktop service page.
*/

interface Shop {
  name: string; state: string; note: string; address: string
  phone: string | null; wa: string | null; maps: string | null; soon: boolean
}

const SHOPS: Shop[] = [
  { name: 'Springvale', state: 'VIC', note: '4/134 Springvale Rd', address: '4/134 Springvale Rd, Springvale VIC 3171', phone: '0395624269', wa: 'https://wa.me/61401531756', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Springvale', soon: false },
  { name: 'Dandenong', state: 'VIC', note: '308 S Gippsland Hwy', address: '308 S Gippsland Hwy, Dandenong South VIC 3175', phone: '0387875846', wa: 'https://wa.me/61413792400', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Dandenong', soon: false },
  { name: 'Bayswater', state: 'VIC', note: '194 Canterbury Rd', address: '194 Canterbury Rd, Bayswater North VIC 3153', phone: '0397209354', wa: 'https://wa.me/61411879425', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Bayswater', soon: false },
  { name: 'Alphington', state: 'VIC', note: '200 Grange Rd', address: '200 Grange Rd, Alphington VIC 3078', phone: '0403884151', wa: 'https://wa.me/61403884151', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Alphington', soon: false },
  { name: 'Sunshine', state: 'VIC', note: '1B Berkshire Rd', address: '1B Berkshire Rd, Sunshine North VIC 3020', phone: '0401199224', wa: 'https://wa.me/61401199224', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sunshine+North', soon: false },
  { name: 'Sefton', state: 'NSW · Sydney', note: '107 Carlingford St', address: '107 Carlingford St, Sefton NSW 2162', phone: '0403388774', wa: 'https://wa.me/61403388774', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sefton', soon: false },
  { name: 'Brisbane', state: 'QLD', note: 'Serviced from Melbourne', address: '', phone: null, wa: null, maps: null, soon: true },
  { name: 'Adelaide', state: 'SA', note: 'Serviced from Melbourne', address: '', phone: null, wa: null, maps: null, soon: true },
]

const cellBtn: React.CSSProperties = {
  flex: 1, textAlign: 'center', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 700, textDecoration: 'none',
}

export default function MobileServiceLocations() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {SHOPS.map(s => {
        const isOpen = open === s.name
        return (
          <div key={s.name} style={{ borderBottom: '1px solid #E7E5DE' }}>
            {s.soon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 2px', opacity: 0.65 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16211B' }}>
                  {s.name} <span style={{ color: '#999', fontWeight: 600, fontSize: '9px' }}>{s.state}</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: '#999', fontSize: '9px', fontWeight: 700 }}>Coming soon</span>
                  <span style={{ fontSize: '8px', color: '#bbb' }}>{s.note}</span>
                </span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.name)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#16211B' }}>
                    {s.name} <span style={{ color: '#999', fontWeight: 600, fontSize: '9px' }}>{s.state}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', color: '#076330', fontSize: '9px', fontWeight: 700 }}>Open</span>
                    <span style={{ fontSize: '8px', color: '#999' }}>{s.note}</span>
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 2px 12px', display: 'flex', flexDirection: 'column', gap: '6px', animation: 'nvMobFade .2s ease' }}>
                    <span style={{ fontSize: '10.5px', color: '#666' }}>{s.address}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={`tel:${s.phone}`} style={{ ...cellBtn, border: '1.4px solid #076330', color: '#076330' }}>📞 Call</a>
                      <a href={s.wa ?? '#'} target="_blank" rel="noopener noreferrer" style={{ ...cellBtn, border: '1.4px solid #25D366', color: '#128C7E' }}>WhatsApp</a>
                      <a href={s.maps ?? '#'} target="_blank" rel="noopener noreferrer" style={{ ...cellBtn, background: '#16211B', color: '#fff' }}>Directions</a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
