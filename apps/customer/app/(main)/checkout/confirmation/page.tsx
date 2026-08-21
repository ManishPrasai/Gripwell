'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ── Order progress steps ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Order Confirmed', done: true  },
  { label: 'Items Dispatched', done: false },
  { label: 'Arrived at Store', done: false },
  { label: 'Fitted & Ready',   done: false },
]

// ── Main confirmation content (uses useSearchParams — requires Suspense) ──────
function ConfirmationContent() {
  const params      = useSearchParams()
  const orderNumber = params.get('order') ?? 'NVT-UNKNOWN'
  const totalStr    = params.get('total')
  const total       = totalStr ? parseFloat(totalStr) : null
  const orderDate   = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const [store, setStore] = useState({ name: 'Nova Tyres Sefton', address: '107 Carlingford St, Sefton NSW 2162', phone: '0403 388 774' })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nova_selected_store')
      if (raw) {
        const s = JSON.parse(raw)
        setStore({
          name:    s.name,
          address: `${s.address}, ${s.suburb} ${s.state} ${s.postcode}`,
          phone:   s.phone ?? '',
        })
      }
    } catch {}
  }, [])

  return (
    <main style={{ background: '#0D1A12', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px', color: '#FAF9F5' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '40px 24px 56px' }}>

        {/* Glow ring + checkmark */}
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: 'rgba(25,210,106,0.1)',
          border: '2px solid #19D26A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 0 12px rgba(25,210,106,0.05), 0 0 40px rgba(25,210,106,0.15)',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#19D26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
          fontWeight: 700, letterSpacing: '0.22em', color: '#19D26A',
          textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Payment Successful
        </p>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(42px, 7vw, 74px)',
          letterSpacing: '0.03em', lineHeight: 1,
          color: '#FAF9F5', margin: '0 0 16px',
        }}>
          Thank You For Your Order!
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '16px',
          color: '#7BA88A', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.8,
        }}>
          Your tyres are on their way to the fitting station.
          We&apos;ll call you when they arrive to book your fitting appointment.
        </p>

        {/* Order reference pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '999px', padding: '11px 22px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BA88A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#7BA88A', fontWeight: 500 }}>
            Order Reference
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
            color: '#FAF9F5', fontWeight: 800, letterSpacing: '0.08em',
          }}>
            {orderNumber}
          </span>
        </div>
      </div>

      {/* ── Detail cards ─────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '0 20px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '16px',
      }}>

        {/* Order summary */}
        <div style={{
          background: '#142019', borderRadius: '20px',
          border: '1px solid rgba(25,210,106,0.1)', padding: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(25,210,106,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className="ti ti-receipt" style={{ fontSize: '18px', color: '#19D26A' }} aria-hidden="true" />
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '16px', color: '#FAF9F5', margin: 0 }}>
              Order Summary
            </h2>
          </div>

          {([
            { label: 'Order Number', value: orderNumber,    mono: true  },
            { label: 'Date',         value: orderDate                   },
            { label: 'Payment',      value: 'Stripe — AUD'             },
            { label: 'Fitting Fee',  value: 'A$25.00 (included)'       },
            total !== null
              ? { label: 'Total Charged', value: `A$${total.toFixed(2)}`, highlight: true }
              : null,
          ] as ({ label: string; value: string; mono?: boolean; highlight?: boolean } | null)[])
            .filter((r): r is { label: string; value: string; mono?: boolean; highlight?: boolean } => r !== null)
            .map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '13px', marginBottom: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#5A8066', fontWeight: 500 }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: row.mono ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                  fontSize:   row.highlight ? '20px' : '13px',
                  color:      row.highlight ? '#FF5A1F' : '#D4E8DA',
                  fontWeight: row.highlight ? 900 : 600,
                  letterSpacing: row.mono ? '0.06em' : undefined,
                }}>
                  {row.value}
                </span>
              </div>
            ))
          }
        </div>

        {/* Fitting station */}
        <div style={{
          background: '#142019', borderRadius: '20px',
          border: '1px solid rgba(25,210,106,0.1)', padding: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(255,90,31,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className="ti ti-map-pin" style={{ fontSize: '18px', color: '#FF5A1F' }} aria-hidden="true" />
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '16px', color: '#FAF9F5', margin: 0 }}>
              Fitting Station
            </h2>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '18px', color: '#FAF9F5', marginBottom: '6px' }}>
            {store.name}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#5A8066', lineHeight: 1.7, marginBottom: '16px' }}>
            {store.address}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <i className="ti ti-phone" style={{ fontSize: '14px', color: '#5A8066' }} aria-hidden="true" />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#7BA88A' }}>{store.phone}</span>
          </div>

          {/* Delivery info badge */}
          <div style={{
            background: 'rgba(25,210,106,0.05)',
            border: '1px solid rgba(25,210,106,0.14)',
            borderRadius: '12px', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <i className="ti ti-truck" style={{ fontSize: '15px', color: '#19D26A' }} aria-hidden="true" />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: '#19D26A' }}>
                Free delivery to store
              </span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#5A8066', margin: 0, lineHeight: 1.65 }}>
              Tyres typically arrive within{' '}
              <strong style={{ color: '#7BA88A' }}>2–3 business days</strong>.
              We&apos;ll call you to confirm your fitting appointment.
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress tracker ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '16px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#142019', borderRadius: '20px',
          border: '1px solid rgba(25,210,106,0.1)', padding: '28px 32px',
        }}>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: '15px', color: '#FAF9F5', marginBottom: '30px',
          }}>
            Order Progress
          </h2>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
              >
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '17px', left: '50%', right: '-50%', height: '2px',
                    background: step.done ? 'rgba(25,210,106,0.5)' : 'rgba(255,255,255,0.07)',
                  }} />
                )}

                {/* Step circle */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', zIndex: 1, marginBottom: '10px',
                  background: step.done ? '#19D26A' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${step.done ? '#19D26A' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step.done ? '0 0 16px rgba(25,210,106,0.3)' : 'none',
                }}>
                  {step.done
                    ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1A12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )
                    : <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  }
                </div>

                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: step.done ? 700 : 500,
                  color: step.done ? '#19D26A' : '#3D5C48',
                  textAlign: 'center', margin: 0, lineHeight: 1.45,
                  maxWidth: '80px',
                }}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What happens next ────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '16px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#142019', borderRadius: '20px',
          border: '1px solid rgba(25,210,106,0.1)', padding: '28px 32px',
        }}>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: '15px', color: '#FAF9F5', marginBottom: '20px',
          }}>
            What Happens Next
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                icon: 'ti-mail',
                color: '#19D26A',
                title: 'Order confirmation email',
                body: 'A receipt with your order details will be sent to your email address shortly.',
              },
              {
                icon: 'ti-truck',
                color: '#FF5A1F',
                title: 'Tyres dispatched to store',
                body: 'Your tyres are shipped directly to Nova Tyres Sefton. Estimated arrival: 2–3 business days.',
              },
              {
                icon: 'ti-phone',
                color: '#3B82F6',
                title: "We'll call to confirm your appointment",
                body: 'Once your tyres arrive, our team will call you to lock in a fitting time that suits you.',
              },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, marginTop: '1px',
                  background: `${item.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: '17px', color: item.color }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#D4E8DA', marginBottom: '4px' }}>
                    {item.title}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#5A8066', margin: 0, lineHeight: 1.65 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTAs ─────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '900px', margin: '28px auto 0', padding: '0 20px',
        display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#FF5A1F', color: '#fff',
            padding: '13px 30px', borderRadius: '999px',
            textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px',
            letterSpacing: '0.01em',
          }}
        >
          Continue Shopping
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>

        <button
          disabled
          title="Coming soon"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            color: '#3D5C48',
            padding: '13px 30px', borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.07)',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px',
            cursor: 'not-allowed',
          }}
        >
          <i className="ti ti-package" style={{ fontSize: '15px' }} aria-hidden="true" />
          Track Order
          <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.6 }}>(coming soon)</span>
        </button>
      </div>

    </main>
  )
}

// ── Skeleton shown while useSearchParams resolves ─────────────────────────────
function ConfirmationSkeleton() {
  return (
    <main style={{
      background: '#0D1A12', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#3D5C48' }}>
        Loading your confirmation…
      </p>
    </main>
  )
}

// ── Page export — Suspense required by Next.js for useSearchParams ────────────
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  )
}
