import { NextRequest, NextResponse } from 'next/server'
import {
  prisma,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('admin_refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const refreshTokenHash = hashRefreshToken(refreshToken)

    const session = await prisma.adminSession.findFirst({
      where: {
        refreshTokenHash,
        isActive: true,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
            storeId: true,
            isActive: true
          }
        }
      }
    })

    if (!session || !session.admin.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const newAccessToken = generateAccessToken({
      id: session.admin.id,
      email: session.admin.email,
      type: 'admin',
      role: session.admin.role,
      storeId: session.admin.storeId || undefined
    })

    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken)

    // Rotate refresh token
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { isActive: false, revokedAt: new Date() }
    })

    await prisma.adminSession.create({
      data: {
        adminId: session.admin.id,
        refreshTokenHash: newRefreshTokenHash,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        deviceType: session.deviceType,
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const response = NextResponse.json({ success: true })

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    }

    response.cookies.set('admin_access_token', newAccessToken, {
      ...cookieOpts,
      maxAge: 15 * 60,
    })

    response.cookies.set('admin_refresh_token', newRefreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60,
    })

    return response

  } catch (error) {
    console.error('Admin refresh error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}