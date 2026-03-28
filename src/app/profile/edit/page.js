'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', bio: '', locationName: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated' && session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setForm({
              name: data.user.name || '',
              bio: data.user.bio || '',
              locationName: data.user.locationName || '',
            })
          }
          setFetching(false)
        })
    }
  }, [session, status, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/users/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to save')
      setLoading(false)
      return
    }

    setSaved(true)
    await update({ name: form.name })
    setTimeout(() => router.push(`/profile/${session.user.id}`), 1000)
  }

  if (status === 'loading' || fetching) return null

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-neutral-charcoal mb-8">Edit profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            Saved. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input resize-none"
              rows={4}
              placeholder="Tell people a bit about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-charcoal mb-1">Location</label>
            <input
              type="text"
              value={form.locationName}
              onChange={(e) => setForm({ ...form, locationName: e.target.value })}
              className="input"
              placeholder="e.g. Austin, TX"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline flex-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || saved}
              className="btn-primary flex-1 py-3"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
