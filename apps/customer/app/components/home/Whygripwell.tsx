import { money, DEFAULT_FITTING_PRICES } from '../../../lib/fitting'
const POINTS = [
  {
    num:   '01',
    title: 'Clear, all-in prices',
    body:  `Every price includes VAT. Fitting is from ${money(DEFAULT_FITTING_PRICES.passenger, { whole: true })} per tyre fitted, with balancing and new valves, and you see the full total before you pay.`,
  },
  {
    num:   '02',
    title: 'No hidden fees',
    body:  'The price on the page is the price you pay, fitting and VAT included.',
  },
  {
    num:   '03',
    title: 'Local to you',
    body:  "7 local branches across London. Walk in, or call — we'll sort you out.",
  },
]

export default function Whygripwell() {
  return (
    <section style={{ background: '#FFFFFF', padding: 'clamp(56px,6.8vw,88px) 0', fontFamily: 'var(--gw-font)' }}>
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
        <span style={{ display: 'block', fontFamily: 'var(--gw-font)', fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '16px' }}>
          Why Gripwell
        </span>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: 'clamp(32px,4.2vw,50px)', letterSpacing: '-0.02em', lineHeight: 1, color: '#1A1D23' }}>
          The Gripwell Standard
        </h2>
        <p style={{ margin: '0 0 clamp(28px,3.4vw,40px)', fontSize: '15.5px', color: '#6B7280', maxWidth: '52ch' }}>
          Three things you can check before you pay.
        </p>

        <div data-reveal className="nv-why-grid">
          {POINTS.map(p => (
            <div key={p.num} className="nv-why-cell">
              <span style={{ display: 'block', fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: '32px', lineHeight: 1, color: '#FF6A1A', marginBottom: '14px' }}>
                {p.num}
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#1A1D23' }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, color: '#6B7280', maxWidth: '44ch', textWrap: 'pretty' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
