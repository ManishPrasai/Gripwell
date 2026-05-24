import Link from 'next/link'

const quickLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Find Tyres',  href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service',     href: '/service' },
  { label: 'Locations',   href: '/locations' },
  { label: 'Warranty',    href: '/warranty' },
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

const socialLinks = [
  { icon: 'ti-brand-facebook',  href: '#' },
  { icon: 'ti-brand-instagram', href: '#' },
  { icon: 'ti-brand-linkedin',  href: '#' },
]

const payments = ['Visa', 'MC', 'Amex', 'Zip']

export default function Footer() {
  return (
    <footer style={{ background: '#1C3A2B' }}>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: '#E8572A' }}
              >
                <span className="text-white font-bold text-xs">NT</span>
              </div>
              <div>
                <p className="text-white uppercase" style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '0.1em' }}>
                  Nova Tyres
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500 }}>
                  Best Deals on Tyres &amp; Wheels
                </p>
              </div>
            </div>
            <p
              className="leading-relaxed mt-4"
              style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '240px', fontSize: '15px', fontWeight: 400 }}
            >
              Nova Tyres is an Australian tyre and wheel retailer offering
              affordable products, professional fitting, balancing, alignments,
              and automotive services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p
              className="text-white uppercase tracking-widest mb-4"
              style={{ letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Quick Links
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', fontWeight: 400 }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stores */}
          <div>
            <p
              className="text-white uppercase tracking-widest mb-4"
              style={{ letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Our Stores
            </p>
            <ul className="space-y-2">
              {stores.map((store) => (
                <li key={store}>
                  <Link
                    href="/locations"
                    className="transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', fontWeight: 400 }}
                  >
                    {store}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services + Payments */}
          <div>
            <p
              className="text-white uppercase tracking-widest mb-4"
              style={{ letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Service
            </p>
            <ul className="space-y-2 mb-6">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/service"
                    className="transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', fontWeight: 400 }}
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>

            <p
              className="text-white uppercase tracking-widest mb-3"
              style={{ letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Payments
            </p>
            <div className="flex gap-2 flex-wrap">
              {payments.map((p) => (
                <div
                  key={p}
                  className="px-2 py-1 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '11px',
                    fontWeight: 500
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-4 py-5"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500 }}>
            © 2026 Nova Tyres. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.icon}
                href={s.href}
                className="transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <i className={`ti ${s.icon}`} style={{ fontSize: '20px' }} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
