import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        locationName: true,
        isEduVerified: true,
        createdAt: true,
        posts: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        sessionsGiven: {
          where: { status: 'completed' },
          select: { id: true },
        },
        sessionsReceived: {
          where: { status: 'completed' },
          select: { id: true },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (authSession.user.id !== params.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { name, bio, locationName, locationLat, locationLng } = await request.json()

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(locationName !== undefined && { locationName }),
        ...(locationLat !== undefined && { locationLat }),
        ...(locationLng !== undefined && { locationLng }),
      },
      select: { id: true, name: true, bio: true, locationName: true, avatarUrl: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
