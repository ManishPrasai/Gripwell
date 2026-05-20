import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// ─────────────────────────────────────
// PASSWORD
// ─────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

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
    expiresIn: '15m'
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