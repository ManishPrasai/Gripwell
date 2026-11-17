import Link from 'next/link'
import Image from 'next/image'
import { STORES } from '../../../lib/stores'

/* ── Link groups ─────────────────────────────────────────────────────────── */

const sizeLinks = ['205/55R16', '225/45R17', '235/55R18', '245/70R16', '265/65R17']
  .map(label => ({ label, href: `/tyres/results?size=${encodeURIComponent(label)}` }))

const quickLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/#locations' },
  { label: 'Warranty',    href: '/warranty' },
]

const modelLinks = [
  'Continental CrossContact A/T',
  'Nitto Terra Grappler G2',
  'Hankook Kinergy Eco 2',
  'Pirelli Scorpion ATR',
  'Maxxis Bravo AT-771',
].map(label => ({ label, href: `/tyres/results?q=${encodeURIComponent(label)}` }))

const serviceLinks = [
  'Free pre-RWC check',
  'Free safety inspection',
  'Log book service',
  'Yearly service',
  '3 year service',
  '6 year service',
  'Ultimate service',
].map(label => ({ label, href: '/service' }))

/* Payment marks — real brand artwork from public/images/footer */
const payments = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

/* ── Shared styles ───────────────────────────────────────────────────────── */

const colHeading: React.CSSProperties = {
  fontFamily:    "'Bebas Neue', sans-serif",
  fontSize:      '15px',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color:         '#16211B',
  marginBottom:  '14px',
}

const footLink = 'nv-footlink'

/* White-tile social row, matching the design's utility-bar chip style */
const socialTile: React.CSSProperties = {
  width:          '32px',
  height:         '32px',
  borderRadius:   '8px',
  background:     '#FFFFFF',
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  textDecoration: 'none',
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-footlink {
          font-size: 14px;
          color: #16211B;
          text-decoration: none;
          transition: color .2s;
        }
        .nv-footlink:hover { color: #E8572A; }
        .nv-social { transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .2s; }
        .nv-social:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -12px rgba(0,0,0,0.35); }
        .nv-legal { color: #CFE5D8; text-decoration: none; transition: color .2s; font-size: 13.5px; }
        .nv-legal:hover { color: #FFB07A; }
        .nv-foot-cols { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr 1.2fr; gap: 32px 28px; }
        @media (max-width: 1000px) { .nv-foot-cols { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px)  { .nv-foot-cols { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Link columns: light band ── */}
      <div style={{ background: '#F4F4F1', padding: 'clamp(40px,5vw,56px) clamp(16px,4vw,40px) 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="nv-foot-cols">

            {/* ── Col 1: brand · tyre sizes ── */}
            <div style={{ display: 'grid', gap: '22px', alignContent: 'start', minWidth: 0 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '.03em', color: '#16211B' }}>
                  NOVA TYRES
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14.5px', color: '#6E7C74' }}>
                  Best Deals on Tyres &amp; Wheels
                </p>
              </div>
              <div>
                <div style={colHeading}>Tyre Sizes</div>
                <div style={{ display: 'grid', gap: '11px', justifyItems: 'start' }}>
                  {sizeLinks.map(l => (
                    <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 2: quick links · top models ── */}
            <div style={{ display: 'grid', gap: '28px', alignContent: 'start', minWidth: 0 }}>
              <div>
                <div style={colHeading}>Quick Links</div>
                <div style={{ display: 'grid', gap: '11px', justifyItems: 'start' }}>
                  {quickLinks.map(l => (
                    <Link key={l.href} href={l.href} className={footLink}>{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={colHeading}>Top Tyre Models</div>
                <div style={{ display: 'grid', gap: '11px', justifyItems: 'start' }}>
                  {modelLinks.map(l => (
                    <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 3: stores ── */}
            <div style={{ display: 'grid', gap: '28px', alignContent: 'start', minWidth: 0 }}>
              <div>
                <div style={colHeading}>Our Stores</div>
                <div style={{ display: 'grid', gap: '11px', justifyItems: 'start' }}>
                  {STORES.map(s => (
                    <Link key={s.id} href="/#locations" className={footLink}>
                      {s.short} — {s.state}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 4: service ── */}
            <div style={{ display: 'grid', gap: '28px', alignContent: 'start', minWidth: 0 }}>
              <div>
                <div style={colHeading}>Service</div>
                <div style={{ display: 'grid', gap: '11px', justifyItems: 'start' }}>
                  {serviceLinks.map(l => (
                    <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 5: about ── */}
            <div style={{ display: 'grid', gap: '28px', alignContent: 'start', minWidth: 0 }}>
              <div>
                <div style={colHeading}>About Nova Tyres</div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: '#6E7C74', textWrap: 'pretty' }}>
                  <strong style={{ color: '#16211B' }}>Nova Tyres</strong> is an Australian tyre and wheel
                  retailer offering affordable products, professional fitting, balancing, alignments and
                  automotive services for passenger, SUV, 4WD and commercial vehicles across {STORES.length} locations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Utility bar: green band ── */}
      <div style={{ background: '#076330', color: '#F1EFE7', padding: 'clamp(18px,2.4vw,22px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 32px' }}>
          <span style={{ fontSize: '13.5px', color: '#CFE5D8' }}>
            © {new Date().getFullYear()} Nova Tyres. All rights reserved
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {payments.map(p => (
              <span key={p.name} aria-label={p.name}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '52px', height: '30px', borderRadius: '6px',
                  background: '#FFFFFF', overflow: 'hidden',
                }}
              >
                <Image src={p.src} alt={p.name} width={44} height={18}
                  style={{ objectFit: 'contain', height: '18px', width: 'auto' }} />
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#CFE5D8' }}>Follow Us</span>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="nv-social" style={{ ...socialTile, color: '#0A66C2' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.9 21h4.16V9.4H2.9V21Zm7.02 0h4.16v-6.3c0-1.66.6-2.66 2.02-2.66 1.32 0 1.86.94 1.86 2.7V21H22.1v-6.9c0-3.4-1.82-4.98-4.24-4.98-1.96 0-2.84 1.08-3.33 1.84V9.4H9.92c.06 1.16 0 11.6 0 11.6Z"/></svg>
            </a>
            <a href="https://facebook.com/Novatyres.Official" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="nv-social" style={{ ...socialTile, color: '#1877F2' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.3c0-.9.3-1.5 1.6-1.5h1.5V4.2C16.3 4.1 15.2 4 14 4c-2.5 0-4.2 1.5-4.2 4.3v2.2H7.3v3h2.5V21h3.7z"/></svg>
            </a>
            <a href="https://instagram.com/novatyres" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="nv-social" style={{ ...socialTile, color: '#E1306C' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
            </a>
            <a href="https://www.yelp.com/biz/nova-tyres-springvale-2?uid=byxWfoz3h2Opm18Y9dweaQ&utm_campaign=www_business_share_popup&utm_medium=copy_link&utm_source=(direct)" aria-label="Yelp" target="_blank" rel="noopener noreferrer" className="nv-social" style={{ ...socialTile, padding: '4px' }}>
              <Image src="/images/footer/social-yelp.png" alt="Yelp" width={24} height={24} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
            </a>
            <a href="https://www.productreview.com.au" aria-label="ProductReview" target="_blank" rel="noopener noreferrer" className="nv-social" style={{ ...socialTile, padding: '4px' }}>
              <Image src="/images/footer/social-productreview.png" alt="ProductReview" width={24} height={24} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
            </a>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '14px auto 0', paddingTop: '14px', borderTop: '1px solid rgba(241,239,231,0.18)', display: 'flex', gap: '8px 24px', flexWrap: 'wrap' }}>
          <Link href="/warranty" className="nv-legal">Warranty &amp; Returns</Link>
          <Link href="/privacy" className="nv-legal">Privacy Policy</Link>
          <Link href="/terms" className="nv-legal">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
