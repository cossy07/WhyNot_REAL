import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/sessions — my sessions
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ providerId: session.user.id }, { requesterId: session.user.id }],
      },
      include: {
        post: { select: { id: true, title: true } },
        provider: { select: { id: true, name: true, avatarUrl: true } },
        requester: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GET /api/sessions error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST /api/sessions — request a session (creates conversation + session)
export async function POST(request) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { postId, introMessage } = await request.json()

    if (!postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 })

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    })

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.userId === authSession.user.id) {
      return NextResponse.json({ error: 'Cannot request a session on your own listing' }, { status: 400 })
    }

    // Check monthly limit (8 in-person sessions per month, free tier)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthlyCount = await prisma.session.count({
      where: {
        requesterId: authSession.user.id,
        createdAt: { gte: monthStart },
        status: { not: 'cancelled' },
      },
    })
    if (monthlyCount >= 8) {
      return NextResponse.json(
        { error: 'You have reached the 8 in-person sessions limit for this month. WhyNot Plus removes this limit.' },
        { status: 429 }
      )
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: authSession.user.id, user2Id: post.userId },
          { user1Id: post.userId, user2Id: authSession.user.id },
        ],
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: authSession.user.id,
          user2Id: post.userId,
        },
      })
    }

    // Create the session request
    const sessionRequest = await prisma.session.create({
      data: {
        postId,
        providerId: post.userId,
        requesterId: authSession.user.id,
        conversationId: conversation.id,
        status: 'pending',
      },
    })

    // Send intro message if provided
    if (introMessage?.trim()) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: authSession.user.id,
          content: introMessage.trim(),
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      })

      // Broadcast via Socket.io
      if (global.io) {
        global.io.to(`conversation:${conversation.id}`).emit('new_message', {
          ...message,
          conversationId: conversation.id,
        })
        global.io.to(`user:${post.userId}`).emit('new_conversation', {
          conversationId: conversation.id,
        })
      }
    }

    return NextResponse.json({
      session: sessionRequest,
      conversationId: conversation.id,
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sessions error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
