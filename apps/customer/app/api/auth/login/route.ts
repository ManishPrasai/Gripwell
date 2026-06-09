import { NextRequest, NextResponse } from 'next/server'
import { prisma, verifyPassword, generateAccessToken, generateRefreshToken, hashRefreshToken } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const ipAddress = req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'unknown'

    // Validate fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check rate limiting â€” max 5 failed attempts in 15 minutes
    const recentFailedAttempts = await prisma.loginAttempt.count({
      where: {
        email: email.toLowerCase(),
        success: false,
        attemptedAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000)
        }
      }
    })

    if (recentFailedAttempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!customer || !customer.isActive) {
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress,
          success: false,
          failReason: 'account_not_found'
        }
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, customer.passwordHash)

    if (!passwordValid) {
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress,
          success: false,
          failReason: 'wrong_password'
        }
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
      type: 'customer'
    })

    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)

    const userAgent = req.headers.get('user-agent') || ''

    // Create session
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Log successful attempt
    await prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        ipAddress,
        success: true,
        failReason: null
      }
    })

    const response = NextResponse.json({
      success: true,
      accessToken,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        isVerified: customer.isVerified
      }
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}