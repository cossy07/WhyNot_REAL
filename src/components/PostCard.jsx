import Link from 'next/link'
import SkillTag from './SkillTag'

const EXCHANGE_LABELS = {
  money: 'Paid',
  trade: 'Skill trade',
  coffee: 'Coffee',
  free: 'Free',
}

const EXCHANGE_COLORS = {
  money:  'bg-green-50 text-green-700 border-green-200',
  trade:  'bg-accent-50 text-accent-700 border border-accent-200',
  coffee: 'bg-amber-50 text-amber-700 border border-amber-200',
  free:   'bg-primary-50 text-primary-700 border border-primary-100',
}

export default function PostCard({ post, distance }) {
  return (
    <Link href={`/post/${post.id}`}>
      <div className="card p-5 hover:shadow-md hover:border-primary-100 transition-all cursor-pointer h-full flex flex-col">
        {/* User name + distance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
              {post.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm font-medium text-neutral-charcoal">{post.user?.name}</span>
          </div>
          {distance != null && (
            <span className="text-xs text-muted">{distance < 0.1 ? 'Nearby' : `${distance.toFixed(1)} mi`}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-neutral-charcoal mb-2 leading-snug line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <SkillTag key={tag} tag={tag} small />
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted self-center">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Exchange types */}
        {post.exchangeTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-gray-50">
            {post.exchangeTypes.map((type) => (
              <span
                key={type}
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${EXCHANGE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}
              >
                {EXCHANGE_LABELS[type] || type}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
