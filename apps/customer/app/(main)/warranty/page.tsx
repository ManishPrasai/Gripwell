'use client'

import { useState } from 'react'
import { C, FONT } from '../../components/shop/tokens'
import {
  STORES, telHref, waHref, fullAddress,
  NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF,
} from '../../../lib/stores'

const STEPS = [
  {
    num:   '01',
    title: 'Straight to your store',
    body:  'Call or WhatsApp the store that fitted your tyres — they have your job on file and can act immediately.',
  },
  {
    num:   '02',
    title: 'Bring your invoice',
    body:  'Your order number or receipt speeds everything up. Bought online? Your email confirmation works too.',
  },
  {
    num:   '03',
    title: 'We handle the manufacturer',
    body:  'Inspection, claim paperwork and replacement — we deal with the brand on your behalf, start to finish.',
  },
]

export default function WarrantyPage() {
  const [storeId, setStoreId] = useState(STORES[0].id)
  const store = STORES.find(s => s.id === storeId) ?? STORES[0]

  return (
    <main style={{ fontFamily: FONT }}>
      <style>{`
        .wr-layout { display: flex; gap: clamp(24px,4vw,64px); flex-wrap: wrap; align-items: flex-start; }
        .wr-tel:hover { background: ${C.orangeDark}; }
        .wr-wa:hover  { background: ${C.greenSoft}; }
      `}</style>

      <section style={{ background: C.greenInk, padding: 'clamp(44px,6vw,88px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }} className="wr-layout">

          {/* ── The pitch ── */}
          <div style={{ flex: 1.2, minWidth: 'min(320px,100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ width: '44px', height: '4px', background: C.orange }} />
              <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: C.onDarkWarm }}>
                Warranty &amp; claims
              </span>
            </div>

            <h1 style={{ font: `800 clamp(32px,4.6vw,56px)/1.02 ${FONT}`, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '.5px', maxWidth: '14ch' }}>
              Warranty? Talk to us.
            </h1>

            <p style={{ fontSize: 'clamp(14.5px,1.5vw,17px)', lineHeight: 1.65, color: C.onDarkMuted, margin: '14px 0 0', maxWidth: '52ch' }}>
              Every tyre and wheel we sell carries the full manufacturer warranty, and our workmanship is
              guaranteed. If something doesn&apos;t feel right, the fastest way to sort it is directly with the
              store that fitted it — no forms, no run-around.
            </p>

            <div style={{ display: 'grid', gap: 0, marginTop: '26px', maxWidth: '560px' }}>
              {STEPS.map(s => (
                <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,.18)', padding: '16px 0', display: 'flex', gap: '14px' }}>
                  <span style={{ font: `800 24px ${FONT}`, color: C.orange }}>{s.num}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{s.title}</div>
                    <div style={{ fontSize: '13.5px', lineHeight: 1.55, color: C.onDarkMuted, marginTop: '2px' }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Get in touch ── */}
          <div style={{ flex: 1, minWidth: 'min(320px,100%)', background: '#fff', borderRadius: '4px', padding: 'clamp(20px,2.8vw,30px)' }}>
            <div style={{ font: `800 26px ${FONT}`, color: C.ink, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Get in touch
            </div>
            <p style={{ fontSize: '14px', color: C.muted, margin: '6px 0 16px' }}>
              Pick the store that fitted your tyres or wheels:
            </p>

            <label>
              <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
                Choose a store
              </span>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                style={{ width: '100%', padding: '13px 10px', border: `1.5px solid ${C.line3}`, borderRadius: '3px', fontSize: '15px', fontWeight: 700, color: C.ink, background: '#fff', fontFamily: FONT }}
              >
                {STORES.map(s => (
                  <option key={s.id} value={s.id}>{s.short} — {s.state}</option>
                ))}
              </select>
            </label>

            <div style={{ border: `1px solid ${C.line}`, borderRadius: '3px', padding: '14px', marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: C.ink }}>{store.name}</div>
              <div style={{ fontSize: '13.5px', color: C.muted, marginTop: '2px' }}>{fullAddress(store)}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              <a href={telHref(store.tel)} className="wr-tel"
                style={{ flex: 1, minWidth: '140px', textAlign: 'center', background: C.orange, borderRadius: '3px', padding: '14px', font: `700 14px ${FONT}`, letterSpacing: '.6px', textTransform: 'uppercase', color: '#fff', textDecoration: 'none' }}>
                {store.tel}
              </a>
              <a href={waHref(store)} target="_blank" rel="noopener noreferrer" className="wr-wa"
                style={{ flex: 1, minWidth: '140px', textAlign: 'center', border: `1.5px solid ${C.green}`, borderRadius: '3px', padding: '13px', font: `700 14px ${FONT}`, letterSpacing: '.6px', textTransform: 'uppercase', color: C.green, textDecoration: 'none' }}>
                WhatsApp us
              </a>
            </div>

            <div style={{ fontSize: '12.5px', color: C.muted2, marginTop: '14px', lineHeight: 1.6 }}>
              Not sure which store? Call <a href={NOVA_SWITCHBOARD_HREF} style={{ fontWeight: 700 }}>{NOVA_SWITCHBOARD}</a> and
              we&apos;ll look up your order. Warranty terms follow each manufacturer&apos;s policy; workmanship is
              guaranteed by Nova Tyres.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
