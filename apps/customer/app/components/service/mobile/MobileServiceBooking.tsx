'use client'

import { useState } from 'react'

/*
  "Book a service" call-back form from the Mobile Service Page artboard.
  Like the desktop service page, this is a front-end-only success state — no
  API call — matching the artboard's submitBooking behaviour.
*/

const SERVICE_OPTIONS = ['Free Pre-RWC Check', 'Log Book Service', 'Yearly Service', '3 Year Service', '6 Year Service', 'Ultimate Service', 'Not sure — please advise']
const STORE_OPTIONS = ['Nova Tyres Springvale', 'Nova Tyres Dandenong', 'Nova Tyres Bayswater', 'Nova Tyres Melbourne (Alphington)', 'Nova Tyres Sunshine', 'Nova Tyres Sefton (Sydney)']

const field: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #E7E5DE', borderRadius: '6px',
  height: '32px', padding: '0 8px', fontSize: '11px', fontFamily: 'inherit', background: '#fff', color: '#16211B',
}
const label: React.CSSProperties = { display: 'block', fontSize: '8px', color: '#999', letterSpacing: '0.05em', marginBottom: '3px' }

export default function MobileServiceBooking() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '28px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', animation: 'nvMobFade .3s ease' }}>
        <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E8F5EE', color: '#076330', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>✓</span>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#16211B' }}>Request sent!</span>
        <span style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
          Thanks — one of our team will call you back shortly to lock in your service.
        </span>
      </div>
    )
  }

  return (
    <form
      onSubmit={e => { e.preventDefault(); setSent(true) }}
      noValidate
      style={{ background: '#fff', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '9px' }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <span style={label}>YOUR NAME</span>
          <input required style={field} placeholder="Jane Smith" autoComplete="name" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={label}>PHONE</span>
          <input required type="tel" style={field} placeholder="0400 000 000" autoComplete="tel" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <span style={label}>VEHICLE</span>
          <input style={field} placeholder="Make & model" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={label}>SERVICE</span>
          <select style={{ ...field, padding: '0 6px', fontSize: '10px' }} defaultValue={SERVICE_OPTIONS[0]}>
            {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <span style={label}>PREFERRED LOCATION</span>
        <select style={field} defaultValue={STORE_OPTIONS[0]}>
          {STORE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <span style={label}>ANYTHING ELSE?</span>
        <textarea
          style={{ ...field, height: '52px', padding: '8px', resize: 'none' }}
          placeholder="Preferred day/time, warning lights, noises…"
        />
      </div>
      <button
        type="submit"
        style={{ textAlign: 'center', background: '#E8572A', color: '#fff', fontSize: '12px', fontWeight: 800, border: 'none', borderRadius: '24px', padding: '12px', marginTop: '2px', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Request my call-back →
      </button>
      <span style={{ textAlign: 'center', fontSize: '9px', color: '#999' }}>🔒 No obligation — we’ll never share your details.</span>
    </form>
  )
}
