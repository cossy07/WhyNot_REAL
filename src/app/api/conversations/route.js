import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/conversations — list my conversations, or ?id=X to get one
export async function GET(request) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      // Single conversation with sessions
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          user1: { select: { id: true, name: true, avatarUrl: true } },
          user2: { select: { id: true, name: true, avatarUrl: true } },
        },
      })

      if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      if (conversation.user1Id !== authSession.user.id && conversation.user2Id !== authSession.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const sessions = await prisma.session.findMany({
        where: { conversationId: id },
        include: {
          post: { select: { id: true, title: true } },
          provider: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ conversation, sessions })
    }

    // List all conversations for current user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: authSession.user.id }, { user2Id: authSession.user.id }],
      },
      include: {
        user1: { select: { id: true, name: true, avatarUrl: true } },
        user2: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('GET /api/conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
