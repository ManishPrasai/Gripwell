/* ────────────────────────────────────────────────────────────────────────────
   Transactional email via Resend (HTTP API — works on Cloudflare Workers).

   Config (Worker secrets / .env.local):
     RESEND_API_KEY   — required to actually send (missing → logs + skips)
     EMAIL_FROM       — e.g. "Gripwell <hello@gripwell.demo>"
     EMAIL_REPLY_TO   — optional, a real inbox for customer replies

   Sending is best-effort: a failure never breaks checkout — it's logged and
   the order still completes.
   ──────────────────────────────────────────────────────────────────────────── */

import { SITE_URL } from './site'
import { money } from './fitting'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
// Invoice / order-confirmation sender. Override with EMAIL_FROM if needed.
const DEFAULT_FROM = 'Gripwell <no-reply@gripwell.demo>'

async function sendEmail(opts: { to: string; subject: string; html: string; from?: string; replyTo?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', opts.to)
    return false
  }
  const from    = opts.from ?? process.env.EMAIL_FROM ?? DEFAULT_FROM
  const replyTo = opts.replyTo ?? process.env.EMAIL_REPLY_TO

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
  VAT:          number
  fitting:      number
  discount:     number
  total:        number
  fulfilMethod: 'fit' | 'pickup'
  fitCount:     number
  itemCount:    number
  storeName?:   string
}


export async function sendOrderConfirmation(d: OrderEmailData): Promise<boolean> {
  if (!d.to) return false
  return sendEmail({
    to:      d.to,
    subject: `Order ${d.orderNumber} confirmed — Gripwell`,
    html:    orderConfirmationHtml(d),
  })
}

function orderConfirmationHtml(d: OrderEmailData): string {
  const rows = d.items.map(it => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #EEE">
        <div style="font-weight:700;color:#1A1D23;font-size:14px">${esc(it.name)}</div>
        ${it.sub ? `<div style="color:#85908A;font-size:12px;margin-top:2px">${esc(it.sub)}</div>` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #EEE;text-align:center;color:#4B5563;font-size:14px">${it.qty}</td>
      <td style="padding:12px 0;border-bottom:1px solid #EEE;text-align:right;color:#1A1D23;font-size:14px;white-space:nowrap">${money(it.total)}</td>
    </tr>`).join('')

  const totalRow = (label: string, val: string, opts: { strong?: boolean; muted?: boolean } = {}) => `
    <tr>
      <td style="padding:5px 0;color:${opts.muted ? '#85908A' : '#4B5563'};font-size:${opts.strong ? '15px' : '13.5px'};font-weight:${opts.strong ? 700 : 400}">${label}</td>
      <td style="padding:5px 0;text-align:right;color:${opts.strong ? '#1A1D23' : '#4B5563'};font-size:${opts.strong ? '15px' : '13.5px'};font-weight:${opts.strong ? 800 : 500};white-space:nowrap">${val}</td>
    </tr>`

  const fulfil = d.fulfilMethod === 'fit'
    ? `Fitting at <strong>${esc(d.storeName || 'your chosen Gripwell store')}</strong>${d.fitCount < d.itemCount ? ` · ${d.fitCount} of ${d.itemCount} fitted, ${d.itemCount - d.fitCount} to take home` : ` · all ${d.itemCount} fitted`}`
    : `Pickup at <strong>${esc(d.storeName || 'your chosen Gripwell store')}</strong>`

  return `<!doctype html>
<html><body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#2A2E36;border-radius:16px 16px 0 0;padding:26px 28px">
      <div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.04em">Gripwell</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:2px">Order confirmation &amp; tax invoice</div>
    </div>
    <div style="background:#fff;border:1px solid #EBEBEB;border-top:none;border-radius:0 0 16px 16px;padding:28px">
      <p style="margin:0 0 4px;color:#1A1D23;font-size:16px">Hi ${esc(d.customerName)},</p>
      <p style="margin:0 0 20px;color:#4B5563;font-size:14px;line-height:1.6">Thanks for your order — it's confirmed. Here are the details.</p>

      <div style="background:#F5F4EF;border-radius:10px;padding:14px 16px;margin-bottom:22px">
        <div style="color:#85908A;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Order number</div>
        <div style="color:#1A1D23;font-weight:800;font-size:18px;margin-top:2px">${esc(d.orderNumber)}</div>
        <div style="color:#4B5563;font-size:13px;margin-top:8px">${fulfil}</div>
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
        ${totalRow('Includes VAT (20%)', money(d.VAT))}
        ${d.fitting > 0 ? totalRow(`Fitting service (${d.fitCount} × ${money(d.fitting / Math.max(1, d.fitCount))})`, money(d.fitting)) : ''}
        ${d.discount > 0 ? totalRow('Discount', `− ${money(d.discount)}`) : ''}
        <tr><td colspan="2" style="padding:6px 0"><div style="height:1px;background:#EBEBEB"></div></td></tr>
        ${totalRow('Total paid', money(d.total), { strong: true })}
      </table>

      <p style="margin:24px 0 0;color:#85908A;font-size:12.5px;line-height:1.6">
        We'll be in touch when your order is ready. Questions? Just reply to this email.
      </p>
    </div>
    <p style="text-align:center;color:#B0B0A8;font-size:11px;margin-top:16px">&#169; Gripwell &middot; London tyre &amp; wheel retailer</p>
  </div>
</body></html>`
}

/* ── Sales / promotional email (from the marketing address) ────────────────── */
const DEFAULT_MARKETING_FROM = 'Gripwell <updates@gripwell.demo>'

export interface SalesEmailData {
  to:            string
  customerName?: string
  headline:      string
  subhead?:      string
  code?:         string
  ctaLabel?:     string
  ctaUrl?:       string
}

export async function sendSalesEmail(d: SalesEmailData): Promise<boolean> {
  if (!d.to) return false
  const from = process.env.EMAIL_MARKETING_FROM || DEFAULT_MARKETING_FROM
  return sendEmail({
    to:      d.to,
    subject: `${d.headline} — Gripwell`,
    html:    salesHtml(d),
    from,
  })
}

function salesHtml(d: SalesEmailData): string {
  const cta = d.ctaUrl || `${SITE_URL}/tyres/results`
  return `<!doctype html>
<html><body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#2A2E36;border-radius:16px 16px 0 0;padding:22px 28px">
      <div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.04em">Gripwell</div>
    </div>
    <div style="background:#fff;border:1px solid #EBEBEB;border-top:none;border-radius:0 0 16px 16px;padding:32px 28px;text-align:center">
      <div style="display:inline-block;background:#FFF0E8;color:#FF6A1A;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:999px">Sale on now</div>
      <h1 style="margin:18px 0 8px;color:#1A1D23;font-size:28px;line-height:1.15;letter-spacing:-.02em">${esc(d.headline)}</h1>
      ${d.subhead ? `<p style="margin:0 auto 22px;color:#4B5563;font-size:15px;line-height:1.6;max-width:42ch">${esc(d.subhead)}</p>` : ''}
      ${d.code ? `
        <div style="margin:0 auto 24px;max-width:320px;border:2px dashed #FF6A1A;border-radius:12px;padding:16px">
          <div style="color:#85908A;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Use code</div>
          <div style="color:#FF6A1A;font-weight:800;font-size:24px;letter-spacing:.04em;margin-top:2px">${esc(d.code)}</div>
        </div>` : ''}
      <a href="${esc(cta)}" style="display:inline-block;background:#FF6A1A;color:#fff;font-weight:800;font-size:15px;letter-spacing:.02em;text-decoration:none;padding:15px 34px;border-radius:12px">${esc(d.ctaLabel || 'Shop the sale')}</a>

      <table style="width:100%;border-collapse:collapse;margin-top:32px;border-top:1px solid #EBEBEB;padding-top:8px">
        <tr>
          <td style="padding:18px 8px 0;text-align:center;color:#4B5563;font-size:12.5px;vertical-align:top">🏷️<br>Warehouse-direct prices</td>
          <td style="padding:18px 8px 0;text-align:center;color:#4B5563;font-size:12.5px;vertical-align:top">🔧<br>Fitting at 7 stores</td>
          <td style="padding:18px 8px 0;text-align:center;color:#4B5563;font-size:12.5px;vertical-align:top">&#128666;<br>Fast UK delivery</td>
        </tr>
      </table>
    </div>
    <p style="text-align:center;color:#B0B0A8;font-size:11px;margin-top:16px;line-height:1.6">
      You're receiving this because you shop with Gripwell.<br>© Gripwell · Reply to unsubscribe.
    </p>
  </div>
</body></html>`
}

/* ── Newsletter double opt-in confirmation ─────────────────────────────────── */
export async function sendNewsletterConfirmation(to: string, token: string): Promise<boolean> {
  if (!to) return false
  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`
  return sendEmail({
    to,
    subject: 'Confirm your Gripwell subscription',
    html: newsletterConfirmHtml(confirmUrl),
  })
}

function newsletterConfirmHtml(confirmUrl: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#2A2E36;border-radius:16px 16px 0 0;padding:26px 28px">
      <div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.04em">Gripwell</div>
    </div>
    <div style="background:#fff;border:1px solid #EBEBEB;border-top:none;border-radius:0 0 16px 16px;padding:32px 28px;text-align:center">
      <h1 style="margin:0 0 10px;color:#1A1D23;font-size:22px;line-height:1.25">One click to confirm</h1>
      <p style="margin:0 auto 24px;color:#4B5563;font-size:14px;line-height:1.6;max-width:40ch">
        Confirm your email to start receiving deals before they sell out.
      </p>
      <a href="${esc(confirmUrl)}" style="display:inline-block;background:#FF6A1A;color:#fff;font-weight:800;font-size:15px;letter-spacing:.02em;text-decoration:none;padding:15px 34px;border-radius:12px">
        Confirm subscription
      </a>
      <p style="margin:24px 0 0;color:#B0B0A8;font-size:12px;line-height:1.6">
        Didn't sign up? Ignore this email — you won't be added.
      </p>
    </div>
  </div>
</body></html>`
}

/* ── Warranty / refund claim ────────────────────────────────────────────────
   Two emails per submission: a branded confirmation to the customer, and a
   plain internal notice to staff (the claim itself lives in the Enquiry
   table — same model the admin dashboard's live enquiries feed already
   queries — this email is just so nobody has to be staring at the dashboard
   to catch a time-sensitive claim). */
const WARRANTY_NOTIFY_EMAIL = process.env.WARRANTY_NOTIFY_EMAIL || 'info@gripwell.demo'

export interface WarrantyClaimData {
  claimType:    'warranty' | 'refund'
  name:         string
  email:        string
  phone:        string
  address:      string
  orderNumber?: string
  productName:  string
  tyreCount?:   string
  reason:       string
  receiptUrl:   string
  photoUrls:    string[]
}

export async function sendWarrantyClaimConfirmation(d: WarrantyClaimData): Promise<boolean> {
  if (!d.email) return false
  const label = d.claimType === 'warranty' ? 'warranty claim' : 'refund request'
  return sendEmail({
    to:      d.email,
    subject: `We've received your ${label} — Gripwell`,
    html:    `<!doctype html>
<html><body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#2A2E36;border-radius:16px 16px 0 0;padding:26px 28px">
      <div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.04em">Gripwell</div>
    </div>
    <div style="background:#fff;border:1px solid #EBEBEB;border-top:none;border-radius:0 0 16px 16px;padding:32px 28px">
      <h1 style="margin:0 0 10px;color:#1A1D23;font-size:22px;line-height:1.25">Thanks, ${esc(d.name)} — we've got your ${label}.</h1>
      <p style="margin:0 0 20px;color:#4B5563;font-size:14px;line-height:1.6">Our Customer Support team will review it and get back to you with an outcome within <strong>5 working days</strong>. If a physical inspection is needed, we'll be in touch to arrange it.</p>
      <div style="background:#F5F4EF;border-radius:10px;padding:14px 16px;font-size:13.5px;color:#4B5563;line-height:1.7">
        <div><strong>Product:</strong> ${esc(d.productName)}</div>
        ${d.orderNumber ? `<div><strong>Order:</strong> ${esc(d.orderNumber)}</div>` : ''}
        <div><strong>Details:</strong> ${esc(d.reason)}</div>
      </div>
      <p style="margin:24px 0 0;color:#85908A;font-size:12.5px;line-height:1.6">Questions in the meantime? Reply to this email.</p>
    </div>
  </div>
</body></html>`,
  })
}

export async function sendWarrantyClaimNotification(d: WarrantyClaimData): Promise<boolean> {
  const label = d.claimType === 'warranty' ? 'Warranty claim' : 'Refund request'
  const photos = d.photoUrls.length
    ? d.photoUrls.map(u => `<a href="${esc(SITE_URL + u)}">${esc(SITE_URL + u)}</a>`).join('<br>')
    : '<em>none attached</em>'
  return sendEmail({
    to:      WARRANTY_NOTIFY_EMAIL,
    subject: `${label}: ${d.name} — ${d.productName}`,
    replyTo: d.email,
    html:    `<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1D23">
      <p><strong>${esc(label)}</strong> submitted via the website.</p>
      <p>
        <strong>Name:</strong> ${esc(d.name)}<br>
        <strong>Email:</strong> ${esc(d.email)}<br>
        <strong>Phone:</strong> ${esc(d.phone)}<br>
        <strong>Address:</strong> ${esc(d.address)}<br>
        ${d.orderNumber ? `<strong>Order number:</strong> ${esc(d.orderNumber)}<br>` : ''}
        <strong>Product:</strong> ${esc(d.productName)}<br>
        ${d.tyreCount ? `<strong>Tyres affected:</strong> ${esc(d.tyreCount)}<br>` : ''}
      </p>
      <p><strong>Description:</strong><br>${esc(d.reason)}</p>
      <p><strong>Receipt / proof of purchase:</strong><br><a href="${esc(SITE_URL + d.receiptUrl)}">${esc(SITE_URL + d.receiptUrl)}</a></p>
      <p><strong>Fault photos:</strong><br>${photos}</p>
    </div>`,
  })
}

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}
