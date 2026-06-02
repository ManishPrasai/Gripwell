'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Background image with bokeh blur */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/images/newsletter-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.22,
          filter: 'blur(2px)',
          transform: 'scale(1.06)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p
          className="uppercase tracking-widest mb-3"
          style={{ color: '#E8572A', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(20px, 4vw, 32px)', letterSpacing: '0.2em' }}
        >
          Stay in the Loop
        </p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', letterSpacing: '0.02em', lineHeight: 1.1 }} className="mb-2">
          Deals before they{' '}
          <em style={{ color: '#E8572A', fontStyle: 'italic' }}>hit the warehouse.</em>
        </h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: 400 }}>
          Get exclusive discounts, new arrivals and tyre tips delivered to your inbox.
        </p>

        {submitted ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white"
            style={{ background: '#1C3A2B', border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', fontWeight: 400 }}
          >
            <i className="ti ti-check" style={{ fontSize: '18px', color: '#E8572A' }} aria-hidden="true" />
            You&apos;re subscribed — deals incoming!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/30"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '15px', fontWeight: 400 }}
            />
            <button
              type="submit"
              className="text-white px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: '#E8572A', fontSize: '14px', fontWeight: 600 }}
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
