/**
 * Haversine formula — returns distance in miles between two lat/lng points.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * Filter an array of posts by proximity to a given lat/lng and radius in miles.
 */
export function filterByRadius(posts, userLat, userLng, radiusMiles) {
  return posts.filter((post) => {
    if (post.lat == null || post.lng == null) return false
    const dist = haversineDistance(userLat, userLng, post.lat, post.lng)
    return dist <= radiusMiles
  })
}
