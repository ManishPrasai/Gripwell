export default function CollectionHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#111', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}
    >
      {/* Background — reuses existing warehouse image */}
      <img
        src="/images/tyres-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.52)' }} />

      <div className="relative z-10 text-center px-4">
        {/* Decorative lines + kicker */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div style={{ height: '1px', width: '48px', background: 'rgba(255,255,255,0.4)' }} />
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
            Premium Performance Every Journey.
          </p>
          <div style={{ height: '1px', width: '48px', background: 'rgba(255,255,255,0.4)' }} />
        </div>

        <h1 style={{
          color: '#E8572A',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(32px, 5vw, 56px)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}>
          Our Tyre Collection
        </h1>
      </div>
    </section>
  )
}
