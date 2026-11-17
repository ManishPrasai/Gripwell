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
    <section style={{ background: '#FFFFFF', padding: 'clamp(56px,6.8vw,88px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-why-grid { display: grid; grid-template-columns: repeat(3,1fr); border: 1px solid #E7E5DE; border-radius: 22px; overflow: hidden; }
        .nv-why-cell { padding: clamp(26px,3vw,36px) clamp(22px,2.6vw,32px); border-right: 1px solid #E7E5DE; }
        .nv-why-cell:last-child { border-right: none; }
        @media (max-width: 780px) {
          .nv-why-grid { grid-template-columns: 1fr; }
          .nv-why-cell { border-right: none; border-bottom: 1px solid #E7E5DE; }
          .nv-why-cell:last-child { border-bottom: none; }
        }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#E8572A', marginBottom: '16px' }}>
          Why Nova
        </span>
        <h2 style={{ margin: '0 0 12px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(44px,5.8vw,70px)', letterSpacing: '0.015em', lineHeight: 1, color: '#16211B' }}>
          The Nova Standard
        </h2>
        <p style={{ margin: '0 0 clamp(28px,3.4vw,40px)', fontSize: '15.5px', color: '#6E7C74', maxWidth: '52ch' }}>
          Three reasons drivers keep coming back, in their own words.
        </p>

        <div data-reveal className="nv-why-grid">
          {POINTS.map(p => (
            <div key={p.num} className="nv-why-cell">
              <span style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', lineHeight: 1, color: '#E8572A', marginBottom: '14px' }}>
                {p.num}
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#16211B' }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, color: '#6E7C74', maxWidth: '44ch', textWrap: 'pretty' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
