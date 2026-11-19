/**
 * Thin nodemailer wrapper for admin security alerts.
 *
 * Required env vars (add to .env.local):
 *   SMTP_HOST      â" e.g. smtp.gmail.com
 *   SMTP_PORT      â" 587 (TLS) or 465 (SSL)
 *   SMTP_USER      â" your Gmail / SMTP username
 *   SMTP_PASS      â" Gmail App Password (not your account password)
 *   ADMIN_ALERT_EMAIL â" address that receives security alerts
 *
 * For Gmail: enable 2FA â†' Google Account â†' Security â†' App Passwords,
 * create a "Mail" app password and paste it as SMTP_PASS.
 *
 * If any env var is missing, the function logs to console and returns
 * gracefully â" a missing SMTP config must never break the auth flow.
 */
// nodemailer is large and pulls in a lot of Node built-ins. It's only needed on
// the rare lockout path, so load it lazily â" a static import would evaluate it on
// every isolate startup and inflate the worker's memory baseline (which tips the
// admin worker over the Workers memory limit under load).
async function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  const nodemailer = (await import('nodemailer')).default
  return nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export async function sendLoginLockoutAlert({
  ip,
  attemptedEmail,
  lockedUntil,
}: {
  ip:             string
  attemptedEmail: string
  lockedUntil:    Date
}) {
  const alertTo = process.env.ADMIN_ALERT_EMAIL
  if (!alertTo) {
    console.warn('[security] ADMIN_ALERT_EMAIL not set â" lockout alert not sent')
    return
  }

  const transport = await createTransport()
  if (!transport) {
    console.warn('[security] SMTP not configured â" lockout alert not sent')
    return
  }

  const time = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })
  const until = lockedUntil.toLocaleString('en-GB', { timeZone: 'Europe/London' })

  try {
    await transport.sendMail({
      from:    `"Gripwell Security" <${process.env.SMTP_USER}>`,
      to:      alertTo,
      subject: 'âš ï¸ Admin login lockout triggered â" Gripwell Console',
      text: [
        'A login lockout has been triggered on the Gripwell admin console.',
        '',
        `Time:             ${time} AEST`,
        `IP address:       ${ip}`,
        `Email attempted:  ${attemptedEmail}`,
        `Locked until:     ${until} AEST`,
        '',
        'The IP has been blocked for 15 minutes.',
        'If this was not you, consider changing your admin password immediately.',
        '',
        'â" Gripwell Security',
      ].join('\n'),
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;color:#111">
          <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <strong style="color:#856404">âš ï¸ Admin login lockout triggered</strong>
          </div>
          <p>An IP address has been <strong>blocked</strong> from the Gripwell admin console after exceeding 5 login attempts in 15 minutes.</p>
          <table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px">
            <tr><td style="padding:8px 14px;background:#f8f9fa;border-radius:6px 0 0 6px;color:#555;white-space:nowrap">Time</td><td style="padding:8px 14px;font-weight:600">${time} AEST</td></tr>
            <tr><td style="padding:8px 14px;background:#f8f9fa;border-radius:6px 0 0 6px;color:#555;white-space:nowrap">IP address</td><td style="padding:8px 14px;font-weight:600;font-family:monospace">${ip}</td></tr>
            <tr><td style="padding:8px 14px;background:#f8f9fa;border-radius:6px 0 0 6px;color:#555;white-space:nowrap">Email attempted</td><td style="padding:8px 14px;font-weight:600">${attemptedEmail}</td></tr>
            <tr><td style="padding:8px 14px;background:#f8f9fa;border-radius:6px 0 0 6px;color:#555;white-space:nowrap">Locked until</td><td style="padding:8px 14px;font-weight:600">${until} AEST</td></tr>
          </table>
          <p style="font-size:13px;color:#666">If this was not you, change your admin password immediately and review your server access logs.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="font-size:12px;color:#999">Gripwell Security · automated alert</p>
        </div>
      `,
    })
  } catch (err) {
    // Never let email failure crash the auth flow
    console.error('[security] Failed to send lockout alert:', err)
  }
}
