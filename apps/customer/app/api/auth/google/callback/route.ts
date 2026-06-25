import { NextRequest, NextResponse } from 'next/server'
import { prisma, generateAccessToken, generateRefreshToken, hashRefreshToken } from '@nova/database'

export async function GET(req: NextRequest) {
  const loginUrl = new URL('/login', req.url)

  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
      loginUrl.searchParams.set('error', 'Missing authorization code from Google')
      return NextResponse.redirect(loginUrl)
    }

    const clientId     = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri  = process.env.GOOGLE_REDIRECT_URI!

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      loginUrl.searchParams.set('error', 'Failed to exchange Google authorization code')
      return NextResponse.redirect(loginUrl)
    }

    const tokenData = await tokenRes.json()
    const idToken = tokenData.id_token as string | undefined

    if (!idToken) {
      loginUrl.searchParams.set('error', 'Google did not return an identity token')
      return NextResponse.redirect(loginUrl)
    }

    // Decode the JWT payload (Google signs it — we trust the data since we just
    // fetched it directly from Google's token endpoint over HTTPS)
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64url').toString()
    ) as {
      email:          string
      email_verified: boolean
      name?:          string
      given_name?:    string
      family_name?:   string
      picture?:       string
      sub:            string
    }

    if (!payload.email) {
      loginUrl.searchParams.set('error', 'Google account has no email address')
      return NextResponse.redirect(loginUrl)
    }

    const email = payload.email.toLowerCase()

    // Find or create customer — mirrors the pattern in /api/auth/register
    let customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, isVerified: true, isActive: true },
    })

    if (customer && !customer.isActive) {
      loginUrl.searchParams.set('error', 'This account has been deactivated')
      return NextResponse.redirect(loginUrl)
    }

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName:    payload.given_name  ?? payload.name?.split(' ')[0] ?? 'Google',
          lastName:     payload.family_name ?? payload.name?.split(' ').slice(1).join(' ') ?? 'User',
          email,
          passwordHash: 'oauth:google',
          isVerified:   payload.email_verified ?? false,
          isActive:     true,
        },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, isVerified: true, isActive: true },
      })
    }

    // Generate tokens — same logic as /api/auth/login
    const accessToken    = generateAccessToken({ id: customer.id, email: customer.email, type: 'customer' })
    const refreshToken     = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)

    const userAgent = req.headers.get('user-agent') ?? ''
    const ipAddress = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

    await prisma.customerSession.create({
      data: {
        customerId:     customer.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        deviceType:     userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive:       true,
        lastUsedAt:     new Date(),
        expiresAt:      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.loginAttempt.create({
      data: { email, ipAddress, success: true, failReason: null },
    })

    // Redirect to home with the same cookie the native login sets
    const response = NextResponse.redirect(new URL('/', req.url))

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    })

    return response
  } catch (err) {
    console.error('[google-oauth]', err)
    loginUrl.searchParams.set('error', 'Something went wrong during Google sign-in')
    return NextResponse.redirect(loginUrl)
  }
}
