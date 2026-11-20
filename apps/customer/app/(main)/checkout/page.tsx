'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../../context/CartContext'
import { fittingRate, isVehicleType, quoteOrder, money, type VehicleType, type CartTotals } from '../../../lib/fitting'

// ── Stripe ───────────────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Constants ────────────────────────────────────────────────────────────────
const UK_COUNTIES = ['Greater London', 'Surrey', 'Kent', 'Essex', 'Hertfordshire', 'Berkshire', 'Buckinghamshire', 'Other']
// Full UK postcode, e.g. NW1 9NX, SW1A 1AA, E1 6RL (space optional).
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i

const DEFAULT_STORE = {
  name:    'Gripwell Camden',
  address: '14 Kentish Town Rd',
  state:   'Camden NW1 9NX',
  phone:   '+442079460101',
}

type Step = 1 | 2 | 3

// ── Shared styles ────────────────────────────────────────────────────────────
const field: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 14px',
  border: '1.5px solid #D8D8D8', borderRadius: '8px',
  fontFamily: 'var(--gw-font)', fontSize: '14px',
  color: '#1A1A1A', background: '#fff', outline: 'none',
}
const lbl: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--gw-font)', fontSize: '12px',
  fontWeight: 600, color: '#666', marginBottom: '6px',
}

// ── Brand logo with error fallback ───────────────────────────────────────────
function BrandLogo({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '11px', color: '#444' }}>{brand}</span>
  return <Image src={src} alt={brand} width={68} height={16} style={{ objectFit: 'contain', height: '15px', width: 'auto', maxWidth: '68px' }} onError={() => setErr(true)} />
}

// ── Step card shell ──────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E8E8E8', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  )
}

// ── Step header ──────────────────────────────────────────────────────────────
function StepHead({
  icon, title, sub, active, onClick,
}: { icon: string; title: string; sub: string; active: boolean; onClick?: () => void }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: active ? '#EDF7F1' : '#F5F5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: '22px', color: active ? '#2A2E36' : '#999' }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '16px', color: '#1A1A1A', margin: 0 }}>{title}</p>
        <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#999', margin: '2px 0 0' }}>{sub}</p>
      </div>
      {!active && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </div>
  )
}

// ── Orange full-width button ─────────────────────────────────────────────────
function OBtn({ children, onClick, type = 'button', disabled = false }: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'submit' | 'button'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        background: disabled ? '#E8E8E8' : '#FF5A1F',
        color: disabled ? '#AAA' : '#fff',
        border: 'none', borderRadius: '10px', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '15px',
        letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s, background 0.2s',
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.opacity = '0.88' }}
      onMouseOut={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

// ── Billing details shape (built from steps 1 + 2 and forwarded to Stripe) ───
interface StripeBillingDetails {
  name:    string
  email:   string
  phone:   string
  address: { line1: string; city: string; state: string; postal_code: string; country: string }
}

// ── Stripe payment form (must live inside <Elements>) ────────────────────────
function StripePaymentForm({
  onSuccess,
  total,
  billingDetails,
  notes,
  paymentIntentId,
}: {
  onSuccess:      (orderNumber: string, orderTotal: number) => void
  total:          number
  billingDetails: StripeBillingDetails
  notes:          string
  paymentIntentId: string
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [payError,      setPayError]      = useState<string | null>(null)
  const [paying,        setPaying]        = useState(false)
  const [elementReady,  setElementReady]  = useState(false)

  async function handlePay() {
    if (!stripe || !elements || !elementReady) return
    setPaying(true)
    setPayError(null)

    try {
      // Put the notes on the PaymentIntent before paying, so the order keeps
      // them even when the Stripe webhook records it instead of this page.
      if (notes.trim()) {
        await fetch('/api/checkout/notes', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ paymentIntentId, notes }),
        }).catch(() => {})   // non-blocking: the success route still receives them below
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          payment_method_data: { billing_details: billingDetails },
        },
        redirect: 'if_required',
      })

      if (error) {
        setPayError(error.message ?? 'Payment failed. Please try again.')
        return
      }

      let ck: { email?: string; name?: string; storeName?: string } = {}
      try { ck = JSON.parse(localStorage.getItem('gw_checkout') || '{}') } catch {}
      const res  = await fetch('/api/checkout/success', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentIntentId: paymentIntent?.id ?? null, email: ck.email, name: ck.name, storeName: ck.storeName, notes }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPayError(data.error ?? 'Order creation failed. Please contact us.')
        return
      }

      onSuccess(data.orderNumber, data.total ?? total)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setPayError(msg || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Security badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EDF7F1', border: '1px solid #B8DFC5', borderRadius: '8px', padding: '10px 14px' }}>
        <svg width="16" height="18" viewBox="0 0 24 28" fill="none">
          <path d="M12 1L2 5.5V12c0 6.08 4.33 11.74 10 13.12C17.67 23.74 22 18.08 22 12V5.5L12 1z" fill="#2A2E36"/>
          <polyline points="8 13.5 11 16.5 16 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'var(--gw-font)', fontWeight: 600, fontSize: '13px', color: '#2A2E36' }}>
          Pay securely powered by Stripe
        </span>
      </div>

      {/* Card form — billing fields suppressed, already collected in steps 1 & 2 */}
      {!elementReady && (
        <p style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#AAA', textAlign: 'center', margin: 0 }}>
          Loading payment form…
        </p>
      )}
      <PaymentElement
        onReady={() => setElementReady(true)}
        onLoadError={(e) => setPayError(`Stripe failed to load: ${e.error?.message ?? 'unknown error'}`)}
        options={{
          fields: { billingDetails: 'never' },
        }}
      />

      {/* Payment error */}
      {payError && (
        <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '12px 16px' }}>
          <p style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#C62828', margin: 0 }}>{payError}</p>
        </div>
      )}

      {/* Place order */}
      <OBtn onClick={handlePay} disabled={paying || !stripe || !elements || !elementReady}>
        {paying ? 'Processing…' : !elementReady ? 'Loading payment form…' : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 28" fill="none">
              <path d="M12 1L2 5.5V12c0 6.08 4.33 11.74 10 13.12C17.67 23.74 22 18.08 22 12V5.5L12 1z" fill="rgba(255,255,255,0.9)"/>
              <polyline points="8 13.5 11 16.5 16 10.5" stroke="#FF5A1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Place order — {money(total)}
          </>
        )}
      </OBtn>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, cartCount, clearCart } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', prefix: '+44' })

  // Step 2
  const [billing, setBilling] = useState({ street: '', city: '', county: 'Greater London', postcode: '' })

  // Step 3 — Stripe
  const [clientSecret,     setClientSecret]     = useState<string | null>(null)
  const [payIntentLoading, setPayIntentLoading] = useState(false)
  const [payIntentError,   setPayIntentError]   = useState<string | null>(null)

  // Selected fitting store (read from cart localStorage)
  const [selectedStore, setSelectedStore] = useState(DEFAULT_STORE)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gw_selected_store')
      if (raw) {
        const s = JSON.parse(raw)
        setSelectedStore({
          name:    s.name,
          address: `${s.address}, ${s.suburb}`,
          state:   `${s.state} ${s.postcode}`,
          phone:   s.phone ?? '',
        })
      }
    } catch {}
  }, [])

  // The cart's fitting choice (fit vs pickup, vehicle type, how many) — same
  // localStorage key CartContents.tsx writes to, so the summary here matches
  // what the server actually charges instead of a flat guessed fee.
  const [isFit,       setIsFit]       = useState(true)
  const [vehicleType, setVehicleType] = useState<VehicleType>('passenger')
  const [fitCount,    setFitCount]    = useState<number | null>(null) // null = every wheel position
  const [cartRate,    setCartRate]    = useState<number | null>(null)
  // Totals returned by the server when the PaymentIntent is created: exactly what Stripe charges.
  const [charged,     setCharged]     = useState<CartTotals | null>(null)

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('gw_fitting') || '{}')
      setIsFit(raw.method !== 'pickup')
      setVehicleType(isVehicleType(raw.vehicleType) ? raw.vehicleType : 'passenger')
      setFitCount(Number.isFinite(raw.fitCount) ? raw.fitCount : null)
      setCartRate(Number.isFinite(raw.rate) ? raw.rate : null)
    } catch {}
  }, [cartCount])

  // Misc
  const [notes,         setNotes]         = useState('')
  const [placed,        setPlaced]        = useState(false)
  const [redirectBanner, setRedirectBanner] = useState<{ ok: boolean; msg: string } | null>(null)

  // ── Handle return from redirect-based payment methods ─────────────────────
  // When Stripe sends users back from PayPal / Clearpay / Klarna it appends
  // redirect_status, payment_intent, and payment_intent_client_secret to the URL.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('redirect_status')
    const piId   = params.get('payment_intent')

    if (status === 'succeeded' && piId) {
      // Redirect-based method (PayPal / Clearpay / Klarna) returned successfully.
      // Call the success route to record the order, then navigate to confirmation.
      let ck: { email?: string; name?: string; storeName?: string } = {}
      try { ck = JSON.parse(localStorage.getItem('gw_checkout') || '{}') } catch {}
      fetch('/api/checkout/success', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentIntentId: piId, email: ck.email, name: ck.name, storeName: ck.storeName }),
      })
        .then(r => r.json())
        .then(data => {
          clearCart()
          router.push(
            `/checkout/confirmation?order=${encodeURIComponent(data.orderNumber)}&total=${Number(data.total ?? 0).toFixed(2)}`,
          )
        })
        .catch(() =>
          setRedirectBanner({ ok: false, msg: 'Payment succeeded but we could not record your order. Please contact us.' }),
        )
      return
    }

    if (status === 'failed') {
      setRedirectBanner({ ok: false, msg: 'Your payment was declined. Please try a different payment method.' })
    } else if (status === 'canceled') {
      setRedirectBanner({ ok: false, msg: 'Payment was cancelled. You can fill in your details and try again.' })
    }
  }, []) // runs once on mount only

  // Same maths as the cart and the server (lib/fitting.ts). Once the server has
  // priced the PaymentIntent, its figures win so the button shows the charge.
  const estimate = quoteOrder({
    lines: items.map(i => ({ productType: i.productType, quantity: i.qty, unitPrice: i.price })),
    fittingRate: cartRate ?? fittingRate(vehicleType), fit: isFit, fitCount,
  })
  const totals   = charged ?? estimate
  const total    = totals.total
  const divider = <div style={{ height: '1px', background: '#F0F0F0', margin: '0 24px' }} />

  // ── Billing details forwarded to Stripe (avoids duplicate fields in PaymentElement) ──
  const stripeBillingDetails: StripeBillingDetails = {
    name:  `${contact.firstName} ${contact.lastName}`.trim() || 'Customer',
    email: contact.email,
    phone: `${contact.prefix}${contact.phone}`.replace(/\s/g, ''),
    address: {
      line1:       billing.street,
      city:        billing.city,
      state:       billing.county === 'Other' ? '' : billing.county,
      postal_code: billing.postcode.trim().toUpperCase(),
      country:     'GB',
    },
  }

  // ── Fetch Stripe PaymentIntent when advancing to Step 3 ───────────────────
  async function advanceToPayment() {
    if (!billing.street.trim() || !billing.city.trim()) {
      setPayIntentError('Enter your street address and town or city.')
      return
    }
    if (!UK_POSTCODE.test(billing.postcode.trim())) {
      setPayIntentError('Enter a full UK postcode, for example NW1 9NX.')
      return
    }
    setPayIntentLoading(true)
    setPayIntentError(null)
    // Persist contact + store for the order confirmation email (survives redirect flows).
    try {
      let storeName = ''
      try { storeName = (JSON.parse(localStorage.getItem('gw_selected_store') || '{}') as { name?: string }).name || '' } catch {}
      localStorage.setItem('gw_checkout', JSON.stringify({
        email: contact.email, name: `${contact.firstName} ${contact.lastName}`.trim(), storeName,
      }))
    } catch {}
    try {
      // Carry the cart's fitting choice so the server charges the right total.
      let fitting: { vehicleType?: string; method?: string; storeId?: string; fitCount?: number } = {}
      try { fitting = JSON.parse(localStorage.getItem('gw_fitting') || '{}') } catch {}
      const res  = await fetch('/api/checkout/create-payment-intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ vehicleType: fitting.vehicleType, method: fitting.method, storeId: fitting.storeId, fitCount: fitting.fitCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment')
      setClientSecret(data.clientSecret)
      if (data.totals) setCharged(data.totals)
      setStep(3)
    } catch (err) {
      setPayIntentError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPayIntentLoading(false)
    }
  }

  // ── Navigate to confirmation page after successful payment + order creation ──
  function handleSuccess(orderNumber: string, orderTotal: number) {
    clearCart()
    router.push(
      `/checkout/confirmation?order=${encodeURIComponent(orderNumber)}&total=${orderTotal.toFixed(2)}`,
    )
  }

  // ── Order confirmed screen (fallback — normally replaced by navigation) ────
  if (placed) {
    return (
      <main style={{ background: '#fff', minHeight: '100vh', paddingTop: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px', padding: '0 24px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#EDF7F1', border: '2px solid #19D26A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A2E36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '32px', color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '12px' }}>Order Confirmed!</h1>
          <p style={{ fontFamily: 'var(--gw-font)', fontSize: '15px', color: '#666', lineHeight: 1.7, marginBottom: '28px' }}>
            Thanks for your order. Your items will be delivered directly to <strong>{selectedStore.name}</strong> for fitting. We&apos;ll be in touch shortly.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FF5A1F', color: '#fff', padding: '13px 28px', borderRadius: '999px', textDecoration: 'none', fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '14px' }}>
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#fff', minHeight: '100vh', paddingTop: '40px', paddingBottom: '72px' }}>

      {/* ── Page heading ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px', paddingTop: '16px' }}>
        <svg width="26" height="30" viewBox="0 0 24 28" fill="none">
          <path d="M12 1L2 5.5V12c0 6.08 4.33 11.74 10 13.12C17.67 23.74 22 18.08 22 12V5.5L12 1z" fill="#1A1A1A" />
          <polyline points="8 13.5 11 16.5 16 10.5" stroke="#19D26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 style={{ fontFamily: 'var(--gw-font)', fontWeight: 900, fontSize: '20px', color: '#1A1A1A', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
          Secured Checkout
        </h1>
      </div>

      {/* ── Post-redirect error / cancel banner ── */}
      {redirectBanner && (
        <div className="nv-shell" style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontFamily: 'var(--gw-font)', fontSize: '14px', color: '#C62828', margin: 0 }}>
              {redirectBanner.msg}
            </p>
            <button
              onClick={() => setRedirectBanner(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#C62828', fontSize: '18px', lineHeight: 1, padding: '2px 4px' }}
              aria-label="Dismiss"
            >×</button>
          </div>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="nv-shell grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">

        {/* ════ LEFT: Steps ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* ── Step 1: Contact ── */}
          <Card>
            <StepHead
              icon="ti-user-circle"
              title="Customer Contact Information"
              sub="Enter your information"
              active={step === 1}
              onClick={step > 1 ? () => setStep(1) : undefined}
            />
            {step === 1 && (
              <>
                {divider}
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={lbl}>First Name</label>
                      <input style={field} type="text" placeholder="John" value={contact.firstName} onChange={e => setContact(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label style={lbl}>Last Name</label>
                      <input style={field} type="text" placeholder="Doe" value={contact.lastName} onChange={e => setContact(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Email Address</label>
                    <input style={field} type="email" placeholder="john.doe@example.com" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Phone Number</label>
                    <div style={{ display: 'flex', border: '1.5px solid #D8D8D8', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                      <select
                        value={contact.prefix}
                        onChange={e => setContact(p => ({ ...p, prefix: e.target.value }))}
                        style={{ padding: '11px 8px 11px 12px', background: '#F7F7F7', border: 'none', borderRight: '1px solid #E5E5E5', outline: 'none', fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#333', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <option value="+44">+44 (UK)</option>
                        <option value="+1">+1 (US)</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="07700 900 000"
                        value={contact.phone}
                        onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                        style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontFamily: 'var(--gw-font)', fontSize: '14px', color: '#1A1A1A' }}
                      />
                    </div>
                  </div>
                  <OBtn onClick={() => setStep(2)}>
                    Continue to Billing Address
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </OBtn>
                </div>
              </>
            )}
          </Card>

          {/* ── Step 2: Billing Address ── */}
          <Card>
            <StepHead
              icon="ti-map-pin"
              title="Billing Address"
              sub="Add your billing address"
              active={step === 2}
              onClick={step > 2 ? () => setStep(2) : undefined}
            />
            {step === 2 && (
              <>
                {divider}
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Street Address</label>
                    <input style={field} type="text" autoComplete="address-line1" placeholder="14 Kentish Town Rd" value={billing.street} onChange={e => setBilling(p => ({ ...p, street: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Town / City</label>
                    <input style={field} type="text" autoComplete="address-level2" placeholder="London" value={billing.city} onChange={e => setBilling(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  {/* auto-fit lets Country (the longest option text) wrap to
                      its own row on narrow phones instead of every column
                      being squeezed to ~70px and clipping its text. */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={lbl}>County (optional)</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{ ...field, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                          value={billing.county}
                          onChange={e => setBilling(p => ({ ...p, county: e.target.value }))}
                        >
                          {UK_COUNTIES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Postcode</label>
                      <input style={{ ...field, textTransform: 'uppercase' }} type="text" autoComplete="postal-code" placeholder="NW1 9NX" maxLength={8} value={billing.postcode} onChange={e => setBilling(p => ({ ...p, postcode: e.target.value }))} />
                    </div>
                  </div>

                  {payIntentError && (
                    <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '12px 16px' }}>
                      <p style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#C62828', margin: 0 }}>{payIntentError}</p>
                    </div>
                  )}

                  <OBtn onClick={advanceToPayment} disabled={payIntentLoading}>
                    {payIntentLoading ? 'Initializing payment…' : (
                      <>
                        Continue to Payment Method
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </>
                    )}
                  </OBtn>
                </div>
              </>
            )}
          </Card>

          {/* ── Step 3: Payment ── */}
          <Card>
            <StepHead
              icon="ti-credit-card"
              title="Payment Method"
              sub="Choose a secure payment option"
              active={step === 3}
            />
            {step === 3 && (
              <>
                {divider}
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#2A2E36',
                            colorBackground: '#ffffff',
                            colorText: '#1A1A1A',
                            colorDanger: '#C62828',
                            fontFamily: 'var(--gw-font)',
                            borderRadius: '8px',
                            spacingUnit: '4px',
                          },
                        },
                      }}
                    >
                      <StripePaymentForm
                        onSuccess={handleSuccess}
                        total={total}
                        billingDetails={stripeBillingDetails}
                        notes={notes}
                        paymentIntentId={clientSecret.split('_secret_')[0]}
                      />
                    </Elements>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                      <p style={{ fontFamily: 'var(--gw-font)', fontSize: '14px', color: '#AAA' }}>Initializing secure payment…</p>
                    </div>
                  )}
                  <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#AAA', textAlign: 'center', margin: 0 }}>
                    By placing your order you agree to our{' '}
                    <Link href="/terms" style={{ color: '#888', textDecoration: 'underline' }}>Terms of Service</Link>
                  </p>
                </div>
              </>
            )}
          </Card>

          {/* ── Order Notes (always visible) ── */}
          <Card>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: '22px', color: '#999' }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '16px', color: '#1A1A1A', margin: 0 }}>
                    Order Notes <span style={{ fontWeight: 400, color: '#999', fontSize: '14px' }}>(optional)</span>
                  </p>
                  <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#999', margin: '2px 0 0' }}>Add any special instructions or notes for your order</p>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value.slice(0, 300))}
                  placeholder="e.g. Please call me when my order arrives."
                  rows={4}
                  style={{ ...field, resize: 'vertical', paddingBottom: '28px', lineHeight: 1.6, minHeight: '100px' }}
                />
                <span style={{ position: 'absolute', bottom: '10px', right: '14px', fontFamily: 'var(--gw-font)', fontSize: '11px', color: '#C5C5C5' }}>
                  {notes.length}/300
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ════ RIGHT: Sidebar ════ — sticky only once it's an actual side
            column at lg:; on a stacked mobile layout it's the last thing in
            document flow, so sticking it would pin the order summary to the
            top of the screen after the visitor scrolls past it. */}
        <div className="lg:sticky lg:top-25" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Order summary */}
          <Card>
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '16px', color: '#1A1A1A', marginBottom: '16px' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {items.length === 0 ? (
                  <p style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#AAA', padding: '8px 0 16px', textAlign: 'center' }}>
                    Your cart is empty
                  </p>
                ) : items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid #F0F0F0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: '#F8F8F8', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                      <Image src={item.image} alt={item.model} fill sizes="56px" style={{ objectFit: 'contain', padding: '4px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <BrandLogo src={item.brandLogo} brand={item.brand} />
                      <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '13px', color: '#1A1A1A', margin: '3px 0 2px', lineHeight: 1.3 }}>{item.model}</p>
                      <p style={{ fontFamily: 'var(--gw-font)', fontSize: '11px', color: '#999', margin: 0 }}>{item.size}&nbsp;{item.spec}</p>
                      <p style={{ fontFamily: 'var(--gw-font)', fontSize: '11px', color: '#AAA', margin: '2px 0 0' }}>Qty: {item.qty}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '14px', color: '#1A1A1A', flexShrink: 0 }}>
                      {money(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '4px 20px 20px' }}>
              {[
                { label: `Products (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`, value: money(totals.subtotal) },
                isFit
                  ? { label: `Fitting & balancing (${estimate.fitCount} × ${money(totals.fitting / Math.max(1, estimate.fitCount))})`, value: money(totals.fitting) }
                  : { label: 'Pickup', value: 'Free' },
                ...(totals.discount > 0 ? [{ label: 'Discount', value: `−${money(totals.discount)}` }] : []),
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '9px' }}>
                  <span style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#888', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--gw-font)', fontSize: '13px', color: '#444', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}

              <div style={{ height: '1px', background: '#EBEBEB', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '15px', color: '#1A1A1A' }}>Total</span>
                <span style={{ fontFamily: 'var(--gw-font)', fontWeight: 900, fontSize: '22px', color: '#FF5A1F' }}>
                  {money(total)}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--gw-font)', fontSize: '11px', color: '#BBB', margin: 0 }}>Includes {money(totals.vat)} VAT</p>
            </div>
          </Card>

          {/* Selected fitting station */}
          <Card>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <i className="ti ti-map-pin" style={{ fontSize: '16px', color: '#2A2E36' }} aria-hidden="true" />
                <h3 style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '14px', color: '#1A1A1A', margin: 0 }}>
                  Selected Fitting Station
                </h3>
              </div>

              <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '4px' }}>
                {selectedStore.name}
              </p>
              <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#888', marginBottom: '2px' }}>
                {selectedStore.address}
              </p>
              <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                {selectedStore.state}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                <i className="ti ti-phone" style={{ fontSize: '13px', color: '#666' }} aria-hidden="true" />
                <span style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#666' }}>{selectedStore.phone}</span>
              </div>

              <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#888', lineHeight: 1.6, marginBottom: '12px' }}>
                Your items will be delivered directly to this store for fitting.
              </p>

              <div style={{ background: '#F7F7F7', border: '1px solid #E8E8E8', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <i className="ti ti-truck" style={{ fontSize: '18px', color: '#555', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                <div>
                  <p style={{ fontFamily: 'var(--gw-font)', fontWeight: 700, fontSize: '13px', color: '#1A1A1A', marginBottom: '2px' }}>
                    Delivery charges —{' '}
                    <span style={{ color: '#2A2E36' }}>£0.00</span>
                  </p>
                  <p style={{ fontFamily: 'var(--gw-font)', fontSize: '12px', color: '#888', margin: 0, lineHeight: 1.5 }}>
                    No shipping fee — items are sent directly to your selected store.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
