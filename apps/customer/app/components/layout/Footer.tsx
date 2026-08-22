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
  fontFamily:   "'DM Sans', sans-serif",
  fontWeight:   900,
  fontSize:     '22px',
  color:        '#FFFFFF',
  marginBottom: '14px',
}

const footLink = 'nv-footlink'

/* Brand-coloured social tiles, matching the design's 42px chip row */
const socialTile: React.CSSProperties = {
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          '42px',
  height:         '42px',
  borderRadius:   '10px',
  color:          '#FFFFFF',
  textDecoration: 'none',
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      style={{
        background: '#002A13',
        color:      '#F1EFE7',
        padding:    'clamp(44px,5.5vw,72px) clamp(16px,4vw,40px) 26px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .nv-footlink {
          font-size: 15px;
          font-weight: 700;
          color: #AAAAAA;
          text-decoration: none;
          transition: color .2s;
        }
        .nv-footlink:hover { color: #FF6817; }
        .nv-social { transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .2s; }
        .nv-social:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -12px rgba(0,0,0,0.8); }
        .nv-legal { color: #FFFFFF; text-decoration: none; transition: color .2s; font-size: 15px; font-weight: 700; }
        .nv-legal:hover { color: #FF6817; }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))',
            gap:                 'clamp(30px,3.6vw,46px) clamp(22px,2.8vw,44px)',
          }}
        >

          {/* ── Col 1: brand · tyre sizes · social ── */}
          <div style={{ display: 'grid', gap: '34px', alignContent: 'start', minWidth: 0 }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/nova-wordmark-light.png"
                alt="Nova Tyres"
                style={{ display: 'block', width: 'min(100%,176px)', height: 'auto' }}
              />
              <div style={{ fontWeight: 900, fontSize: '25px', letterSpacing: '.5px', color: '#FFFFFF', marginTop: '16px' }}>
                NOVA TYRES
              </div>
              <p style={{ margin: 0, marginTop: '4px', fontSize: '15px', fontWeight: 500, color: '#CFE5D8' }}>
                Best Deals on Tyres &amp; Wheels
              </p>
            </div>

            <div>
              <div style={colHeading}>Tyre Sizes</div>
              <div style={{ display: 'grid', gap: '13px', justifyItems: 'start' }}>
                {sizeLinks.map(l => (
                  <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <div style={colHeading}>Connect With Us</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Review-platform marks use the real logo artwork we ship */}
                <a href="https://www.productreview.com.au" aria-label="ProductReview" target="_blank" rel="noopener noreferrer"
                  className="nv-social" style={{ ...socialTile, width: 'auto', padding: '0 10px', background: '#FFFFFF' }}>
                  <Image src="/images/footer/social-productreview.png" alt="ProductReview"
                    width={120} height={26} style={{ objectFit: 'contain', height: '22px', width: 'auto' }} />
                </a>
                <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"
                  className="nv-social" style={{ ...socialTile, background: '#0A66C2' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.9 21h4.16V9.4H2.9V21Zm7.02 0h4.16v-6.3c0-1.66.6-2.66 2.02-2.66 1.32 0 1.86.94 1.86 2.7V21H22.1v-6.9c0-3.4-1.82-4.98-4.24-4.98-1.96 0-2.84 1.08-3.33 1.84V9.4H9.92c.06 1.16 0 11.6 0 11.6Z"/></svg>
                </a>
                <a href="https://www.yelp.com" aria-label="Yelp" target="_blank" rel="noopener noreferrer"
                  className="nv-social" style={{ ...socialTile, width: 'auto', padding: '0 12px', background: '#FFFFFF' }}>
                  <Image src="/images/footer/social-yelp.png" alt="Yelp"
                    width={60} height={26} style={{ objectFit: 'contain', height: '22px', width: 'auto' }} />
                </a>
                <a href="https://facebook.com/Novatyres.Official" aria-label="Facebook" target="_blank" rel="noopener noreferrer"
                  className="nv-social" style={{ ...socialTile, background: '#1877F2' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
                </a>
                <a href="https://instagram.com/novatyres" aria-label="Instagram" target="_blank" rel="noopener noreferrer"
                  className="nv-social" style={{ ...socialTile, background: 'linear-gradient(45deg,#F09433,#DC2743,#BC1888)' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 2: quick links · top models ── */}
          <div style={{ display: 'grid', gap: '34px', alignContent: 'start', minWidth: 0 }}>
            <div>
              <div style={colHeading}>Quick Links</div>
              <div style={{ display: 'grid', gap: '13px', justifyItems: 'start' }}>
                {quickLinks.map(l => (
                  <Link key={l.href} href={l.href} className={footLink}>{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={colHeading}>Top Tyre Models</div>
              <div style={{ display: 'grid', gap: '13px', justifyItems: 'start' }}>
                {modelLinks.map(l => (
                  <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 3: stores · service ── */}
          <div style={{ display: 'grid', gap: '34px', alignContent: 'start', minWidth: 0 }}>
            <div>
              <div style={colHeading}>Our Stores</div>
              <div style={{ display: 'grid', gap: '13px', justifyItems: 'start' }}>
                {STORES.map(s => (
                  <Link key={s.id} href="/#locations" className={footLink}>
                    {s.short} – {s.state}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div style={colHeading}>Service</div>
              <div style={{ display: 'grid', gap: '13px', justifyItems: 'start' }}>
                {serviceLinks.map(l => (
                  <Link key={l.label} href={l.href} className={footLink}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 4: about · payments ── */}
          <div style={{ display: 'grid', gap: '34px', alignContent: 'start', minWidth: 0 }}>
            <div>
              <div style={colHeading}>About Nova Tyres</div>
              <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.65, color: '#9DB0A5', textWrap: 'pretty' }}>
                <Link href="/" style={{ color: '#FFFFFF', fontWeight: 700, textDecoration: 'none' }}>Nova Tyres</Link>
                {' '}is an Australian tyre and wheel retailer offering affordable products,
                professional fitting, balancing, alignments and automotive services for
                passenger, SUV, 4WD and commercial vehicles across {STORES.length} locations.
              </p>
            </div>
            <div>
              <div style={colHeading}>Payments</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '260px' }}>
                {payments.map(p => (
                  <span key={p.name} aria-label={p.name}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '60px', height: '32px', borderRadius: '5px',
                      background: '#FFFFFF', overflow: 'hidden',
                    }}
                  >
                    <Image src={p.src} alt={p.name} width={52} height={22}
                      style={{ objectFit: 'contain', height: '20px', width: 'auto' }} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ height: '4px', background: '#808080', borderRadius: '2px', marginTop: 'clamp(32px,4vw,50px)' }} />
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '12px', flexWrap: 'wrap', paddingTop: '20px',
            fontSize: '15px', fontWeight: 700, color: '#FFFFFF',
          }}
        >
          <span>© {new Date().getFullYear()} Nova Tyres. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '8px 28px', flexWrap: 'wrap' }}>
            <Link href="/warranty" className="nv-legal">Warranty &amp; Returns</Link>
            <Link href="/privacy" className="nv-legal">Privacy Policy</Link>
            <Link href="/terms" className="nv-legal">Terms of Service</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
