/**
 * GET /api/newsletter/confirm?token=...
 *
 * Clicked from the confirmation email, so it returns an actual page rather
 * than JSON — there's no separate app/ route for this, a self-contained HTML
 * response is the whole feature for what's otherwise a one-time landing.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { SITE_URL } from '../../../../lib/site'

function page(title: string, body: string): NextResponse {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${title} — Nova Tyres</title></head>
<body style="margin:0;background:#FAF9F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px">
  <div style="max-width:440px;text-align:center;background:#fff;border:1px solid #EBEBEB;border-radius:16px;padding:40px 32px">
    <div style="color:#076330;font-weight:800;font-size:16px;letter-spacing:.04em;margin-bottom:18px">NOVA TYRES</div>
    <h1 style="margin:0 0 10px;color:#16211B;font-size:22px">${title}</h1>
    <p style="margin:0 0 24px;color:#47554D;font-size:14px;line-height:1.6">${body}</p>
    <a href="${SITE_URL}" style="display:inline-block;background:#076330;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px">Back to Nova Tyres</a>
  </div>
</body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || ''

  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { token } })

    if (!subscriber) {
      return page('Link not valid', 'This confirmation link is invalid or has already been used.')
    }

    if (!subscriber.confirmed) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { confirmed: true, confirmedAt: new Date() },
      })
    }

    return page("You're on the list!", "Thanks for confirming — you'll hear from us with deals before they sell out.")
  } catch (error) {
    console.error('[newsletter/confirm] error:', error)
    return page('Something went wrong', 'Please try again, or contact us if the problem continues.')
  }
}
