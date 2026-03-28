'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SkillTag from '@/components/SkillTag'

const EXCHANGE_OPTIONS = [
  { value: 'free', label: 'Free', desc: 'No exchange needed' },
  { value: 'coffee', label: 'Buy me a coffee', desc: 'A casual $3-6 thank-you' },
  { value: 'trade', label: 'Skill trade', desc: 'Teach me something too' },
  { value: 'money', label: 'Paid', desc: 'Negotiated rate' },
]

export default function NewPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    description: '',
    tagInput: '',
    tags: [],
    exchangeTypes: [],
    availability: '',
    locationName: '',
    lat: null,
    lng: null,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  function addTag() {
    const tag = form.tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag], tagInput: '' })
    } else {
      setForm({ ...form, tagInput: '' })
    }
  }

  function removeTag(tag) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
  }

  function toggleExchange(value) {
    const updated = form.exchangeTypes.includes(value)
      ? form.exchangeTypes.filter((e) => e !== value)
      : [...form.exchangeTypes, value]
    setForm({ ...form, exchangeTypes: updated })
  }

  function getLocation() {
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || ''
          const state = data.address?.state || ''
          setForm((f) => ({
            ...f,
            lat: latitude,
            lng: longitude,
            locationName: [city, state].filter(Boolean).join(', '),
          }))
        } catch {
          setForm((f) => ({ ...f, lat: latitude, lng: longitude }))
        }
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        setError('Could not get your location. You can enter it manually.')
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('Title is required')
    if (!form.description.trim()) return setError('Description is required')
    if (form.exchangeTypes.length === 0) return setError('Select at least one exchange type')

    setLoading(true)

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        tags: form.tags,
        exchangeTypes: form.exchangeTypes,
        isRemote: false,
        lat: form.lat,
        lng: form.lng,
        locationName: form.locationName,
        availability: form.availability,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create listing')
      setLoading(false)
    } else {
      router.push(`/post/${data.post.id}`)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-charcoal mb-1">Post a skill</h1>
        <p className="text-muted mb-8">Tell people what you can teach and how to get in touch.</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">
              What can you teach? <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="e.g. Guitar lessons — beginner friendly"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">
              Tell them more <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
              rows={5}
              placeholder="Describe your experience, what a session would look like, any requirements..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Skill tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input py-2 text-sm flex-1"
                placeholder="e.g. guitar, music, beginner"
              />
              <button type="button" onClick={addTag} className="btn-outline text-sm px-4 py-2">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1">
                    <SkillTag tag={tag} small />
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted hover:text-red-500 text-xs"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exchange types */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-2">
              What do you want in return? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXCHANGE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    form.exchangeTypes.includes(opt.value)
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.exchangeTypes.includes(opt.value)}
                    onChange={() => toggleExchange(opt.value)}
                    className="accent-primary mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-charcoal">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Remote — premium gate */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-800">Remote sessions — WhyNot Plus</p>
            <p className="text-xs text-amber-700 mt-1">
              Remote listings are a premium feature. For now, all sessions are in-person. Your listing will be set to in-person automatically.
            </p>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Availability</label>
            <input
              type="text"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="input"
              placeholder="e.g. Weekends, or Thursday evenings"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                className="input flex-1"
                placeholder="e.g. Austin, TX"
              />
              <button
                type="button"
                onClick={getLocation}
                disabled={geoLoading}
                className="btn-outline text-sm px-4 py-2 whitespace-nowrap"
              >
                {geoLoading ? 'Getting...' : 'Use GPS'}
              </button>
            </div>
            {form.lat && (
              <p className="text-xs text-success mt-1">Location set ({form.lat.toFixed(4)}, {form.lng.toFixed(4)})</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-accent py-3 text-base">
            {loading ? 'Posting...' : 'Post listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
