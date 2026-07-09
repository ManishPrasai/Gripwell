import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// ─────────────────────────────────────
// PASSWORD
//
// Hashing uses PBKDF2 via the Web Crypto API (crypto.subtle). Unlike bcryptjs
// (pure-JS), PBKDF2 runs in native code, so it's fast and doesn't bloat the JS
// heap — bcryptjs at cost 12 exhausts Cloudflare Workers' per-isolate resource
// limits and crashes the isolate after a few logins. Legacy bcrypt hashes
// (prefix "$2") are still verified for backward compatibility and can be
// transparently upgraded to PBKDF2 on the next successful login (needsRehash).
// ─────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEYLEN     = 32          // bytes
const PBKDF2_PREFIX     = 'pbkdf2'

const webcrypto: Crypto = (globalThis as any).crypto ?? (crypto as any).webcrypto

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += b.toString(16).padStart(2, '0')
  return s
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as any, iterations, hash: 'SHA-256' },
    key,
    PBKDF2_KEYLEN * 8,
  )
  return toHex(bits)
}

/** Constant-time string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${toHex(salt)}$${hash}`
}

export const verifyPassword = async (
  password: string,
  stored: string
): Promise<boolean> => {
  if (stored.startsWith(`${PBKDF2_PREFIX}$`)) {
    const [, iterStr, saltHex, hashHex] = stored.split('$')
    const iterations = parseInt(iterStr, 10)
    if (!iterations || !saltHex || !hashHex) return false
    const computed = await pbkdf2(password, fromHex(saltHex), iterations)
    return timingSafeEqual(computed, hashHex)
  }
  // Legacy bcrypt hash — still supported, upgraded on next login via needsRehash.
  return bcrypt.compare(password, stored)
}

/** True if the stored hash is a legacy bcrypt hash that should be re-hashed. */
export const needsRehash = (stored: string): boolean =>
  !stored.startsWith(`${PBKDF2_PREFIX}$`)

// ─────────────────────────────────────
// TOKENS
// ─────────────────────────────────────

export const generateAccessToken = (payload: {
  id: string
  email: string
  type: 'customer' | 'admin'
  role?: string
  storeId?: string
}): string => {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
    expiresIn: '30m'
  })
}

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex')
}

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string
      email: string
      type: 'customer' | 'admin'
      role?: string
      storeId?: string
    }
  } catch {
    return null
  }
}