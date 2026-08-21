import { C, FONT, CONTAINER } from '../shop/tokens'

/* The Find Tyres and Find Wheels designs carry the same four-up value bar,
   differing only in the noun. `kind` switches the two lines that change. */
export default function TyreInfoBar({ kind = 'tyres' }: { kind?: 'tyres' | 'wheels' }) {
  const isWheels = kind === 'wheels'

  const props = [
    { title: 'Need help choosing?', body: `Our ${isWheels ? 'wheel' : 'tyre'} experts are here to help find the perfect fit.` },
    { title: 'Fast delivery',       body: `Quick shipping on in-stock ${isWheels ? 'wheels' : 'tyres'}.` },
    { title: 'Fitting available',   body: isWheels ? 'Fitted and balanced free with any wheel purchase.' : 'Official fitting locations available.' },
    { title: 'Expert support',      body: 'Support from our friendly team.' },
  ]

  return (
    <section style={{ background: '#fff', padding: 'clamp(28px,3.5vw,44px) clamp(16px,3vw,64px)', fontFamily: FONT }}>
      <div
        style={{
          ...CONTAINER,
          border: `1px solid ${C.line}`, borderRadius: '4px',
          padding: 'clamp(18px,2.5vw,28px)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '22px',
        }}
      >
        {props.map(p => (
          <div key={p.title} style={{ borderLeft: `3px solid ${C.orange}`, paddingLeft: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.ink }}>{p.title}</div>
            <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: C.muted, marginTop: '3px' }}>{p.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
