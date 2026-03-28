'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

// Fix default icon in Next.js
let iconFixed = false
function fixLeafletIcon() {
  if (iconFixed || typeof window === 'undefined') return
  const L = require('leaflet')
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
  iconFixed = true
}

export default function MapView({ posts, center }) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  const mapCenter = center || [30.2849, -97.7341]

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {posts.map((post) =>
          post.lat && post.lng ? (
            <Marker key={post.id} position={[post.lat, post.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-gray-500 mt-0.5">{post.user?.name}</p>
                  <Link href={`/post/${post.id}`} className="text-blue-600 hover:underline mt-1 block">
                    View listing
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  )
}
