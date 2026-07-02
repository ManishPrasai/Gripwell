/**
 * TOTP helpers for admin MFA.
 *
 * Secret encryption: AES-256-GCM with TOTP_ENCRYPTION_KEY (32 hex bytes).
 * The plaintext TOTP secret never touches the DB — only the IV+ciphertext blob.
 *
 * Recovery codes: 8 × 8-char alphanumeric codes, stored as SHA-256 hashes.
 * Plaintext is shown once at enrolment and never retrievable again.
 *
 * Temp token: short-lived JWT (2 min) issued after password verification but
 * before TOTP — lets the frontend show the 6-digit prompt without issuing a
 * full session.
 */
import * as OTPAuth from 'otpauth'
import * as crypto  from 'crypto'
import * as jwt     from 'jsonwebtoken'

/* ── Encryption ──────────────────────────────────────────────────────────── */

function getEncKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY
  if (!hex || hex.length < 64) {
    throw new Error('TOTP_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

export function encryptSecret(plaintext: string): string {
  const iv  = crypto.randomBytes(12)
  const key = getEncKey()
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc  = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag  = cipher.getAuthTag()
  // format: iv(12) + tag(16) + ciphertext  → base64
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptSecret(blob: string): string {
  const buf  = Buffer.from(blob, 'base64')
  const iv   = buf.slice(0, 12)
  const tag  = buf.slice(12, 28)
  const enc  = buf.slice(28)
  const key  = getEncKey()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(enc) + decipher.final('utf8')
}

/* ── TOTP generation & verification ──────────────────────────────────────── */

const ISSUER = 'Nova Tyres Admin'

export function generateTotpSecret(): { secret: string; uri: string } {
  const totp = new OTPAuth.TOTP({
    issuer:    ISSUER,
    algorithm: 'SHA1',
    digits:    6,
    period:    30,
    secret:    new OTPAuth.Secret({ size: 20 }),
  })
  return {
    secret: totp.secret.base32,
    uri:    totp.toString(),          // otpauth:// URI for QR code
  }
}

export function verifyTotpCode(encryptedSecret: string, code: string): boolean {
  try {
    const plainSecret = decryptSecret(encryptedSecret)
    const totp = new OTPAuth.TOTP({
      issuer:    ISSUER,
      algorithm: 'SHA1',
      digits:    6,
      period:    30,
      secret:    OTPAuth.Secret.fromBase32(plainSecret),   // fromBase32 exists ✓
    })
    // window: 1 = allow ±30 sec clock drift
    const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 1 })
    return delta !== null
  } catch {
    return false
  }
}

/* ── Recovery codes ──────────────────────────────────────────────────────── */

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'   // no 0/O/I/1 confusion

function randomCode(): string {
  const bytes = crypto.randomBytes(8)
  return Array.from(bytes)
    .map(b => CODE_CHARS[b % CODE_CHARS.length])
    .join('')
    .replace(/(.{4})(.{4})/, '$1-$2')   // format: XXXX-XXXX
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.toUpperCase().replace(/-/g, '')).digest('hex')
}

export function generateRecoveryCodes(): { plaintext: string[]; hashes: string[] } {
  const plaintext = Array.from({ length: 8 }, randomCode)
  const hashes    = plaintext.map(hashRecoveryCode)
  return { plaintext, hashes }
}

/* ── Temp "TOTP pending" token ───────────────────────────────────────────── */

export interface TotpPendingPayload {
  type:    'totp_pending'
  adminId: string
  email:   string
}

export function signTotpPendingToken(adminId: string, email: string): string {
  return jwt.sign(
    { type: 'totp_pending', adminId, email } as TotpPendingPayload,
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '2m' }     // 2-minute window to enter the 6-digit code
  )
}

export function verifyTotpPendingToken(token: string): TotpPendingPayload | null {
  try {
    const p = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
    if (p?.type !== 'totp_pending') return null
    return p
  } catch {
    return null
  }
}
