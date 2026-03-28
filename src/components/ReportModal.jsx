'use client'

import { useState } from 'react'

const REASONS = [
  'Inappropriate content',
  'Spam or scam',
  'Harassment or threatening behavior',
  'Fake profile',
  'No-show / unreliable',
  'Other',
]

export default function ReportModal({ reportedUserId, reportedPostId, onClose }) {
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    setLoading(true)

    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedUserId, reportedPostId, reason }),
    })

    setSubmitted(true)
    setLoading(false)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full">
        {submitted ? (
          <div className="text-center py-4">
            <p className="font-semibold text-neutral-charcoal">Report submitted.</p>
            <p className="text-sm text-muted mt-1">Thank you. We&apos;ll review this.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-neutral-charcoal mb-4">Report</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-neutral-charcoal">{r}</span>
                </label>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-outline text-sm py-2">
                  Cancel
                </button>
                <button type="submit" disabled={!reason || loading} className="flex-1 btn-primary text-sm py-2">
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
