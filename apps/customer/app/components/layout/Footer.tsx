import Link from 'next/link'
import Image from 'next/image'

/* ── Data ────────────────────────────────────────────────────────────────── */

const quickLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/locations' },
  { label: 'Warranty',    href: '/warranty' },
]

const tyreSizes = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/locations' },
]

const topTyreModels = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/locations' },
]

const stores = [
  'Springvale – VIC',
  'Dandenong – VIC',
  'Alphington – VIC',
  'Bayswater – VIC',
  'Sunshine – VIC',
  'Geelong – VIC',
  'Sefton – NSW',
]

const services = [
  'Free Pre-RWC Check',
  'Free Safety Inspection',
  'Log Book Service',
  'Yearly Service',
  '3 Year Service',
  '6 Year Service',
  'Ultimate Service',
]

const payments = [
  { name: 'Stripe',      src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',        src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard',  src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',   src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',    src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',      src: '/images/footer/payment-klarna.png' },
]

const socialConnect = [
  { name: 'Product Review', src: '/images/footer/social-productreview.png', href: '#', wide: true },
  { name: 'LinkedIn',       src: '/images/footer/social-linkedin.png',      href: '#', wide: false },
  { name: 'Yelp',           src: '/images/footer/social-yelp.png',          href: '#', wide: false },
  { name: 'Facebook',       src: '/images/footer/social-facebook.png',      href: '#', wide: false },
  { name: 'Instagram',      src: '/images/footer/social-instagram.png',     href: '#', wide: false },
]

const legalLinks = ['Warranty & Returns', 'Privacy & Policy', 'Terms of Service']

/* ── Shared link style ───────────────────────────────────────────────────── */
const linkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.52)',
  fontSize: '14px',
  fontWeight: 400,
  textDecoration: 'none',
  display: 'block',
  lineHeight: 1,
}

/* ── Section heading styles ─────────────────────────────────────────────── */
const capsHeading: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '16px',
}

const largeHeading: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '19px',
  fontWeight: 600,
  marginBottom: '16px',
  lineHeight: 1.2,
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer style={{ background: '#1C3A2B' }}>

      {/* ── Main 4-column grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* ── Col 1: Brand + Tyre Sizes ── */}
          <div>
            {/* Logo */}
            <div style={{ marginBottom: '14px' }}>
              <Image
                src="/images/footer/logo.png"
                alt="Nova Tyres Logo"
                width={110}
                height={110}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Nova Tyres
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '36px' }}>
              Best Deals on Tyres &amp; Wheels
            </p>

            {/* Tyre Sizes */}
            <p style={largeHeading}>Tyre Sizes</p>
            <ul className="space-y-2.5">
              {tyreSizes.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={linkStyle} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 2: Quick Links + Top Tyre Models ── */}
          <div>
            <p style={capsHeading}>Quick Links</p>
            <ul className="space-y-2.5 mb-10">
              {quickLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={linkStyle} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p style={largeHeading}>Top Tyre Models</p>
            <ul className="space-y-2.5">
              {topTyreModels.map(l => (
                <li key={l.label + 'model'}>
                  <Link href={l.href} style={linkStyle} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Our Stores + Service ── */}
          <div>
            <p style={capsHeading}>Our Stores</p>
            <ul className="space-y-2.5 mb-10">
              {stores.map(s => (
                <li key={s}>
                  <Link href="/locations" style={linkStyle} className="hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>

            <p style={largeHeading}>Service</p>
            <ul className="space-y-2.5">
              {services.map(s => (
                <li key={s}>
                  <Link href="/service" style={linkStyle} className="hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: About + Payments ── */}
          <div>
            <p style={{ ...largeHeading, fontSize: '22px' }}>About Nova Tyres</p>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '14px', lineHeight: 1.75, marginBottom: '32px' }}>
              <Link href="/" style={{ color: '#E8572A', textDecoration: 'underline' }}>Nova Tyres</Link>
              {' '}is an Australian tyre and wheel retailer offering affordable
              products, professional fitting, balancing, alignments, and
              automotive services for passenger, SUV, 4WD, and commercial
              vehicles across multiple locations nationwide.
            </p>

            <p style={capsHeading}>Payments</p>
            <div className="flex flex-wrap gap-2">
              {payments.map(p => (
                <div
                  key={p.name}
                  style={{
                    background: '#ffffff',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={p.src}
                    alt={p.name}
                    width={52}
                    height={22}
                    style={{ objectFit: 'contain', height: '20px', width: 'auto' }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Connect With Us ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 500, marginBottom: '24px' }}>
            Connect With Us
          </p>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {socialConnect.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src={s.src}
                  alt={s.name}
                  width={s.wide ? 140 : 62}
                  height={62}
                  style={{ objectFit: 'contain', height: '60px', width: 'auto' }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px' }}>
            @ 2026 Nova Tyres All rights reserved
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            {legalLinks.map(label => (
              <Link
                key={label}
                href="#"
                style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
