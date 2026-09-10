'use client'

import { useState } from 'react'
import { STORES, NOVA_SWITCHBOARD } from '../../../../lib/stores'

/*
  FAQ accordion for the mobile /wheels page — same presentation as the mobile
  /tyres FAQ, wheel-specific questions.
*/
const FAQS = [
  {
    q: 'How do I know which wheels fit my car?',
    a: 'Match the stud pattern (PCD), offset and centre bore to your vehicle. Tell us your make, model and year and we\'ll only show wheels that bolt straight on.',
  },
  {
    q: 'Will bigger wheels change my speedo?',
    a: 'Only if the overall rolling diameter changes. We pair a plus-size wheel with a lower-profile tyre so the rev-per-km stays the same — your speedo reads true.',
  },
  {
    q: 'Can I keep my current tyres?',
    a: 'If the new wheels are the same diameter and width range, often yes. Going up a size means new tyres — we\'ll quote both together.',
  },
  {
    q: 'Is fitting and balancing included?',
    a: `Yes — mounting, balancing and new valves are free with every wheel at our ${STORES.length} stores. Call ${NOVA_SWITCHBOARD} to book.`,
  },
]

export default function MobileFindWheelsFaq() {
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
                fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 700, color: '#16211B',
              }}
            >
              {f.q}
              <span aria-hidden="true" style={{ color: '#E8572A', fontSize: '15px', flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <p style={{ margin: 0, padding: '0 13px 12px', fontSize: '12px', lineHeight: 1.55, color: '#6E7C74', animation: 'nvMobFade .2s ease' }}>
                {f.a}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
