const ITEMS = [
  {
    icon:  'ti-headphones',
    title: 'Need help choosing?',
    desc:  'Our tyre experts are here to help find the perfect fit.',
  },
  {
    icon:  'ti-truck-delivery',
    title: 'Fast delivery',
    desc:  'Quick shipping on in-stock tyres.',
  },
  {
    icon:  'ti-tools',
    title: 'Fitting available',
    desc:  'Official fitting locations available.',
  },
  {
    icon:  'ti-user-star',
    title: 'Expert support',
    desc:  'Support from our friendly team.',
  },
]

export default function TyreInfoBar() {
  return (
    <section style={{ background: '#fff', paddingTop: '16px', paddingBottom: '40px' }}>
      <div className="nv-shell">

        {/* Divider */}
        <div style={{ height: '1px', background: '#E8E8E8', marginBottom: '0' }} />

        <div
          style={{
            border: '1.5px solid #E9E9E9',
            borderRadius: '10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            overflow: 'hidden',
            marginTop: '24px',
          }}
        >
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '24px 20px',
                borderRight: i < ITEMS.length - 1 ? '1px solid #E9E9E9' : 'none',
              }}
            >
              <div style={{ flexShrink: 0, width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: '36px', color: '#1A1A1A' }} aria-hidden="true" />
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '16px', color: '#1A1A1A', marginBottom: '4px' }}>
                  {item.title}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '13px', color: '#989898', lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
