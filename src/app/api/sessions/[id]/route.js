import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/sessions/[id] — update session status
export async function PATCH(request, { params }) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
    })

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isProvider = session.providerId === authSession.user.id
    const isRequester = session.requesterId === authSession.user.id

    if (!isProvider && !isRequester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, exchangeAgreed, scheduledAt } = body

    // Validate status transitions
    const allowed = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }

    if (status && !allowed[session.status]?.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${session.status} to ${status}` }, { status: 400 })
    }

    // Only provider can confirm/decline; either can cancel
    if (status === 'confirmed' && !isProvider) {
      return NextResponse.json({ error: 'Only the provider can confirm a session' }, { status: 403 })
    }

    const updated = await prisma.session.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(exchangeAgreed !== undefined && { exchangeAgreed }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      },
    })

    // Notify other party
    if (global.io && session.conversationId) {
      const notifyUserId = isProvider ? session.requesterId : session.providerId
      global.io.to(`user:${notifyUserId}`).emit('session_updated', { session: updated })
    }

    return NextResponse.json({ session: updated })
  } catch (error) {
    console.error('PATCH /api/sessions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
