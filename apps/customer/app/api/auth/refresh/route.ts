import { NextRequest, NextResponse } from 'next/server'
import { prisma, generateAccessToken, generateRefreshToken, hashRefreshToken } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const refreshTokenHash = hashRefreshToken(refreshToken)

    // Find valid session
    const session = await prisma.customerSession.findFirst({
      where: {
        refreshTokenHash,
        isActive: true,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      }
    })

    if (!session || !session.customer.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      id: session.customer.id,
      email: session.customer.email,
      type: 'customer'
    })

    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken)

    // Rotate refresh token — invalidate old, create new
    await prisma.customerSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        revokedAt: new Date()
      }
    })

    await prisma.customerSession.create({
      data: {
        customerId: session.customer.id,
        refreshTokenHash: newRefreshTokenHash,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        deviceType: session.deviceType,
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken
    })

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}