import Link from 'next/link'
import { STORES } from '../../../../lib/stores'

/*
  Dark footer for the mobile design tree (MobileHome, MobileFindTyres, …).
  Same structure as the artboard footer — brand, Connect, Quick Links, Our
  Stores, About, legal — wired to the same real links/data as the desktop
  layout Footer so the two don't drift.
*/

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Find Tyres', href: '/tyres' },
  { label: 'Find Wheels', href: '/wheels' },
  { label: 'Service', href: '/service' },
  { label: 'Locations', href: '/service?goto=shops' },
  { label: 'Warranty', href: '/warranty' },
]

const SOCIALS = [
  {
    label: 'Facebook', href: 'https://facebook.com/Novatyres.Official', bg: '#1877F2',
    path: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z',
  },
  {
    label: 'Instagram', href: 'https://instagram.com/novatyres', bg: 'linear-gradient(45deg,#F09433,#DC2743,#BC1888)',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z',
  },
  {
    label: 'LinkedIn', href: 'https://linkedin.com', bg: '#0A66C2',
    path: 'M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.9 21h4.16V9.4H2.9V21Zm7.02 0h4.16v-6.3c0-1.66.6-2.66 2.02-2.66 1.32 0 1.86.94 1.86 2.7V21H22.1v-6.9c0-3.4-1.82-4.98-4.24-4.98-1.96 0-2.84 1.08-3.33 1.84V9.4H9.92c.06 1.16 0 11.6 0 11.6Z',
  },
]

const LEGAL = [
  { label: 'Warranty & Returns', href: '/warranty' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const heading: React.CSSProperties = {
  display: 'block', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase',
  letterSpacing: '0.02em', color: '#fff', marginBottom: '10px',
}
const link: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#AAAAAA', textDecoration: 'none' }

export default function MobileFooter() {
  return (
    <footer style={{ background: '#002A13', color: '#F1EFE7', padding: '30px 16px calc(22px + 62px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div>
        <span style={{ display: 'block', fontWeight: 900, fontSize: '22px', letterSpacing: '0.03em', color: '#fff' }}>NOVA TYRES</span>
        <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 500, color: '#CFE5D8' }}>Best Deals on Tyres &amp; Wheels</p>
      </div>

      <div>
        <span style={heading}>Connect with us</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SOCIALS.map(s => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d={s.path} /></svg>
            </a>
          ))}
        </div>
      </div>

      <div>
        <span style={heading}>Quick Links</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {QUICK_LINKS.map(l => (
            <Link key={l.label} href={l.href} style={link}>{l.label}</Link>
          ))}
        </div>
      </div>

      <div>
        <span style={heading}>Our Stores</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {STORES.map(s => (
            <Link key={s.id} href="/service?goto=shops" style={link}>{s.short} – {s.state}</Link>
          ))}
        </div>
      </div>

      <div>
        <span style={heading}>About Nova Tyres</span>
        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: '#9DB0A5' }}>
          Nova Tyres is an Australian tyre and wheel retailer offering affordable products,
          professional fitting, balancing, alignments and automotive services for passenger,
          SUV, 4WD and commercial vehicles across {STORES.length} locations.
        </p>
      </div>

      <div style={{ height: '3px', background: '#808080', borderRadius: '2px', marginTop: '4px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>
          © {new Date().getFullYear()} Nova Tyres. All rights reserved.
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {LEGAL.map(l => (
            <Link key={l.label} href={l.href} style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
