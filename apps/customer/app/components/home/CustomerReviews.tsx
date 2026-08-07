const RATING = '4.8'

const FEATURED = {
  initial: 'D',
  name:    'Daniel Mercer',
  where:   'Springvale · 2 weeks ago',
  text:    'Ordered at 10am, fitted by 3pm the same day at Springvale. They beat my local quote by $40 a tyre and walked me through the wear on my old set.',
}

const REVIEWS = [
  { initial: 'P', name: 'Priya Sharma',   where: 'Geelong',   text: 'WhatsApped a photo of my sidewall and they matched the size in minutes. Three options, three prices, zero upselling.' },
  { initial: 'M', name: 'Marcus Taufa',   where: 'Dandenong', text: 'Wheel and tyre package sorted in one visit. Balanced, torqued and out the door in under an hour.' },
  { initial: 'S', name: 'Sarah Nguyen',   where: 'Bayswater', text: 'Best prices I found in Melbourne, and the online booking meant no waiting around when I arrived.' },
  { initial: 'J', name: 'James Whitmore', where: 'Sefton',    text: 'Second set of tyres I have bought here. Same honest advice, same fair price, no surprises at the counter.' },
]

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Pin({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function CustomerReviews() {
  return (
    <section id="reviews" style={{ background: '#F0EFE9', padding: 'clamp(60px,7.6vw,104px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        /*
          The featured quote spans both rows of the 3-column layout, so the four
          smaller cards fill the remaining 2×2. The 1px grid gap plus a shared
          background paints the hairlines between cells — no per-card borders.
        */
        .nv-rev-grid    { display: grid; gap: 1px; grid-template-columns: repeat(3,1fr); }
        .nv-rev-feature { grid-row: span 2; }
        @media (max-width: 1100px) { .nv-rev-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 780px)  {
          .nv-rev-grid    { grid-template-columns: 1fr; }
          .nv-rev-feature { grid-row: auto; }
        }
        .nv-rev-card:hover { background: #FAF9F5; }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>

        {/* ── Header ── */}
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: 'clamp(26px,3.2vw,44px)' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7C74', marginBottom: '18px' }}>
              <span style={{ width: '22px', height: '1px', background: '#E8572A', display: 'inline-block' }} />
              Customer reviews
            </span>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(44px,6.8vw,88px)', lineHeight: 0.94, letterSpacing: '-0.015em', color: '#16211B' }}>
              What customers say.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingBottom: '6px' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,6vw,76px)', lineHeight: 0.85, color: '#16211B' }}>{RATING}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ color: '#F5A623', fontSize: '16px', letterSpacing: '3px', lineHeight: 1 }}>★★★★★</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6E7C74', whiteSpace: 'nowrap' }}>
                <GoogleG size={15} />
                1,240 verified Google reviews
              </span>
            </span>
          </div>
        </div>

        {/* ── Grid ── */}
        <div
          data-reveal
          className="nv-rev-grid"
          style={{
            background: '#DEDCD4', borderRadius: '16px', overflow: 'hidden', alignItems: 'stretch',
            boxShadow: '0 4px 6px rgba(20,25,22,0.05), 0 24px 50px -30px rgba(20,25,22,0.28)',
          }}
        >
          <figure className="nv-rev-feature" style={{ margin: 0, background: '#1C3A2B', padding: 'clamp(28px,3.4vw,44px)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#E8572A', fontSize: '17px', letterSpacing: '3px', lineHeight: 1 }}>★★★★★</span>
              <GoogleG size={20} />
            </span>
            <blockquote style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,2.8vw,36px)', lineHeight: 1.16, letterSpacing: '0.01em', color: '#F1EFE7' }}>
              &ldquo;{FEATURED.text}&rdquo;
            </blockquote>
            <figcaption style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '999px', background: '#2D5C42', color: '#F1EFE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 700, flexShrink: 0 }}>
                {FEATURED.initial}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#F1EFE7' }}>{FEATURED.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#9DB0A5' }}>
                  <Pin /> {FEATURED.where}
                </span>
              </span>
            </figcaption>
          </figure>

          {REVIEWS.map(rv => (
            <figure
              key={rv.name}
              className="nv-rev-card"
              style={{
                margin: 0, minWidth: 0, background: '#FFFFFF', padding: 'clamp(22px,2.4vw,30px)',
                display: 'flex', flexDirection: 'column', gap: '16px', transition: 'background .22s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#F5A623', fontSize: '14px', letterSpacing: '2.5px', lineHeight: 1 }}>★★★★★</span>
                <GoogleG size={17} />
              </span>
              <blockquote style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.65, color: '#16211B' }}>
                &ldquo;{rv.text}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '11px' }}>
                <span style={{ width: '38px', height: '38px', borderRadius: '999px', background: '#E8F5EE', color: '#076330', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, flexShrink: 0 }}>
                  {rv.initial}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16211B' }}>{rv.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6E7C74' }}>
                    <Pin size={11} /> {rv.where}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
