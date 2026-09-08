'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      style={{
        maxWidth: '1180px', margin: '0 auto',
        padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,40px)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .nv-news-card { display: grid; gap: clamp(24px,4vw,48px); align-items: center; grid-template-columns: repeat(2,1fr); }
        @media (max-width: 1100px) { .nv-news-card { grid-template-columns: 1fr; } }
        .nv-news-btn:hover  { background: #FF6817; transform: translateY(-2px); box-shadow: 0 14px 26px -14px rgba(232,87,42,0.95); }
        .nv-news-btn:active { transform: translateY(0); }
      `}</style>

      <div
        data-reveal
        className="nv-news-card"
        style={{ background: '#1C3A2B', borderRadius: '20px', padding: 'clamp(28px,4vw,52px)' }}
      >
        <div>
          <p style={{ margin: '0 0 10px', fontFamily: "'DM Mono', monospace", fontSize: '11.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E8572A' }}>
            Nova mailing list
          </p>
          <h2 style={{ margin: '0 0 12px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(32px,4vw,46px)', letterSpacing: '0.02em', color: '#F1EFE7', lineHeight: 1.02 }}>
            Deals before they sell out
          </h2>
          <p style={{ margin: 0, color: '#9DB0A5', fontSize: '15px', lineHeight: 1.65, maxWidth: '44ch' }}>
            Member-only discounts, new arrivals and seasonal tyre tips. One email a fortnight — unsubscribe any time.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="email" required value={email}
              onChange={e => { setEmail(e.target.value); setSubmitted(false); setError(null) }}
              placeholder="you@email.com" aria-label="Email address"
              style={{
                flex: '1 1 220px', minWidth: 0, background: '#FFFFFF', border: '1px solid #E7E5DE',
                borderRadius: '10px', padding: '0 18px', height: '54px', fontSize: '15px',
                color: '#16211B', outline: 'none',
              }}
            />
            <button
              type="submit" className="nv-news-btn" disabled={submitting}
              style={{
                background: '#E8572A', color: '#fff', border: 'none', borderRadius: '10px',
                padding: '0 30px', height: '54px', fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, cursor: submitting ? 'default' : 'pointer', whiteSpace: 'nowrap',
                opacity: submitting ? 0.7 : 1,
                transition: 'transform .18s cubic-bezier(.22,1,.36,1), background .2s, box-shadow .2s, opacity .2s',
              }}
            >
              {submitting ? 'Sending…' : 'Subscribe'}
            </button>
          </form>

          {error ? (
            <p style={{ margin: '14px 0 0', color: '#E8572A', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </p>
          ) : submitted ? (
            <p style={{ margin: '14px 0 0', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#39C06E', fontSize: '14px', fontWeight: 600, animation: 'novaIn .3s ease both' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              You&apos;re on the list — check your inbox to confirm.
            </p>
          ) : (
            <p style={{ margin: '14px 0 0', fontSize: '12.5px', color: '#9DB0A5' }}>
              No spam. We never share your address.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
