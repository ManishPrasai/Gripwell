import { NextRequest, NextResponse } from 'next/server'
import {
  prisma,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check rate limiting — 5 failed attempts in 15 minutes
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
        { error: 'Too many failed attempts. Try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // Find admin
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: { store: true }
    })

    if (!admin || !admin.isActive) {
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
    const passwordValid = await verifyPassword(password, admin.passwordHash)

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
      id: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
      storeId: admin.storeId || undefined
    })

    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const userAgent = req.headers.get('user-agent') || ''

    // Create session
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })

    // Log attempt
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
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        storeId: admin.storeId,
        store: admin.store
      }
    })

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    }

    // Access token in httpOnly cookie — JS cannot read or steal it
    response.cookies.set('admin_access_token', accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60,               // 15 minutes
    })

    response.cookies.set('admin_refresh_token', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60,     // 7 days
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}