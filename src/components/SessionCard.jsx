import Link from 'next/link'

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function SessionCard({ session, currentUserId }) {
  const isProvider = session.providerId === currentUserId
  const otherPerson = isProvider ? session.requester : session.provider

  return (
    <div className="card p-5 flex items-start gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
        {otherPerson?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-neutral-charcoal text-sm">{otherPerson?.name}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[session.status] || ''}`}>
            {session.status}
          </span>
        </div>

        <p className="text-sm text-muted line-clamp-1 mb-2">
          {isProvider ? 'Teaching' : 'Learning'}: {session.post?.title}
        </p>

        {session.exchangeAgreed && (
          <p className="text-xs text-muted mb-2">
            Exchange: {session.exchangeAgreed}
          </p>
        )}

        {session.scheduledAt && (
          <p className="text-xs text-muted">
            {new Date(session.scheduledAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {session.conversationId && (
        <Link
          href={`/messages/${session.conversationId}`}
          className="flex-shrink-0 text-sm font-medium text-primary hover:underline"
        >
          Message
        </Link>
      )}
    </div>
  )
}
