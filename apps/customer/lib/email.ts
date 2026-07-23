/* ────────────────────────────────────────────────────────────────────────────
   Transactional email via Resend (HTTP API — works on Cloudflare Workers).

   Config (Worker secrets / .env.local):
     RESEND_API_KEY   — required to actually send (missing → logs + skips)
     EMAIL_FROM       — e.g. "Nova Tyres <accounts@novatyres.com.au>"
     EMAIL_REPLY_TO   — optional, a real inbox for customer replies

   Sending is best-effort: a failure never breaks checkout — it's logged and
   the order still completes.
   ──────────────────────────────────────────────────────────────────────────── */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Nova Tyres <accounts@novatyres.com.au>'

async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', opts.to)
    return false
  }
  const from    = process.env.EMAIL_FROM || DEFAULT_FROM
  const replyTo = process.env.EMAIL_REPLY_TO

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from,
        to:      [opts.to],
        subject: opts.subject,
        html:    opts.html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) {
      console.error('[email] Resend error', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('[email] send failed', e)
    return false
  }
}

/* ── Order confirmation + invoice ──────────────────────────────────────────── */
export interface OrderEmailItem { name: string; sub: string; qty: number; unitPrice: number; total: number }
export interface OrderEmailData {
  to:           string
  customerName: string
  orderNumber:  string
  items:        OrderEmailItem[]
  subtotal:     number
  gst:          number
  fitting:      number
  discount:     number
  total:        number
  fulfilMethod: 'fit' | 'pickup'
  fitCount:     number
  itemCount:    number
  storeName?:   string
}

const money = (n: number) => `A$${n.toFixed(2)}`

export async function sendOrderConfirmation(d: OrderEmailData): Promise<boolean> {
  if (!d.to) return false
  return sendEmail({
    to:      d.to,
    subject: `Order ${d.orderNumber} confirmed — Nova Tyres`,
    html:    orderConfirmationHtml(d),
  })
}

function orderConfirmationHtml(d: OrderEmailData): string {
  const rows = d.items.map(it => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #EEE">
        <div style="font-weight:700;color:#16211B;font-size:14px">${esc(it.name)}</div>
        ${it.sub ? `<div style="color:#85908A;font-size:12px;margin-top:2px">${esc(it.sub)}</div>` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #EEE;text-align:center;color:#47554D;font-size:14px">${it.qty}</td>
      <td style="padding:12px 0;border-bottom:1px solid #EEE;text-align:right;color:#16211B;font-size:14px;white-space:nowrap">${money(it.total)}</td>
    </tr>`).join('')

  const totalRow = (label: string, val: string, opts: { strong?: boolean; muted?: boolean } = {}) => `
    <tr>
      <td style="padding:5px 0;color:${opts.muted ? '#85908A' : '#47554D'};font-size:${opts.strong ? '15px' : '13.5px'};font-weight:${opts.strong ? 700 : 400}">${label}</td>
      <td style="padding:5px 0;text-align:right;color:${opts.strong ? '#16211B' : '#47554D'};font-size:${opts.strong ? '15px' : '13.5px'};font-weight:${opts.strong ? 800 : 500};white-space:nowrap">${val}</td>
    </tr>`

  const fulfil = d.fulfilMethod === 'fit'
    ? `Fitting at <strong>${esc(d.storeName || 'your chosen Nova Tyres store')}</strong>${d.fitCount < d.itemCount ? ` · ${d.fitCount} of ${d.itemCount} fitted, ${d.itemCount - d.fitCount} to take home` : ` · all ${d.itemCount} fitted`}`
    : `Pickup at <strong>${esc(d.storeName || 'your chosen Nova Tyres store')}</strong>`

  return `<!doctype html>
<html><body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#076330;border-radius:16px 16px 0 0;padding:26px 28px">
      <div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.04em">NOVA TYRES</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:2px">Order confirmation &amp; tax invoice</div>
    </div>
    <div style="background:#fff;border:1px solid #EBEBEB;border-top:none;border-radius:0 0 16px 16px;padding:28px">
      <p style="margin:0 0 4px;color:#16211B;font-size:16px">Hi ${esc(d.customerName)},</p>
      <p style="margin:0 0 20px;color:#47554D;font-size:14px;line-height:1.6">Thanks for your order — it's confirmed. Here are the details.</p>

      <div style="background:#F5F4EF;border-radius:10px;padding:14px 16px;margin-bottom:22px">
        <div style="color:#85908A;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Order number</div>
        <div style="color:#16211B;font-weight:800;font-size:18px;margin-top:2px">${esc(d.orderNumber)}</div>
        <div style="color:#47554D;font-size:13px;margin-top:8px">${fulfil}</div>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #EBEBEB;color:#85908A;font-size:11px;text-transform:uppercase;letter-spacing:.06em">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #EBEBEB;color:#85908A;font-size:11px;text-transform:uppercase;letter-spacing:.06em">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #EBEBEB;color:#85908A;font-size:11px;text-transform:uppercase;letter-spacing:.06em">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        ${totalRow('Products', money(d.subtotal))}
        ${totalRow('GST (10%)', money(d.gst))}
        ${d.fitting > 0 ? totalRow(`Fitting service (${d.fitCount} × )`, money(d.fitting)) : ''}
        ${d.discount > 0 ? totalRow('Discount', `− ${money(d.discount)}`) : ''}
        <tr><td colspan="2" style="padding:6px 0"><div style="height:1px;background:#EBEBEB"></div></td></tr>
        ${totalRow('Total (GST included)', money(d.total), { strong: true })}
      </table>

      <p style="margin:24px 0 0;color:#85908A;font-size:12.5px;line-height:1.6">
        We'll be in touch when your order is ready. Questions? Just reply to this email.
      </p>
    </div>
    <p style="text-align:center;color:#B0B0A8;font-size:11px;margin-top:16px">© Nova Tyres · Australian tyre &amp; wheel retailer</p>
  </div>
</body></html>`
}

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}
