const POINTS = [
  {
    num:   '01',
    title: "Everything's included",
    body:  'Fitting, balancing and new valves come with every tyre. The price you see is the price you pay.',
  },
  {
    num:   '02',
    title: 'Warehouse direct prices',
    body:  "We buy in bulk and sell direct — that's how we stay cheaper than the big chains, on the same tyres.",
  },
  {
    num:   '03',
    title: 'Local, since day one',
    body:  "10+ years serving Australian drivers from 9 local stores. Walk in, or call — we'll sort you out.",
  },
]

export default function WhyNovaTyres() {
  return (
    <section style={{ background: '#0F2A1C', padding: 'clamp(60px,7.2vw,96px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-why-grid { display: grid; gap: clamp(28px,4vw,48px); grid-template-columns: repeat(3,1fr); }
        @media (max-width: 780px) { .nv-why-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FF8A5C', marginBottom: '14px' }}>
          Why Nova
        </span>
        <h2 style={{ margin: '0 0 clamp(34px,4.4vw,58px)', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(40px,5.4vw,70px)', letterSpacing: '0.015em', lineHeight: 0.98, color: '#F1EFE7' }}>
          The Nova Standard
        </h2>

        <div data-reveal className="nv-why-grid">
          {POINTS.map(p => (
            <div key={p.num} style={{ minWidth: 0, paddingTop: '22px', borderTop: '1px solid rgba(241,239,231,0.22)' }}>
              <span style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(34px,3.4vw,44px)', lineHeight: 1, letterSpacing: '0.02em', color: '#E8572A', marginBottom: '14px' }}>
                {p.num}
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em', color: '#F1EFE7' }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, color: '#A8BDB0', maxWidth: '44ch', textWrap: 'pretty' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
