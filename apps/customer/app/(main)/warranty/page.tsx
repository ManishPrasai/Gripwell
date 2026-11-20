'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { STORES, STORE_NETWORK_LABEL, NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF } from '../../../lib/stores'

const G = '#2A2E36'

const PILLS = [
  { href: '#acl',        label: 'Your legal rights' },
  { href: '#tyre',       label: 'Tyre warranty' },
  { href: '#work',       label: 'Workmanship' },
  { href: '#returns',    label: 'Returns & refunds' },
  { href: '#exclusions', label: 'Exclusions' },
]

const EXCLUSIONS = [
  'Road hazard damage, such as impact damage or a puncture, whether repairable or not',
  'Incorrect mounting of the tyre',
  'Improper storage of the tyre',
  'Under-inflation, over-inflation, improper maintenance, improper repair, or other abuse',
  'Mechanical irregularities in the vehicle — including wheel/tyre imbalance or misalignment — that cause uneven or rapid wear',
  'Fitting to, or use with, incompatible or improper valves, rims or wheels',
  'Fitting to a vehicle carrying loads or running at speeds higher than recommended for that vehicle',
  "Fitting or use that doesn't follow the manufacturer's published technical recommendations",
  'Accident, fire, chemical exposure or explosion, tyre alteration (such as retreading), or vandalism',
  'Climatic effects, such as damage from salt water or sand',
]

const CLAIM_STEPS = [
  <>Send your claim to Customer Support, or submit the <a href="#claim" style={{ fontWeight: 700 }}>warranty claim form</a> below.</>,
  <>We review your claim and get back to you with an outcome within <strong>5 working days</strong>. If a physical inspection is needed, we&apos;ll contact you to arrange it.</>,
  <>If confirmed as a manufacturing fault, we arrange a replacement — including re-fitment at no extra charge — or a refund for the faulty tyre(s), in line with the terms above.</>,
]

export default function WarrantyPage() {
  return (
    <main style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`a.wr-link { color: ${G}; } a.wr-link:hover { color: #054A24; }`}</style>

      {/* ── Hero ── */}
      <section style={{ background: '#04331B', padding: 'clamp(36px,5vw,72px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', color: '#7FA98C', marginBottom: '10px' }}>
            <Link href="/" style={{ color: '#D1D5DB', textDecoration: 'none', fontWeight: 600 }}>Home</Link> / Warranty &amp; Refund Policy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ width: '44px', height: '4px', background: '#fff' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: '#9DBBA8' }}>
              Warranty &amp; Refund Policy
            </span>
          </div>
          <h1 style={{ font: "800 clamp(30px,4.4vw,52px)/1.04 'DM Sans',sans-serif", color: '#fff', margin: 0, letterSpacing: '.3px' }}>
            Warranty &amp; Refund Policy
          </h1>
          <p style={{ fontSize: 'clamp(14.5px,1.5vw,17px)', lineHeight: 1.65, color: '#9DBBA8', margin: '14px 0 22px', maxWidth: '68ch' }}>
            We want you to be confident in every tyre we sell and every job we do. This page explains what&apos;s
            covered, how long for, how returns and cancellations work, and how to make a claim — on top of the
            rights you already have under UK law.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PILLS.map(p => (
              <a key={p.href} href={p.href} style={{
                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: '999px',
                padding: '8px 15px', fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none',
              }}>
                {p.label}
              </a>
            ))}
            <a href="#claim" style={{ background: G, border: `1px solid ${G}`, borderRadius: '999px', padding: '8px 15px', fontSize: '13px', fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
              Make a claim →
            </a>
          </div>
        </div>
      </section>

      {/* ── Policy + claim form ── */}
      <section style={{ background: '#fff', padding: 'clamp(32px,4.5vw,60px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', gap: 'clamp(24px,3.5vw,48px)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1.55, minWidth: 'min(520px,100%)', display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>

            <div id="acl">
              <h2 style={sectionH2}>Your rights under UK Consumer Rights Act</h2>
              <p style={bodyP}>
                Regardless of anything below, our goods and services come with consumer guarantees under the
                UK Consumer Rights Act that cannot be excluded, restricted or replaced. These rights apply
                automatically and last for as long as is reasonable for the type of product or service. You
                don&apos;t need the original paper receipt specifically — a bank statement, invoice, or other
                reasonable proof of purchase works just as well — but you will need to be able to show you
                bought it from us.
              </p>
              <div style={{ borderLeft: `4px solid ${G}`, background: '#F1F8F3', borderRadius: '0 10px 10px 0', padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: G, marginBottom: '8px' }}>
                  Your rights in short
                </div>
                <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#2B2B28', margin: '0 0 10px' }}>
                  Under the Consumer Rights Act 2015, tyres and wheels must be of satisfactory quality, fit
                  for purpose and as described, and fitting must be carried out with reasonable care and skill.
                  If they are not:
                </p>
                <ul style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#2B2B28', margin: '0 0 10px', paddingLeft: '20px' }}>
                  <li>within 30 days you can reject faulty goods for a full refund;</li>
                  <li>within 6 months you can ask for a repair or replacement, and if that fails, a refund
                    (a fault found in this period is presumed to have been there when you bought it);</li>
                  <li>for fitting that wasn&apos;t done with reasonable care and skill, we will redo it at no
                    cost, or give you a price reduction if that isn&apos;t possible.</li>
                </ul>
                <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#2B2B28', margin: 0 }}>
                  This is a plain-English summary for this demo store, not legal advice. Citizens Advice
                  explains the full rules.
                </p>
              </div>
            </div>

            <div id="tyre" style={sectionDivider}>
              <h2 style={sectionH2}>Our tyre warranty</h2>
              <p style={bodyP}>
                If a tyre you&apos;ve bought from us turns out to have a manufacturing fault, here&apos;s how we
                handle it — in addition to your consumer guarantee rights above and the manufacturer&apos;s own
                warranty terms.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '12px' }}>
                <StatCard big="≤ 10%"    title="Worn 10% or less"      body="We replace it free of charge." />
                <StatCard big="Pro-rata" title="Worn more than 10%"    body="You pay the same percentage as the tyre's wear, we cover the rest — e.g. 40% worn means you pay 40%, we cover 60%." />
                <StatCard big="7 days"   title="Condition on receipt"  body="Concerns about a tyre's condition on receipt (rather than a fault appearing later) must be reported within 7 days of fitment or pickup." />
              </div>
            </div>

            <div id="work" style={sectionDivider}>
              <h2 style={sectionH2}>Our workmanship warranty</h2>
              <p style={bodyP}>
                Fitting, wheel balancing, tyre rotation and puncture repairs carried out by us are covered by our
                own workmanship warranty from the date of service, subject to the terms below.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '12px' }}>
                <div style={{ border: '1px solid #C9E0D2', background: '#F1F8F3', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: G, marginBottom: '10px' }}>✓ What&apos;s covered</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#2B2B28', margin: 0 }}>
                    Faults caused by our workmanship — for example, a wheel weight coming loose, a balance that
                    hasn&apos;t been done correctly, or a puncture repair that fails due to how it was carried out.
                  </p>
                </div>
                <div style={{ border: '1px solid #E4E4E1', background: '#F4F4F3', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#5B5A55', marginBottom: '10px' }}>✕ What&apos;s not covered</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#2B2B28', margin: 0 }}>
                    Damage from road hazards (potholes, kerbing, debris), incorrect tyre pressure, accident
                    damage, normal wear and tear, or work carried out or altered by someone else after you&apos;ve
                    left the store.
                  </p>
                </div>
              </div>
            </div>

            <div id="returns" style={sectionDivider}>
              <h2 style={sectionH2}>Returns, cancellations and refunds</h2>
              <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#6B6A64', margin: '0 0 14px', fontStyle: 'italic' }}>
                These terms cover change-of-mind returns and cancellations. If a tyre or our workmanship is
                faulty, that&apos;s covered by the tyre warranty, workmanship warranty and your UK
                Consumer Rights Act rights above instead — none of which are affected by the terms below.
              </p>
              <ul style={{ fontSize: '15px', lineHeight: 1.75, color: '#2B2B28', margin: 0, paddingLeft: '20px' }}>
                <li>Change-of-mind returns must be made within <strong>14 days</strong> of the invoice date.</li>
                <li>Cancellations may incur a restocking fee of <strong>25—40%</strong> of the order value.</li>
                <li>Once an order has been sent, freight charges are non-refundable, and freight costs are payable by the customer.</li>
                <li>Special order tyres and products cannot be returned for change of mind.</li>
              </ul>
            </div>

            <div id="legality" style={sectionDivider}>
              <h2 style={sectionH2}>On-road legality</h2>
              <p style={bodyP}>
                Changing the wheels and/or tyres fitted to your vehicle can affect its compliance and
                roadworthiness. Before any modification is carried out, it&apos;s your responsibility as the
                vehicle owner to check with the relevant road and traffic authority that the change is permitted
                for your vehicle. Our team is glad to advise on fitment and compatibility, but Gripwell isn&apos;t
                responsible for legal or registration issues arising from a particular wheel or tyre combination
                on your vehicle.
              </p>
            </div>

            <div id="exclusions" style={sectionDivider}>
              <h2 style={sectionH2}>Warranty exclusions</h2>
              <p style={{ ...bodyP, marginBottom: '14px' }}>The tyre warranty above doesn&apos;t cover a tyre that becomes defective as a result of:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '6px 24px', fontSize: '14.5px', lineHeight: 1.55, color: '#2B2B28' }}>
                {EXCLUSIONS.map(x => (
                  <div key={x} style={{ padding: '8px 0', borderBottom: '1px solid #F2F2F0' }}>{x}</div>
                ))}
              </div>
            </div>

            <div id="how" style={sectionDivider}>
              <h2 style={{ ...sectionH2, marginBottom: '16px' }}>How to make a warranty claim</h2>
              <div style={{ display: 'flex', gap: 'clamp(20px,3vw,40px)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 'min(260px,100%)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: G, marginBottom: '10px' }}>Have this ready</div>
                  <ul style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#2B2B28', margin: 0, paddingLeft: '20px' }}>
                    <li>Your order number</li>
                    <li>Your name, email address and contact number</li>
                    <li>The number of tyres affected</li>
                    <li>A full description of the fault you believe the tyre has</li>
                    <li>Photos clearly showing the fault, plus any supporting evidence</li>
                  </ul>
                </div>
                <div style={{ flex: 1.1, minWidth: 'min(280px,100%)', display: 'grid', gap: '10px' }}>
                  {CLAIM_STEPS.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ flex: 'none', width: '28px', height: '28px', borderRadius: '50%', background: G, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px', fontWeight: 800 }}>{i + 1}</span>
                      <div style={{ fontSize: '14.5px', lineHeight: 1.55, color: '#2B2B28', paddingTop: '3px' }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#F4F4F3', borderRadius: '10px', padding: '14px 16px', marginTop: '16px', fontSize: '13.5px', lineHeight: 1.6, color: '#6B6A64' }}>
                We&apos;re not able to progress a claim if the tyres have been taken to a vehicle or tyre
                specialist outside our network, or if they&apos;re no longer in your possession — we do need to be
                able to inspect the tyre itself.
              </div>
            </div>

          </div>

          <ClaimForm />
        </div>
      </section>

      {/* ── Our details ── */}
      <section style={{ background: '#fff', padding: 'clamp(28px,4vw,48px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid #E4E4E1', borderRadius: '12px', padding: 'clamp(20px,3vw,28px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '20px' }}>
          <div>
            <div style={detailsH}>Our details</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#4A4A46' }}>
              Gripwell Ltd<br />
              Phone <a href={NOVA_SWITCHBOARD_HREF} className="wr-link" style={{ fontWeight: 700, textDecoration: 'none' }}>{NOVA_SWITCHBOARD}</a><br />
              Email <a href="mailto:info@gripwell.demo" className="wr-link" style={{ fontWeight: 700, textDecoration: 'none' }}>info@gripwell.demo</a>
            </div>
          </div>
          <div>
            <div style={detailsH}>Stores</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#4A4A46' }}>
              {STORES.map(s => s.short).join(' · ')} · <Link href="/service?goto=shops" className="wr-link" style={{ fontWeight: 700, textDecoration: 'none' }}>All locations →</Link>
              <div style={{ fontSize: '12.5px', color: '#9C9A93', marginTop: '4px' }}>{STORE_NETWORK_LABEL}</div>
            </div>
          </div>
          <div>
            <div style={detailsH}>Good to know</div>
            <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: '#6B6A64' }}>
              This warranty is provided in addition to, and does not limit or replace, your rights under the
              UK Consumer Rights Act.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const sectionH2: React.CSSProperties = { font: "800 clamp(22px,2.6vw,30px) 'DM Sans',sans-serif", color: '#1B1C1E', margin: '0 0 12px' }
const bodyP: React.CSSProperties = { fontSize: '15px', lineHeight: 1.7, color: '#4A4A46', margin: '0 0 14px' }
const sectionDivider: React.CSSProperties = { borderTop: '1px solid #E4E4E1', paddingTop: 'clamp(24px,3vw,36px)' }
const detailsH: React.CSSProperties = { font: "800 20px 'DM Sans',sans-serif", color: '#1B1C1E', marginBottom: '6px' }

function StatCard({ big, title, body }: { big: string; title: string; body: string }) {
  return (
    <div style={{ border: '1px solid #E4E4E1', borderRadius: '12px', padding: '18px' }}>
      <div style={{ font: "800 30px 'DM Sans',sans-serif", color: G }}>{big}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1B1C1E', margin: '6px 0 3px' }}>{title}</div>
      <div style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#6B6A64' }}>{body}</div>
    </div>
  )
}

/* ─── Claim form — real submission to /api/warranty/claim ────────────────── */
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', marginTop: '5px', padding: '12px 12px', border: '1.5px solid #CCCCC8', borderRadius: '8px', fontSize: '15px' }
const labelCap: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: '#5B5A55', textTransform: 'uppercase', letterSpacing: '.5px' }

function ClaimForm() {
  const [claimType, setClaimType] = useState<'warranty' | 'refund'>('warranty')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const warranty = claimType === 'warranty'
  const reasonWord = warranty ? 'warranty claim' : 'refund request'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('claimType', claimType)
      const res  = await fetch('/api/warranty/claim', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="claim" style={{ flex: 1, minWidth: 'min(360px,100%)', position: 'sticky', top: '20px' }}>
      <div style={{ background: '#fff', border: '1px solid #E4E4E1', borderRadius: '14px', boxShadow: '0 12px 34px rgba(4,51,27,.1)', overflow: 'hidden' }}>
        <div style={{ background: '#04331B', padding: 'clamp(18px,2.4vw,24px)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: '#9DBBA8', marginBottom: '6px' }}>Submit online</div>
          <h2 style={{ font: "800 clamp(20px,2.4vw,26px) 'DM Sans',sans-serif", color: '#fff', margin: 0 }}>Warranty claim &amp; refund form</h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#9DBBA8', margin: '8px 0 0' }}>Fields marked * are required. We reply within 5 working days.</p>
        </div>
        <div style={{ padding: 'clamp(18px,2.4vw,24px)' }}>

          {!sent ? (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <button type="button" onClick={() => setClaimType('warranty')} style={{
                  flex: 1, minWidth: 180, border: `2px solid ${warranty ? G : '#E4E4E1'}`,
                  background: warranty ? '#F1F8F3' : '#fff', borderRadius: '10px', padding: '14px', cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15.5px', fontWeight: 800, color: '#1B1C1E' }}>Warranty claim</span>
                    <RadioDot on={warranty} />
                  </span>
                  <span style={{ display: 'block', fontSize: '12.5px', color: '#6B6A64', marginTop: '4px' }}>A tyre or our workmanship has a fault</span>
                </button>
                <button type="button" onClick={() => setClaimType('refund')} style={{
                  flex: 1, minWidth: 180, border: `2px solid ${!warranty ? G : '#E4E4E1'}`,
                  background: !warranty ? '#F1F8F3' : '#fff', borderRadius: '10px', padding: '14px', cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15.5px', fontWeight: 800, color: '#1B1C1E' }}>Refund / return</span>
                    <RadioDot on={!warranty} />
                  </span>
                  <span style={{ display: 'block', fontSize: '12.5px', color: '#6B6A64', marginTop: '4px' }}>Change of mind or order cancellation</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '14px' }}>
                <label><span style={labelCap}>Customer name *</span><input name="name" type="text" required placeholder="Full name" style={inputStyle} /></label>
                <label><span style={labelCap}>Email *</span><input name="email" type="email" required placeholder="you@email.com" style={inputStyle} /></label>
                <label><span style={labelCap}>Contact number *</span><input name="phone" type="tel" required placeholder="04xx xxx xxx" style={inputStyle} /></label>
                <label><span style={labelCap}>Order number <span style={{ textTransform: 'none', color: '#9C9A93' }}>(if you have it)</span></span><input name="orderNumber" type="text" placeholder="e.g. #10482" style={inputStyle} /></label>
                <label style={{ gridColumn: '1/-1' }}><span style={labelCap}>Address *</span><input name="address" type="text" required placeholder="Street, suburb, state, postcode" style={inputStyle} /></label>
                <label><span style={labelCap}>Product name *</span><input name="productName" type="text" required placeholder="e.g. Meridian CrossTrack A/T 245/70R16" style={inputStyle} /></label>
                <label><span style={labelCap}>Number of tyres affected</span><input name="tyreCount" type="number" min={1} placeholder="e.g. 2" style={inputStyle} /></label>
                <label style={{ gridColumn: '1/-1' }}>
                  <span style={labelCap}>Why are you making this {reasonWord}? *</span>
                  <textarea name="reason" rows={4} required placeholder="Describe the fault or reason for your claim in as much detail as you can." style={{ ...inputStyle, resize: 'vertical' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '14px', marginTop: '14px' }}>
                <FileField name="receipt" required icon="🧾" title="Upload receipt or invoice *" hint="Photo, PDF or bank statement — JPG, PNG, PDF" label="Photo proof of purchase *" />
                <FileField name="photos" multiple icon="📷" title="Upload photos" hint="Clear shots of the fault — add several if needed" label="Photos of the fault / images" />
              </div>

              <label style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', marginTop: '16px', fontSize: '13px', color: '#6B6A64', lineHeight: 1.5 }}>
                <input type="checkbox" required style={{ accentColor: G, width: '16px', height: '16px', flex: 'none', marginTop: '2px' }} />
                I understand Gripwell may need to physically inspect the tyre, and that this claim is assessed alongside my rights under the UK Consumer Rights Act.
              </label>

              {error && <p style={{ color: '#C62828', fontSize: '13.5px', fontWeight: 600, marginTop: '14px' }}>{error}</p>}

              <button type="submit" disabled={submitting} style={{
                width: '100%', marginTop: '18px', background: G, border: 'none', borderRadius: '999px', padding: '16px',
                font: "800 15px 'DM Sans',sans-serif", letterSpacing: '.5px', textTransform: 'uppercase', color: '#fff',
                cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? 'Submitting…' : `Submit ${reasonWord}`}
              </button>
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#8D8B85' }}>
                Prefer email? Send the details above to <a href="mailto:info@gripwell.demo" className="wr-link" style={{ fontWeight: 700 }}>info@gripwell.demo</a> — or call <a href={NOVA_SWITCHBOARD_HREF} className="wr-link" style={{ fontWeight: 700 }}>{NOVA_SWITCHBOARD}</a>.
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: 'clamp(20px,4vw,44px) 10px' }}>
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#EAF3ED', color: G, fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>✓</div>
              <h3 style={{ font: "800 clamp(22px,3vw,30px) 'DM Sans',sans-serif", color: '#1B1C1E', margin: 0 }}>Claim submitted</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#6B6A64', margin: '10px auto 0', maxWidth: '48ch' }}>
                Thanks — we&apos;ve received your {reasonWord}. Our Customer Support team will review it and get
                back to you with an outcome within <strong>5 working days</strong>. If a physical inspection is
                needed, we&apos;ll be in touch to arrange it.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '22px' }}>
                <button type="button" onClick={() => { setSent(false); formRef.current?.reset() }} style={{
                  background: G, border: 'none', borderRadius: '999px', padding: '13px 26px', fontSize: '14px',
                  fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#fff', cursor: 'pointer',
                }}>
                  Submit another
                </button>
                <Link href="/" style={{ border: `1.5px solid ${G}`, borderRadius: '999px', padding: '12px 26px', fontSize: '14px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: G, textDecoration: 'none' }}>
                  Back to home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function RadioDot({ on }: { on: boolean }) {
  return (
    <span style={{
      flex: 'none', width: '20px', height: '20px', borderRadius: '50%',
      background: on ? G : '#fff', border: `2px solid ${on ? G : '#CCCCC8'}`,
      color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {on ? '✓' : ''}
    </span>
  )
}

function FileField({ name, icon, title, hint, label, required, multiple }: {
  name: string; icon: string; title: string; hint: string; label: string; required?: boolean; multiple?: boolean
}) {
  const [fileNames, setFileNames] = useState<string[]>([])
  return (
    <div>
      <span style={labelCap}>{label}</span>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '5px', border: '1.5px dashed #B9C9BE', background: '#F7FBF8', borderRadius: '10px', padding: '14px', cursor: 'pointer' }}>
        <span style={{ flex: 'none', width: '38px', height: '38px', borderRadius: '8px', background: '#EAF3ED', color: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1B1C1E' }}>{title}</span>
          <span style={{ display: 'block', fontSize: '12px', color: '#8D8B85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileNames.length ? fileNames.join(', ') : hint}
          </span>
        </span>
        <input
          name={name} type="file" required={required} multiple={multiple}
          accept={name === 'receipt' ? 'image/*,.pdf' : 'image/*'}
          style={{ display: 'none' }}
          onChange={e => setFileNames(Array.from(e.target.files ?? []).map(f => f.name))}
        />
      </label>
    </div>
  )
}
