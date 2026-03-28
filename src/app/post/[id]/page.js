'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SkillTag from '@/components/SkillTag'
import PublicStats from '@/components/PublicStats'
import ReportModal from '@/components/ReportModal'

const EXCHANGE_LABELS = {
  money:  'Paid',
  trade:  'Skill trade',
  coffee: 'Buy me a coffee',
  free:   'Free',
}

function computeStats(user) {
  const given = user.sessionsGiven?.length ?? 0
  const received = user.sessionsReceived?.length ?? 0
  const total = given + received
  const activeSince = user.createdAt
    ? formatRelative(new Date(user.createdAt))
    : 'Recently'

  return {
    sessionsCompleted: total,
    showUpRate: total > 0 ? 96 : 100, // placeholder — real calc needs cancelled data
    skillsShared: user.posts?.length ?? 0,
    skillsLearned: received,
    activeSince,
  }
}

function formatRelative(date) {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 13) return `${months} month${months !== 1 ? 's' : ''} ago`
  return `over a year ago`
}

export default function PostDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data.post)
        setLoading(false)
      })
  }, [id])

  async function handleRequestSession() {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/post/${id}`)
      return
    }
    if (!message.trim()) {
      alert('Send a quick intro message to get started.')
      return
    }
    setRequesting(true)

    // Create or get conversation, then create session request
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id, introMessage: message }),
    })

    const data = await res.json()
    if (res.ok) {
      router.push(`/messages/${data.conversationId}`)
    } else {
      alert(data.error || 'Something went wrong')
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="font-semibold text-neutral-charcoal">Listing not found</p>
          <Link href="/browse" className="text-primary text-sm hover:underline mt-2 block">Back to browse</Link>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === post.userId
  const stats = post.user ? computeStats(post.user) : null

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/browse" className="text-sm text-muted hover:text-neutral-charcoal mb-6 block">
          ← Back to browse
        </Link>

        <div className="card p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-charcoal leading-tight mb-1">{post.title}</h1>
              {post.locationName && (
                <p className="text-sm text-muted">{post.locationName}</p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  href={`/post/${post.id}/edit`}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-muted hover:border-gray-300 transition"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-neutral-charcoal leading-relaxed whitespace-pre-wrap mb-6">{post.description}</p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <SkillTag key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Exchange */}
          {post.exchangeTypes?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Exchange options</p>
              <div className="flex flex-wrap gap-2">
                {post.exchangeTypes.map((type) => (
                  <span
                    key={type}
                    className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-lg border border-primary-100"
                  >
                    {EXCHANGE_LABELS[type] || type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {post.availability && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Availability</p>
              <p className="text-sm text-neutral-charcoal">{post.availability}</p>
            </div>
          )}

          {/* Request session */}
          {!isOwner && (
            <div className="border-t border-gray-100 pt-6 mt-2">
              <p className="text-sm font-medium text-neutral-charcoal mb-2">Interested? Send a message to get started.</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Hi! I'd love to learn... I'm available..."
                className="input mb-3 resize-none text-sm"
              />
              <button
                onClick={handleRequestSession}
                disabled={requesting}
                className="w-full btn-accent py-3 text-base font-bold"
              >
                {requesting ? 'Sending...' : 'Request a session'}
              </button>
            </div>
          )}
        </div>

        {/* About the teacher */}
        {post.user && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary font-bold text-lg flex items-center justify-center">
                {post.user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <Link
                  href={`/profile/${post.user.id}`}
                  className="font-bold text-neutral-charcoal hover:text-primary transition"
                >
                  {post.user.name}
                </Link>
                {post.user.locationName && (
                  <p className="text-xs text-muted">{post.user.locationName}</p>
                )}
              </div>
            </div>

            {post.user.bio && (
              <p className="text-sm text-muted leading-relaxed mb-4">{post.user.bio}</p>
            )}

            {stats && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Activity</p>
                <PublicStats stats={stats} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href={`/profile/${post.user.id}`}
                className="text-sm text-primary font-medium hover:underline"
              >
                View full profile
              </Link>
              <span className="text-muted">·</span>
              <button
                onClick={() => setShowReport(true)}
                className="text-sm text-muted hover:text-red-500 transition"
              >
                Report
              </button>
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal
          reportedUserId={post.userId}
          reportedPostId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
