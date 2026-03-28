import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            locationName: true,
            createdAt: true,
            sessionsGiven: { where: { status: 'completed' } },
            sessionsReceived: { where: { status: 'completed' } },
            posts: { where: { isActive: true }, select: { id: true } },
          },
        },
      },
    })

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (post.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.tags && { tags: body.tags }),
        ...(body.exchangeTypes && { exchangeTypes: body.exchangeTypes }),
        ...(body.isRemote !== undefined && { isRemote: body.isRemote }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.availability && { availability: body.availability }),
      },
    })

    return NextResponse.json({ post: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (post.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.post.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
