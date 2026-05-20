import { NextRequest, NextResponse } from 'next/server'
import { prisma, verifyAccessToken } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyAccessToken(token)

    if (!payload || payload.type !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
        lastLoginAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            suburb: true,
            state: true
          }
        }
      }
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ admin })

  } catch (error) {
    console.error('Admin me error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}