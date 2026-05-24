export default function WhyNovaTyres() {
  const props = [
    {
      icon: 'ti-tools',
      label: 'Expert Fitting Included',
      desc: 'Professional fitting, balancing and new valves at every location.'
    },
    {
      icon: 'ti-shield-check',
      label: 'Price Match Guarantee',
      desc: "Find it cheaper? We'll beat any written quote. No questions asked."
    },
    {
      icon: 'ti-map-pin',
      label: '9 Locations Nationwide',
      desc: 'VIC, NSW, QLD and SA. Same day fitting available at all stores.'
    },
  ]

  return (
    <section className="py-16 px-4" style={{ background: '#FAF9F5' }}>
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p
              className="uppercase tracking-widest mb-1"
              style={{ color: '#E8572A', letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Why Nova Tyres
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', color: '#1A1A1A', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              The Smarter Way to Buy Tyres
            </h2>
          </div>
          <p style={{ color: '#888', maxWidth: '340px', fontSize: '15px', fontWeight: 400 }}>
            More than 10+ years of excellence — Trusted by Australian drivers and trade resellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.map((prop) => (
            <div
              key={prop.label}
              className="flex gap-4 p-6 rounded-2xl border"
              style={{ background: 'white', borderColor: '#E5E5E5' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#E8F5EE' }}
              >
                <i className={`ti ${prop.icon}`} style={{ fontSize: '20px', color: '#1C3A2B' }} aria-hidden="true" />
              </div>
              <div>
                <p className="mb-1" style={{ color: '#1A1A1A', fontSize: '18px', fontWeight: 500 }}>
                  {prop.label}
                </p>
                <p className="leading-relaxed" style={{ color: '#666', fontSize: '15px', fontWeight: 400 }}>
                  {prop.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl overflow-hidden relative" style={{ height: '220px' }}>
          <img
            src="/images/warehouse.jpg"
            alt="Nova Tyres warehouse"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 flex items-end p-6"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}
          >
            <p className="text-white" style={{ fontSize: '15px', fontWeight: 400 }}>
              Warehouse direct — 200+ models always in stock
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
