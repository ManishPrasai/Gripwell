import { NextRequest, NextResponse } from 'next/server'
import { prisma, hashRefreshToken } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('admin_refresh_token')?.value

    if (refreshToken) {
      const refreshTokenHash = hashRefreshToken(refreshToken)

      await prisma.adminSession.updateMany({
        where: { refreshTokenHash },
        data: {
          isActive: false,
          revokedAt: new Date()
        }
      })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}