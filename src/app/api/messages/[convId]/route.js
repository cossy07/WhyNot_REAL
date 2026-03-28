import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/[convId]
export async function GET(request, { params }) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.convId },
    })

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (conversation.user1Id !== authSession.user.id && conversation.user2Id !== authSession.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.convId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.convId,
        senderId: { not: authSession.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('GET /api/messages/[convId] error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages/[convId]
export async function POST(request, { params }) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.convId },
    })

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (conversation.user1Id !== authSession.user.id && conversation.user2Id !== authSession.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { content } = await request.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

    const message = await prisma.message.create({
      data: {
        conversationId: params.convId,
        senderId: authSession.user.id,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: params.convId },
      data: { updatedAt: new Date() },
    })

    // Broadcast via Socket.io
    if (global.io) {
      global.io.to(`conversation:${params.convId}`).emit('new_message', {
        ...message,
        conversationId: params.convId,
      })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages/[convId] error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
