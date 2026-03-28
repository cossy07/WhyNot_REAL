export default function PublicStats({ stats }) {
  const items = [
    { label: 'Sessions completed', value: stats.sessionsCompleted ?? 0 },
    { label: 'Show-up rate', value: `${stats.showUpRate ?? 100}%` },
    { label: 'Skills shared', value: stats.skillsShared ?? 0 },
    { label: 'Skills learned', value: stats.skillsLearned ?? 0 },
    { label: 'Active since', value: stats.activeSince ?? 'Just joined' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ label, value }) => (
        <div key={label} className="bg-bg rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-primary">{value}</p>
          <p className="text-xs text-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
