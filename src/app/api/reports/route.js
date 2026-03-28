import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { reportedUserId, reportedPostId, reason } = await request.json()

    if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    if (!reportedUserId && !reportedPostId) {
      return NextResponse.json({ error: 'Must provide reportedUserId or reportedPostId' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: authSession.user.id,
        reportedUserId: reportedUserId || null,
        reportedPostId: reportedPostId || null,
        reason,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reports error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
