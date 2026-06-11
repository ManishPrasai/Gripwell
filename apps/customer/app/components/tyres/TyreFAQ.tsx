'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'How do I know the tyre size I need?',
    a: 'Check the sidewall of your existing tyres or the sticker inside your driver door — it shows the recommended size for your vehicle.',
  },
  {
    q: 'Can I mix different tyre brands?',
    a: 'It is generally recommended to fit matching tyres on the same axle for optimal handling and safety.',
  },
  {
    q: 'How long will my tyre last?',
    a: 'On average, tyres last 40,000–70,000 km depending on driving style, road conditions and maintenance.',
  },
  {
    q: 'Do you offer mobile fitting?',
    a: "We currently offer fitting at our 9 store locations across Australia. Book online and we'll have you sorted fast.",
  },
]

export default function TyreFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section style={{ background: '#fff', paddingTop: '8px', paddingBottom: '56px' }}>
      <div className="nv-shell">

        {/* Divider */}
        <div style={{ height: '1px', background: '#E8E8E8', marginBottom: '32px' }} />

        <h2 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontWeight: 900,
          color: '#1A1A1A',
          marginBottom: '20px',
        }}>
          Frequently Asked Questions
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
        >
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #CCCCCC',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Question row */}
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '16px 14px',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#696969', lineHeight: 1.4 }}>
                  {faq.q}
                </span>
                <i
                  className="ti ti-chevron-down"
                  style={{
                    fontSize: '18px',
                    color: '#1A1A1A',
                    flexShrink: 0,
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                  aria-hidden="true"
                />
              </button>

              {/* Answer */}
              {open === i && (
                <div
                  style={{
                    padding: '0 14px 14px',
                    borderTop: '1px solid #EBEBEB',
                    paddingTop: '12px',
                  }}
                >
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#777', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
