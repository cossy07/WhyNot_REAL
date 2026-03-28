'use client'

import { useRouter } from 'next/navigation'

export default function WhatNextPrompt({ session, onDismiss }) {
  const router = useRouter()
  const otherUserId = session.providerId === session.currentUserId
    ? session.requesterId
    : session.providerId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-surface rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-charcoal mb-2">Session complete.</h2>
        <p className="text-muted mb-6">What&apos;s next?</p>

        <div className="space-y-3">
          {session.conversationId && (
            <button
              onClick={() => router.push(`/messages/${session.conversationId}`)}
              className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
            >
              <p className="font-semibold text-neutral-charcoal group-hover:text-primary">Book again with {session.otherName}</p>
              <p className="text-sm text-muted mt-0.5">Keep the momentum going</p>
            </button>
          )}

          <button
            onClick={() => router.push('/browse')}
            className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
          >
            <p className="font-semibold text-neutral-charcoal group-hover:text-primary">Try a new skill nearby</p>
            <p className="text-sm text-muted mt-0.5">Browse what&apos;s available right now</p>
          </button>

          <button
            onClick={() => router.push('/post/new')}
            className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary-50 transition group"
          >
            <p className="font-semibold text-neutral-charcoal group-hover:text-primary">Post something you&apos;ve learned</p>
            <p className="text-sm text-muted mt-0.5">Share your new skill with someone else</p>
          </button>
        </div>

        <button
          onClick={onDismiss}
          className="mt-6 w-full text-sm text-muted hover:text-neutral-charcoal transition text-center"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
