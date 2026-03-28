import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { blockedId } = await request.json()
    if (!blockedId) return NextResponse.json({ error: 'blockedId required' }, { status: 400 })
    if (blockedId === authSession.user.id) return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })

    const block = await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: authSession.user.id, blockedId } },
      update: {},
      create: { blockerId: authSession.user.id, blockedId },
    })

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error('POST /api/blocks error:', error)
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { blockedId } = await request.json()
    await prisma.block.deleteMany({
      where: { blockerId: authSession.user.id, blockedId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unblock' }, { status: 500 })
  }
}
