export default function WheelCollectionHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#111', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}
    >
      <img
        src="/images/wheels-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.48)' }} />

      <div className="relative z-10 text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div style={{ height: '1px', width: '48px', background: 'rgba(255,255,255,0.4)' }} />
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
            Premium Fitment. Style. Performance.
          </p>
          <div style={{ height: '1px', width: '48px', background: 'rgba(255,255,255,0.4)' }} />
        </div>

        <h1 style={{
          color:        '#E8572A',
          fontFamily:   "'DM Sans', sans-serif",
          fontWeight:    900,
          fontSize:     'clamp(32px, 5vw, 56px)',
          lineHeight:    1.1,
          letterSpacing: '-0.01em',
        }}>
          Find Your Perfect Wheels
        </h1>
      </div>
    </section>
  )
}
