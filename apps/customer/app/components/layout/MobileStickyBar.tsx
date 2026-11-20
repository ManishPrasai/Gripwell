'use client'

import Link from 'next/link'
import { NOVA_PHONE_HREF, NOVA_WA_HREF } from './Navbar'

const itemStyle: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            '4px',
  color:          '#F1EFE7',
  textDecoration: 'none',
  padding:        '10px 4px',
  minHeight:      '64px',
  background:     'transparent',
  border:         'none',
  cursor:         'pointer',
  fontFamily:     'var(--gw-font)',
}

const labelStyle: React.CSSProperties = { fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.04em' }

/*
  Fixed call-to-action bar for phones. The spacer sibling reserves the bar's
  own height so the last section (and the footer) can still be scrolled clear
  of it. Hidden at ≥781px, matching the design's mobile breakpoint.
*/
export default function MobileStickyBar() {
  return (
    <>
      <style>{`
        .nv-sticky-bar, .nv-sticky-spacer { display: none; }
        @media (max-width: 780px) {
          .nv-sticky-spacer { display: block; height: 66px; }
          .nv-sticky-bar {
            display: grid;
            grid-template-columns: repeat(4,1fr);
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 70;
            background: #1A1D23;
            box-shadow: 0 -8px 30px rgba(13,26,18,0.4);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
        .nv-sticky-bar > *:active { background: rgba(255,255,255,0.08); }
      `}</style>

      <div className="nv-sticky-spacer" aria-hidden="true" />

      <nav className="nv-sticky-bar" aria-label="Quick contact">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={itemStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span style={labelStyle}>Search</span>
        </button>

        <a href={NOVA_PHONE_HREF} style={itemStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span style={labelStyle}>Call</span>
        </a>

        <a href={NOVA_WA_HREF} target="_blank" rel="noopener noreferrer" style={itemStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#39C06E" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
          </svg>
          <span style={labelStyle}>WhatsApp</span>
        </a>

        <Link href="/service" style={itemStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 9h8M8 13h5" />
            <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z" />
          </svg>
          <span style={labelStyle}>Book</span>
        </Link>
      </nav>
    </>
  )
}
