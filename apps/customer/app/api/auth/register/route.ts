import { NextRequest, NextResponse } from 'next/server'
import { prisma, hashPassword, generateAccessToken, generateRefreshToken, hashRefreshToken } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        isVerified: false,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true
      }
    })

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
      type: 'customer'
    })

    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)

    // Get device info
    const userAgent = req.headers.get('user-agent') || ''
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'

    // Save session
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Log login attempt
    await prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        ipAddress,
        success: true,
        failReason: null
      }
    })

    // Set response with cookies
    const response = NextResponse.json({
      success: true,
      customer,
      accessToken
    }, { status: 201 })

    // Set refresh token as httpOnly cookie
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}