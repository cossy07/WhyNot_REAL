'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import SkillTag from '@/components/SkillTag'
import PublicStats from '@/components/PublicStats'
import PostCard from '@/components/PostCard'
import ReportModal from '@/components/ReportModal'

function formatRelative(date) {
  const diff = Date.now() - new Date(date).getTime()
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return 'Just joined'
  if (months < 13) return `${months} month${months !== 1 ? 's' : ''} ago`
  return 'Over a year ago'
}

export default function ProfilePage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-neutral-charcoal">User not found</p>
      </div>
    )
  }

  const isOwn = session?.user?.id === id
  const completedSessions = (user.sessionsGiven?.length ?? 0) + (user.sessionsReceived?.length ?? 0)
  const stats = {
    sessionsCompleted: completedSessions,
    showUpRate: completedSessions > 0 ? 96 : 100,
    skillsShared: user.posts?.length ?? 0,
    skillsLearned: user.sessionsReceived?.length ?? 0,
    activeSince: formatRelative(user.createdAt),
  }

  const allTags = [...new Set(user.posts?.flatMap((p) => p.tags) ?? [])]
  const activePosts = user.posts?.filter((p) => p.isActive) ?? []

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile card */}
        <div className="card p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary font-bold text-2xl flex items-center justify-center flex-shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-charcoal">{user.name}</h1>
                {user.locationName && (
                  <p className="text-sm text-muted">{user.locationName}</p>
                )}
                {user.isEduVerified && (
                  <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Edu verified
                  </span>
                )}
              </div>
            </div>
            {isOwn ? (
              <Link href="/profile/edit" className="btn-outline text-sm px-4 py-2">
                Edit profile
              </Link>
            ) : (
              <button
                onClick={() => setShowReport(true)}
                className="text-sm text-muted hover:text-red-500 transition"
              >
                Report
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-neutral-charcoal leading-relaxed mb-6">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Activity</p>
            <PublicStats stats={stats} />
          </div>

          {/* Skill tags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <SkillTag key={tag} tag={tag} small />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active listings */}
        {activePosts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-4">Active listings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {activePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {activePosts.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-muted text-sm">No active listings.</p>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal reportedUserId={id} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
