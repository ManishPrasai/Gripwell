import Link from 'next/link'
import Image from 'next/image'
import { STORES, telHref } from '../../../../lib/stores'

/*
  "Find a store" — horizontal card rail from the Mobile Find Tyres artboard.
  Shared by the mobile /tyres and /wheels pages. Storefront photo where we
  have one, green-initials panel where we don't; tel: button per branch.
*/
export default function MobileStoreRail() {
  return (
    <section style={{ background: '#FAF9F5', padding: '20px 0 20px 16px', borderTop: '1px solid #E7E5DE' }}>
      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px', paddingRight: '16px' }}>
        Find a store
      </span>
      <div className="nv-mob-rail" style={{ paddingRight: '16px' }}>
        {STORES.map(s => (
          <div key={s.id} style={{ width: '210px', background: '#fff', border: '1px solid #E7E5DE', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '96px', background: '#E9E9E7' }}>
              {s.image ? (
                <Image src={s.image} alt={s.name} fill sizes="210px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDEEF0', color: '#2A2E36', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.short}
                </div>
              )}
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1D23', textTransform: 'uppercase' }}>{s.short}</span>
              <span style={{ fontSize: '11.5px', color: '#6B7280' }}>{s.address}, {s.suburb}</span>
              <a href={telHref(s.tel)} style={{ textAlign: 'center', border: '1.4px solid #2A2E36', color: '#2A2E36', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', marginTop: '4px' }}>
                {s.tel}
              </a>
            </div>
          </div>
        ))}
      </div>
      <Link href="/service?goto=shops" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12.5px', fontWeight: 700, color: '#2A2E36', textDecoration: 'none' }}>
        View all locations →
      </Link>
    </section>
  )
}
