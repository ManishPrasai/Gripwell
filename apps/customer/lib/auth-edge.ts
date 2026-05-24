import jwt from 'jsonwebtoken'

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