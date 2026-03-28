'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SessionCard from '@/components/SessionCard'
import PostCard from '@/components/PostCard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/sessions').then((r) => r.json()),
        fetch(`/api/users/${session.user.id}`).then((r) => r.json()),
      ]).then(([sessData, userData]) => {
        setSessions(sessData.sessions || [])
        setPosts(userData.user?.posts || [])
        setLoading(false)
      })
    }
  }, [status, session, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    )
  }

  const upcoming = sessions.filter((s) => ['pending', 'confirmed'].includes(s.status))
  const history = sessions.filter((s) => ['completed', 'cancelled'].includes(s.status))
  const activePosts = posts.filter((p) => p.isActive)

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-charcoal">Dashboard</h1>
            <p className="text-muted text-sm mt-0.5">
              Welcome back, {session?.user?.name?.split(' ')[0]}
            </p>
          </div>
          <Link href="/post/new" className="btn-accent text-sm px-5 py-2.5">
            + Post a skill
          </Link>
        </div>

        {/* Upcoming sessions */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-neutral-charcoal mb-4">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-muted text-sm">No upcoming sessions.</p>
              <Link
                href="/browse"
                className="text-primary text-sm font-medium hover:underline mt-2 block"
              >
                Browse skills to get started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <SessionCard key={s.id} session={s} currentUserId={session.user.id} />
              ))}
            </div>
          )}
        </section>

        {/* My active listings */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-charcoal">My listings</h2>
            <Link href="/post/new" className="text-sm text-primary font-medium hover:underline">
              + Add listing
            </Link>
          </div>
          {activePosts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-muted text-sm">No active listings yet.</p>
              <Link
                href="/post/new"
                className="text-primary text-sm font-medium hover:underline mt-2 block"
              >
                Post your first skill
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activePosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={{ ...p, user: { name: session.user.name, id: session.user.id } }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Session history */}
        {history.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-4">Session history</h2>
            <div className="space-y-3">
              {history.slice(0, 10).map((s) => (
                <SessionCard key={s.id} session={s} currentUserId={session.user.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
