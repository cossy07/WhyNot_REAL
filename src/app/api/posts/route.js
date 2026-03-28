import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/posts?lat=&lng=&radius=&tags=&remote=
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat'))
  const lng = parseFloat(searchParams.get('lng'))
  const radiusMiles = parseFloat(searchParams.get('radius') || '10')
  const tagsParam = searchParams.get('tags')
  const remote = searchParams.get('remote') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    const where = {
      isActive: true,
      ...(remote && { isRemote: true }),
      ...(tagsParam && {
        tags: {
          hasSome: tagsParam.split(',').map((t) => t.trim().toLowerCase()),
        },
      }),
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, locationName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Filter by radius if coordinates provided
    let filtered = posts
    if (!isNaN(lat) && !isNaN(lng)) {
      const { filterByRadius } = await import('@/lib/distance')
      filtered = filterByRadius(posts, lat, lng, radiusMiles)
    }

    return NextResponse.json({ posts: filtered })
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts — create a new listing
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, description, tags, exchangeTypes, isRemote, lat, lng, locationName, availability } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description.trim(),
        tags: (tags || []).map((t) => t.toLowerCase().trim()),
        exchangeTypes: exchangeTypes || [],
        isRemote: isRemote || false,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        locationName: locationName || null,
        availability: availability || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
