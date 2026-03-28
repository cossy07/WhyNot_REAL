'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/conversations')
        .then((r) => r.json())
        .then((data) => {
          setConversations(data.conversations || [])
          setLoading(false)
        })
    }
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-neutral-charcoal mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-semibold text-neutral-charcoal mb-2">No conversations yet</p>
            <p className="text-sm text-muted mb-6">
              Request a session on any listing to start chatting.
            </p>
            <Link href="/browse" className="btn-primary text-sm px-6 py-2.5">
              Browse skills
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const other =
                conv.user1Id === session?.user?.id ? conv.user2 : conv.user1
              const lastMsg = conv.messages?.[0]

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="card p-4 flex items-center gap-4 hover:border-primary-100 hover:shadow-md transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {other?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-charcoal text-sm">{other?.name}</p>
                      {lastMsg && (
                        <p className="text-xs text-muted truncate mt-0.5">{lastMsg.content}</p>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-xs text-muted flex-shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
