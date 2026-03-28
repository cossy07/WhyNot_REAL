'use client'

export default function RadiusFilter({ radius, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-neutral-charcoal whitespace-nowrap">
        Within {radius} mi
      </label>
      <input
        type="range"
        min={1}
        max={25}
        step={1}
        value={radius}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 accent-primary"
      />
    </div>
  )
}
