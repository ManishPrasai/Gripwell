import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
)

export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as {
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