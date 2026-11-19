'use client'

import { useState } from 'react'
import { STORES, NOVA_SWITCHBOARD } from '../../../../lib/stores'

/*
  The FAQ accordion from the "Mobile Find Tyres" artboard. Same four questions
  as the desktop TyreFAQ so the two stay in sync; tap-to-expand rows on mobile.
*/
const FAQS = [
  {
    q: 'How do I know the tyre size I need?',
    a: "It's printed on your tyre sidewall — e.g. 245/70R16. Width, profile, then rim size. Or call any store and we'll read it for you.",
  },
  {
    q: 'Can I mix different tyre brands?',
    a: 'Yes, as long as sizes match per axle. For best grip and even wear we recommend matching pairs on each axle.',
  },
  {
    q: 'How long will my tyres last?',
    a: 'Typically 25,000–50,000 miles depending on the tyre and your driving. Free tread checks at any store, any time.',
  },
  {
    q: 'Do you offer mobile fitting?',
    a: `Fitting happens at our ${STORES.length} stores — usually same day, under an hour. Call ${NOVA_SWITCHBOARD} to check mobile options in your area.`,
  },
]

export default function MobileFindTyresFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {FAQS.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} style={{ border: '1px solid #E7E5DE', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                padding: '12px 13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 700, color: '#1A1D23',
              }}
            >
              {f.q}
              <span aria-hidden="true" style={{ color: '#FF6A1A', fontSize: '15px', flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <p style={{ margin: 0, padding: '0 13px 12px', fontSize: '12px', lineHeight: 1.55, color: '#6B7280', animation: 'nvMobFade .2s ease' }}>
                {f.a}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
