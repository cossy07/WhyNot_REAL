import clsx from 'clsx'

export default function SkillTag({ tag, small = false, onClick }) {
  return (
    <span
      onClick={onClick}
      className={clsx(
        'inline-flex items-center rounded-lg font-medium bg-primary-50 text-primary-700 border border-primary-100 transition-colors',
        small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        onClick && 'cursor-pointer hover:bg-primary-100'
      )}
    >
      {tag}
    </span>
  )
}
