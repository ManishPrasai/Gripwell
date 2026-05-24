'use client'

import { useState, useEffect } from 'react'

interface Store {
  id: string
  name: string
  slug: string
}

export default function BookingSection() {
  const [stores, setStores]   = useState<Store[]>([])
  const [store, setStore]     = useState('')
  const [service, setService] = useState('')
  const [time, setTime]       = useState('')

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(data => setStores(data.stores || []))
      .catch(() => {})
  }, [])

  const services = [
    'Tyre Fitting',
    'Wheel Alignment',
    'Log Book Service',
    'Yearly Service',
    'Safety Inspection',
    'RWC Check',
  ]

  const times = [
    'Tomorrow — 9AM',
    'Tomorrow — 11AM',
    'Tomorrow — 1PM',
    'Tomorrow — 3PM',
    'In 2 days — 9AM',
    'In 2 days — 11AM',
  ]

  return (
    <section
      className="relative py-16 px-4 overflow-hidden"
      style={{ background: '#0F1F15' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/images/tyres-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(15,31,21,0.85)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        <p
          className="uppercase tracking-widest mb-4"
          style={{ color: '#E8572A', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 500 }}
        >
          1 Minute Booking
        </p>

        <h2 className="mb-2 leading-tight" style={{ color: 'white', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '0.02em' }}>
          <em style={{ color: '#E8572A', fontStyle: 'italic' }}>Walk in.</em>{' '}
          Drive out sharper.
        </h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 400 }}>
          Pick a store, pick a slot, confirm booking.
        </p>

        <div
          className="rounded-2xl p-4 md:p-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                Store
              </label>
              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="w-full rounded-lg px-3 py-3 outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">Select store...</option>
                {stores.map(s => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                Service
              </label>
              <select
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full rounded-lg px-3 py-3 outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">Select service...</option>
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                Time
              </label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-lg px-3 py-3 outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">Select time...</option>
                {times.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="w-full text-white py-4 rounded-xl uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{ background: '#E8572A', letterSpacing: '0.08em', fontSize: '14px', fontWeight: 600 }}
          >
            Call to Book
          </button>

          <p className="mt-3" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500 }}>
            Or call us directly on{' '}
            <a href="tel:1300897337" style={{ color: '#E8572A' }}>1300 TYRES</a>
            {' '}— Mon–Sat 8am–6pm AEST
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {['Pick your tyre & size', 'Choose place & time', 'We fit it on the spot'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: '#E8572A', fontSize: '11px', fontWeight: 500 }}
              >
                {i + 1}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
