'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/ChatWindow'

export default function ConversationPage() {
  const { conversationId } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conv, setConv] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [showWhatNext, setShowWhatNext] = useState(false)
  const [completedSession, setCompletedSession] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetch(`/api/conversations?id=${conversationId}`)
        .then((r) => r.json())
        .then((data) => {
          setConv(data.conversation)
          setSessions(data.sessions || [])
          setLoading(false)
        })
    }
  }, [conversationId, status, router])

  async function confirmSession(sessionId) {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'confirmed' } : s))
    )
  }

  async function cancelSession(sessionId) {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
    )
  }

  async function completeSession(sess) {
    setCompleting(true)
    await fetch(`/api/sessions/${sess.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    setSessions((prev) =>
      prev.map((s) => (s.id === sess.id ? { ...s, status: 'completed' } : s))
    )
    setCompletedSession(sess)
    setCompleting(false)
    setShowWhatNext(true)
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    )
  }

  if (!conv) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-neutral-charcoal">Conversation not found</p>
      </div>
    )
  }

  const other = conv.user1Id === session?.user?.id ? conv.user2 : conv.user1
  const pendingSession = sessions.find((s) => s.status === 'pending')
  const confirmedSession = sessions.find((s) => s.status === 'confirmed')
  const isProvider =
    (pendingSession?.providerId === session?.user?.id) ||
    (confirmedSession?.providerId === session?.user?.id)

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col py-4 px-4">
        {/* Back link */}
        <Link href="/messages" className="text-sm text-muted hover:text-neutral-charcoal mb-3 block">
          ← Messages
        </Link>

        <div className="card flex-1 flex flex-col overflow-hidden" style={{ minHeight: '60vh' }}>
          <ChatWindow conversationId={conversationId} otherUser={other} />
        </div>

        {/* Session: pending (provider view) */}
        {pendingSession && isProvider && (
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-amber-800">Session requested</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {pendingSession.post?.title}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => confirmSession(pendingSession.id)}
                  className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => cancelSession(pendingSession.id)}
                  className="text-sm px-3 py-2 border border-gray-200 rounded-lg text-muted hover:border-gray-300 transition"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session: pending (requester view) */}
        {pendingSession && !isProvider && (
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-800">Session request sent</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Waiting for {other?.name} to confirm.
            </p>
          </div>
        )}

        {/* Session: confirmed */}
        {confirmedSession && (
          <div className="mt-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-primary">Session confirmed</p>
                <p className="text-xs text-primary-600 mt-0.5">
                  {confirmedSession.post?.title} — Mark complete when done.
                </p>
              </div>
              <button
                onClick={() => completeSession(confirmedSession)}
                disabled={completing}
                className="text-sm px-4 py-2 bg-success text-white rounded-lg hover:opacity-90 transition"
              >
                {completing ? 'Saving...' : 'Mark complete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* What's Next modal */}
      {showWhatNext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-3xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-neutral-charcoal mb-2">Session complete.</h2>
            <p className="text-muted mb-6">What&apos;s next?</p>

            <div className="space-y-3">
              <button
                onClick={() => setShowWhatNext(false)}
                className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
              >
                <p className="font-semibold text-neutral-charcoal group-hover:text-primary">
                  Book again with {other?.name}
                </p>
                <p className="text-sm text-muted mt-0.5">Keep the momentum going</p>
              </button>

              <Link
                href="/browse"
                className="block w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
                onClick={() => setShowWhatNext(false)}
              >
                <p className="font-semibold text-neutral-charcoal group-hover:text-primary">
                  Try a new skill nearby
                </p>
                <p className="text-sm text-muted mt-0.5">Browse what&apos;s available right now</p>
              </Link>

              <Link
                href="/post/new"
                className="block w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
                onClick={() => setShowWhatNext(false)}
              >
                <p className="font-semibold text-neutral-charcoal group-hover:text-primary">
                  Post something you&apos;ve learned
                </p>
                <p className="text-sm text-muted mt-0.5">Share your new skill with someone else</p>
              </Link>
            </div>

            <button
              onClick={() => setShowWhatNext(false)}
              className="mt-6 w-full text-sm text-muted hover:text-neutral-charcoal transition text-center"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
