'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import PostCard from '@/components/PostCard'
import RadiusFilter from '@/components/RadiusFilter'
import { haversineDistance } from '@/lib/distance'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function BrowsePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [radius, setRadius] = useState(10)
  const [tagSearch, setTagSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [remoteOnly, setRemoteOnly] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (userLocation) {
      params.set('lat', userLocation.lat)
      params.set('lng', userLocation.lng)
      params.set('radius', radius)
    }
    if (tagSearch) params.set('tags', tagSearch)
    if (remoteOnly) params.set('remote', 'true')

    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }, [userLocation, radius, tagSearch, remoteOnly])

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationDenied(true)
    )
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const postsWithDistance = posts.map((post) => ({
    ...post,
    distance:
      userLocation && post.lat && post.lng
        ? haversineDistance(userLocation.lat, userLocation.lng, post.lat, post.lng)
        : null,
  }))

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-charcoal">Browse skills</h1>

            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              {/* Tag search */}
              <input
                type="text"
                placeholder="Search by skill..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="input py-2 text-sm w-48"
              />

              {/* Radius filter */}
              {userLocation && (
                <RadiusFilter radius={radius} onChange={setRadius} />
              )}

              {/* Remote toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-neutral-charcoal font-medium">Remote only</span>
              </label>

              {/* Map toggle */}
              <button
                onClick={() => setShowMap(!showMap)}
                className={`text-sm px-3 py-2 rounded-lg border transition ${
                  showMap
                    ? 'border-primary bg-primary-50 text-primary font-medium'
                    : 'border-gray-200 text-muted hover:border-gray-300'
                }`}
              >
                {showMap ? 'Hide map' : 'Show map'}
              </button>
            </div>
          </div>

          {locationDenied && (
            <p className="text-xs text-muted mt-2">
              Location access denied — showing all listings. Enable location for distance filtering.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Remote premium gate */}
        {remoteOnly && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-800">Remote sessions — coming soon</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Remote skill sessions are planned for WhyNot Plus. In-person sessions are free and unlimited (up to 8/month).
            </p>
          </div>
        )}

        {/* Map */}
        {showMap && (
          <div className="h-72 mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <MapView
              posts={postsWithDistance}
              center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
            />
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted mb-6">
          {loading ? 'Loading...' : `${posts.length} listing${posts.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 h-52 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-neutral-charcoal mb-2">No listings found</p>
            <p className="text-muted text-sm">Try expanding your radius or clearing the tag filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {postsWithDistance.map((post) => (
              <PostCard key={post.id} post={post} distance={post.distance} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
