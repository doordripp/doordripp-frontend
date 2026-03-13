/**
 * Tracking utilities for frontend
 */

/**
 * Calculate distance using Haversine formula (in km)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate distance in meters
 */
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  return haversineDistance(lat1, lon1, lat2, lon2) * 1000
}

/**
 * Calculate ETA in minutes
 */
export function calculateETA(distanceKm, averageSpeedKph = 30) {
  const hours = distanceKm / averageSpeedKph
  return Math.ceil(hours * 60)
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

/**
 * Format ETA for display
 */
export function formatETA(minutes) {
  if (minutes < 1) return 'Arriving soon'
  if (minutes === 1) return '1 minute'
  return `${minutes} minutes`
}

/**
 * Validate coordinates
 */
export function isValidLocation(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Get bearing between two points (0-360 degrees)
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180

  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)

  const bearing = Math.atan2(y, x) * (180 / Math.PI)
  return (bearing + 360) % 360
}

/**
 * Decode polyline (OSRM format, precision 6)
 */
export function decodePolyline(encoded, precision = 6) {
  const factor = Math.pow(10, precision)
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates = []

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}

/**
 * Fetch OSRM route
 */
export async function getOSRMRoute(startLat, startLng, endLat, endLng) {
  try {
    const coordinates = `${startLng},${startLat};${endLng},${endLat}`
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=polyline`

    const response = await fetch(url)
    if (!response.ok) throw new Error('OSRM API error')

    const data = await response.json()
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        polyline: route.geometry,
        distance: route.distance / 1000, // km
        duration: Math.ceil(route.duration / 60), // minutes
        coordinates: decodePolyline(route.geometry)
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching OSRM route:', error)
    return null
  }
}

/**
 * Smooth animation between two points
 * Returns intermediate points for smooth map movement
 */
export function getIntermediatePoints(lat1, lon1, lat2, lon2, steps = 10) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    const lat = lat1 + (lat2 - lat1) * fraction
    const lng = lon1 + (lon2 - lon1) * fraction
    points.push([lat, lng])
  }
  return points
}

/**
 * Get status icon and color
 */
export function getStatusStyle(status) {
  const styles = {
    PLACED: { icon: '📦', color: '#666', bgColor: '#f0f0f0' },
    CONFIRMED: { icon: '✓', color: '#4CAF50', bgColor: '#e8f5e9' },
    PREPARING: { icon: '👨‍🍳', color: '#FF9800', bgColor: '#fff3e0' },
    OUT_FOR_DELIVERY: { icon: '🚴', color: '#2196F3', bgColor: '#e3f2fd' },
    DELIVERED: { icon: '✓✓', color: '#4CAF50', bgColor: '#c8e6c9' },
    CANCELLED: { icon: '✕', color: '#f44336', bgColor: '#ffebee' }
  }
  return styles[status] || styles.PLACED
}
