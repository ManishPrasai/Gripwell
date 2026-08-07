'use client'

import { useState } from 'react'
import { C, FONT, CONTAINER } from '../shop/tokens'
import { STORES, NOVA_SWITCHBOARD } from '../../../lib/stores'

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
    a: 'Typically 40,000–80,000 km depending on the tyre and your driving. Free tread checks at any store, any time.',
  },
  {
    q: 'Do you offer mobile fitting?',
    a: `Fitting happens at our ${STORES.length} stores — usually same day, under an hour. Call ${NOVA_SWITCHBOARD} to check mobile options in your area.`,
  },
]

export default function TyreFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section style={{ background: '#fff', padding: '0 clamp(16px,3vw,64px) clamp(40px,5vw,64px)', fontFamily: FONT }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ font: `800 clamp(24px,2.8vw,32px) ${FONT}`, color: C.ink, margin: 0, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            Frequently asked questions
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '12px', alignItems: 'start' }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} style={{ border: `1px solid ${C.line}`, borderRadius: '3px' }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '15px 16px',
                    fontSize: '14.5px', fontWeight: 700, color: C.ink, textAlign: 'left', fontFamily: FONT,
                  }}
                >
                  {f.q}
                  <span aria-hidden="true" style={{ color: C.orange, fontSize: '17px' }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 15px', fontSize: '14px', lineHeight: 1.6, color: C.muted }}>
                    {f.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
