'use client'

/*
  Warranty page — ported from the reference "Warranty.html" design into a real
  route, in the light theme shown in the reference image (the original export
  defaulted to a dark theme, which is what looked "off").

  Left: the pitch. Right: a "Get in touch" card where the customer picks their
  nearest workshop and gets that store's WhatsApp + phone. Wired to the seven
  open stores with the current numbers.
*/

import { useState } from 'react'

interface Store {
  slug: string
  label: string
  wa: string          // WhatsApp number, international (61…)
  tel: string         // phone, digits only, for the tel: link
  telDisp: string     // phone, formatted for display
}

const STORES: Store[] = [
  { slug: 'springvale', label: 'Springvale VIC',       wa: '61401531756', tel: '0395624269', telDisp: '03 9562 4269' },
  { slug: 'dandenong',  label: 'Dandenong VIC',        wa: '61413792400', tel: '0387875846', telDisp: '03 8787 5846' },
  { slug: 'bayswater',  label: 'Bayswater VIC',        wa: '61411879425', tel: '0397209354', telDisp: '03 9720 9354' },
  { slug: 'alphington', label: 'Alphington VIC',       wa: '61403884151', tel: '0403884151', telDisp: '0403 884 151' },
  { slug: 'sunshine',   label: 'Sunshine VIC',         wa: '61401199224', tel: '0401199224', telDisp: '0401 199 224' },
  { slug: 'geelong',    label: 'Geelong VIC',          wa: '61478698884', tel: '0478698884', telDisp: '0478 698 884' },
  { slug: 'sefton',     label: 'Sefton NSW · Sydney',  wa: '61403388774', tel: '0403388774', telDisp: '0403 388 774' },
]

const PERKS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Any branch, any time',
    body: 'Claim at the nearest shop — records sync across all stores.',
    icon: <path d="M20 6 9 17l-5-5" />,
  },
  {
    title: 'Fast turnaround',
    body: 'Free inspection and a decision on most claims within the day.',
    icon: <><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></>,
  },
  {
    title: 'No paperwork hassle',
    body: 'We pull up your service history and sort the claim for you.',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
]

export default function WarrantyPage() {
  const [store, setStore] = useState<Store>(STORES[3]) // Alphington, as in the reference image

  const F = "'DM Sans', system-ui, sans-serif"

  return (
    <main className="wpg">
      <style>{`
        .wpg {
          --paper:#E9E7E1; --panel:#F6F5F0; --line:#DEDBD1;
          --ink:#141915; --ink-2:#5A6058; --ink-3:#8A9086;
          --green:#0B7A3B; --green-soft:#DBEBE0;
          --accent:#E8572A; --accent-soft:#FBE4DB;
          background: var(--paper);
          min-height: 70vh;
          font-family: ${F};
        }
        .wpg .wrap { max-width: 1160px; margin: 0 auto; padding: clamp(56px,9vw,120px) 24px clamp(64px,9vw,120px); }
        .wpg .layout { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(36px,6vw,88px); align-items: start; }
        @media (max-width: 900px) { .wpg .layout { grid-template-columns: 1fr; gap: 40px; } }

        .wpg .kicker { display:inline-flex; align-items:center; gap:12px; font-size:13px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); }
        .wpg .kicker::before { content:""; width:26px; height:2px; background:var(--accent); border-radius:2px; }
        .wpg h1 { font-weight:900; text-transform:uppercase; font-size:clamp(44px,7vw,86px); line-height:.92; letter-spacing:-.035em; color:var(--ink); margin:18px 0 0; text-wrap:balance; }
        .wpg .sub { margin:22px 0 0; font-size:clamp(15px,1.5vw,17px); line-height:1.65; color:var(--ink-2); max-width:46ch; }

        .wpg .perks { margin-top:clamp(30px,4vw,44px); display:flex; flex-direction:column; gap:20px; }
        .wpg .perk { display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:start; }
        .wpg .perk-ico { width:44px; height:44px; border-radius:50%; background:var(--green-soft); color:var(--green); display:grid; place-items:center; flex:none; }
        .wpg .perk-ico svg { width:22px; height:22px; }
        .wpg .perk h4 { margin:0 0 3px; font-size:16px; font-weight:700; color:var(--ink); }
        .wpg .perk p { margin:0; font-size:14px; line-height:1.5; color:var(--ink-2); }

        .wpg .card { background:var(--panel); border:1px solid var(--line); border-radius:22px; padding:clamp(26px,3vw,38px); box-shadow:0 1px 2px rgba(20,25,20,.03), 0 24px 60px -30px rgba(20,25,20,.22); }
        .wpg .card h3 { margin:0; font-size:24px; font-weight:800; letter-spacing:-.01em; color:var(--ink); }
        .wpg .card-sub { margin:8px 0 24px; font-size:14.5px; line-height:1.55; color:var(--ink-2); }

        .wpg .field label { display:block; font-size:11.5px; font-weight:700; letter-spacing:.13em; text-transform:uppercase; color:var(--ink-3); margin-bottom:9px; }
        .wpg .field select { width:100%; appearance:none; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9086' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 16px center; border:1px solid var(--line); border-radius:12px; padding:14px 44px 14px 16px; font-family:${F}; font-size:15px; font-weight:600; color:var(--ink); cursor:pointer; }
        .wpg .field select:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

        .wpg .methods { display:flex; flex-direction:column; gap:12px; margin-top:20px; }
        .wpg .method { display:flex; align-items:center; gap:14px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px 18px; text-decoration:none; transition:border-color .2s, transform .2s, box-shadow .2s; }
        .wpg .method:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:0 12px 24px -16px rgba(232,87,42,.5); }
        .wpg .m-ico { width:44px; height:44px; border-radius:12px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; flex:none; }
        .wpg .m-ico svg { width:22px; height:22px; }
        .wpg .m-txt { flex:1; min-width:0; }
        .wpg .m-label { display:block; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); }
        .wpg .m-value { display:block; font-size:16.5px; font-weight:800; color:var(--ink); margin-top:2px; }
        .wpg .m-go { width:20px; height:20px; color:var(--ink-3); flex:none; transition:transform .2s, color .2s; }
        .wpg .method:hover .m-go { color:var(--accent); transform:translateX(3px); }

        .wpg .foot { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:20px; font-size:13px; color:var(--ink-2); }
        .wpg .foot svg { width:16px; height:16px; color:var(--accent); flex:none; }

        @media (prefers-reduced-motion: reduce) { .wpg * { transition:none !important; } }
      `}</style>

      <div className="wrap">
        <div className="layout">

          {/* ── Left: the pitch ── */}
          <div>
            <span className="kicker">Warranty &amp; claims</span>
            <h1>Warranty?<br />Talk to us.</h1>
            <p className="sub">
              Everything we do is backed in writing. For any warranty question or claim, just get in
              touch with any workshop — quote your rego or bring your receipt, and our team handles the
              rest, usually the same day.
            </p>
            <div className="perks">
              {PERKS.map((p) => (
                <div className="perk" key={p.title}>
                  <span className="perk-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
                  </span>
                  <div>
                    <h4>{p.title}</h4>
                    <p>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: get in touch ── */}
          <div className="card">
            <h3>Get in touch</h3>
            <p className="card-sub">Choose your nearest workshop and we&apos;ll show you how to reach that store directly.</p>

            <div className="field">
              <label htmlFor="storeSelect">Select a store</label>
              <select
                id="storeSelect"
                value={store.slug}
                onChange={(e) => setStore(STORES.find((s) => s.slug === e.target.value) ?? STORES[0])}
              >
                {STORES.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
              </select>
            </div>

            <div className="methods">
              <a className="method" href={`https://wa.me/${store.wa}`} target="_blank" rel="noopener noreferrer">
                <span className="m-ico">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.83-1.96-.92-.26-.1-.45-.14-.64.14-.19.28-.73.92-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.48l-.54-.01c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.33 0 1.38 1 2.71 1.14 2.9.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.19-.53-.33zM12 2a10 10 0 0 0-8.55 15.13L2 22l4.97-1.3A10 10 0 1 0 12 2z" /></svg>
                </span>
                <span className="m-txt">
                  <span className="m-label">WhatsApp · {store.label}</span>
                  <span className="m-value">Message this store</span>
                </span>
                <svg className="m-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>

              <a className="method" href={`tel:${store.tel}`}>
                <span className="m-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </span>
                <span className="m-txt">
                  <span className="m-label">Call · {store.label}</span>
                  <span className="m-value">{store.telDisp}</span>
                </span>
                <svg className="m-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>

            <div className="foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              Have your rego or receipt handy to speed things up.
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
