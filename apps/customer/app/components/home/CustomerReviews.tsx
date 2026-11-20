const RATING = '4.8'

const FEATURED = {
  initial: 'D',
  name:    'Daniel Mercer',
  where:   'Camden · 2 weeks ago',
  text:    'Ordered at 10am, fitted by 3pm the same day at Camden. They beat my local quote by £40 a tyre and walked me through the wear on my old set.',
}

const REVIEWS = [
  { initial: 'P', name: 'Priya Sharma',   where: 'Islington',   text: 'WhatsApped a photo of my sidewall and they matched the size in minutes. Three options, three prices, zero upselling.' },
  { initial: 'M', name: 'Marcus Taufa',   where: 'Shoreditch', text: 'Wheel and tyre package sorted in one visit. Balanced, torqued and out the door in under an hour.' },
  { initial: 'S', name: 'Sarah Nguyen',   where: 'Hammersmith', text: 'Best prices I found in London, and the online booking meant no waiting around when I arrived.' },
  { initial: 'J', name: 'James Whitmore', where: 'City',    text: 'Second set of tyres I have bought here. Same honest advice, same fair price, no surprises at the counter.' },
]

function Pin({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function CustomerReviews() {
  return (
    <section id="reviews" style={{ background: '#F0EFE9', padding: 'clamp(60px,7.6vw,104px) 0', fontFamily: 'var(--gw-font)' }}>
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

      {/* DEMO NOTICE — sample data only, not real customer reviews */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 0', padding: '0 clamp(16px,4vw,40px) 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', background: '#2A2E36', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px' }}>SAMPLE DATA</span>
        <span style={{ fontSize: '12px', color: '#4B5563' }}>Gripwell is a fictional shop, so these reviews, ratings and counts are made up to show the layout.</span>
      </div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>

        {/* ── Header ── */}
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: 'clamp(26px,3.2vw,44px)' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--gw-font)', fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '18px' }}>
              <span style={{ width: '22px', height: '1px', background: '#FF6A1A', display: 'inline-block' }} />
              Customer reviews
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: 'clamp(32px,4.9vw,63px)', lineHeight: 0.94, letterSpacing: '-0.015em', color: '#1A1D23' }}>
              What customers say.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: 'clamp(37px,4.3vw,55px)', lineHeight: 0.85, color: '#1A1D23' }}>{RATING}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ color: '#F5A623', fontSize: '16px', letterSpacing: '3px', lineHeight: 1 }}>★★★★★</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                Example ratings, not real reviews
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
          <figure className="nv-rev-feature" style={{ margin: 0, background: '#2A2E36', padding: 'clamp(28px,3.4vw,44px)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#FF6A1A', fontSize: '17px', letterSpacing: '3px', lineHeight: 1 }}>★★★★★</span>
            </span>
            <blockquote style={{ margin: 0, fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: 'clamp(17px,2.0vw,26px)', lineHeight: 1.16, letterSpacing: '-0.02em', color: '#F1EFE7' }}>
              &ldquo;{FEATURED.text}&rdquo;
            </blockquote>
            <figcaption style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '999px', background: '#3D4350', color: '#F1EFE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 700, flexShrink: 0 }}>
                {FEATURED.initial}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#F1EFE7' }}>{FEATURED.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#9EA3AD' }}>
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
              </span>
              <blockquote style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.65, color: '#1A1D23' }}>
                &ldquo;{rv.text}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '11px' }}>
                <span style={{ width: '38px', height: '38px', borderRadius: '999px', background: '#EDEEF0', color: '#2A2E36', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, flexShrink: 0 }}>
                  {rv.initial}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1D23' }}>{rv.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6B7280' }}>
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
