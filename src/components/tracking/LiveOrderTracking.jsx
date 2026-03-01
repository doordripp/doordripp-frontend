/**
 * LiveOrderTracking Component
 * Real-time map display with rider location
 * Shows: Map, rider marker, customer location, polyline route, distance, ETA, status timeline
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  haversineDistance,
  formatDistance,
  formatETA,
  calculateETA,
  getOSRMRoute,
  getStatusStyle,
  decodePolyline
} from '../../utils/tracking'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://doordripp-backend.onrender.com'

// Custom bike icon for rider
const bikeIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSI2IiBjeT0iMjQiIHI9IjMiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjI0IiByPSIzIiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTSAxNiA4IEwgMjAgMTYgTCAxNiAyMCBMLCAxMiAxNiBaIiBmaWxsPSIjMjE5NkYzIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMiIgZmlsbD0iI0ZGQzEwVyIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

// Customer location icon
const customerIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSQzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNGRkU0QjUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjRkY2QzAwIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

// Map controls component
function MapController({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || 18)
    }
  }, [center, zoom, map])

  return null
}

// Main tracking component
export default function LiveOrderTracking() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [riderLocation, setRiderLocation] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [route, setRoute] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [riderOnline, setRiderOnline] = useState(false)

  const socketRef = useRef(null)
  const tokenRef = useRef(localStorage.getItem('token'))
  const lastRiderLocRef = useRef(null)

  // Fetch initial order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` }
        })
        const data = await response.json()
        const fetchedOrder = data.order || data

        setOrder(fetchedOrder)

        // Set locations
        if (fetchedOrder.shippingAddress?.latitude) {
          const custLoc = {
            lat: fetchedOrder.shippingAddress.latitude,
            lng: fetchedOrder.shippingAddress.longitude
          }
          setCustomerLocation(custLoc)
          setMapCenter(custLoc)
        }

        if (fetchedOrder.deliveryPartner?.location?.lat) {
          setRiderLocation(fetchedOrder.deliveryPartner.location)
          setMapCenter(fetchedOrder.deliveryPartner.location)
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError('Could not load order details')
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Fetch route when both locations are available
  useEffect(() => {
    if (!riderLocation || !customerLocation) return

    const fetchRoute = async () => {
      const routeData = await getOSRMRoute(
        riderLocation.lat,
        riderLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      )

      if (routeData) {
        setRoute(routeData.coordinates)
        setDistance(routeData.distance)
        setEta(routeData.duration)
      }
    }

    lastRiderLocRef.current = riderLocation
    fetchRoute()
  }, [riderLocation, customerLocation])

  // Setup socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: tokenRef.current },
      reconnection: true,
      reconnectionDelay: 1000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Connected to tracking')
      socket.emit('customerJoinTracking', {
        orderId,
        token: tokenRef.current
      })
    })

    // Rider location updated
    socket.on('locationUpdated', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng })
      }
    })

    // Initial rider location
    socket.on('currentRiderLocation', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng })
      }
    })

    // Rider online/offline
    socket.on('riderOnline', () => {
      setRiderOnline(true)
    })

    socket.on('riderOffline', () => {
      setRiderOnline(false)
    })

    // Order status update
    socket.on('statusUpdated', (data) => {
      setOrder((prev) => ({
        ...prev,
        orderStatus: data.status
      }))
    })

    socket.on('error', (err) => {
      console.error('Socket error:', err)
      setError('Tracking connection error')
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full" />
          </div>
          <p className="text-gray-600">Loading track information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600 font-semibold mb-4">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const status = order?.orderStatus || 'PLACED'
  const statusStyle = getStatusStyle(status)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🚴 Live Tracking</h1>
            <p className="text-sm text-gray-600">Order #{orderId?.slice(-8)}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {distance ? formatDistance(distance) : '- km'}
            </div>
            <div className="text-sm text-gray-600">
              ETA: {eta ? formatETA(eta) : 'Calculating...'}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4 max-w-7xl mx-auto w-full">
        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg border border-gray-200">
          {mapCenter && (
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={18}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <MapController center={riderLocation || customerLocation} zoom={18} />

              {/* Customer location */}
              {customerLocation && (
                <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
                  <Popup>Your Delivery Location</Popup>
                </Marker>
              )}

              {/* Rider location */}
              {riderLocation && (
                <Marker position={[riderLocation.lat, riderLocation.lng]} icon={bikeIcon}>
                  <Popup>📍 Rider Location</Popup>
                </Marker>
              )}

              {/* Route polyline */}
              {route && route.length > 0 && (
                <Polyline
                  positions={route.map(([lat, lng]) => [lat, lng])}
                  color="#2196F3"
                  weight={3}
                  opacity={0.8}
                />
              )}
            </MapContainer>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Status card */}
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{statusStyle.icon}</span>
              <div>
                <p className="text-xs text-gray-600">Current Status</p>
                <p className="font-bold text-lg">{status}</p>
              </div>
            </div>
            {!riderOnline && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                ⚠️ Rider temporarily out of range
              </p>
            )}
          </div>

          {/* Rider info */}
          {order?.deliveryPartner && (
            <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
              <p className="text-xs text-gray-600 mb-3">Delivery Partner</p>
              <div className="flex items-center gap-3">
                {order.deliveryPartner.photo && (
                  <img
                    src={order.deliveryPartner.photo}
                    alt="Rider"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{order.deliveryPartner.name}</p>
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    ⭐ {order.deliveryPartner.rating || 4.8}
                  </p>
                </div>
              </div>
              {order.deliveryPartner.phone && (
                <button className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm">
                  ☎️ Call Rider
                </button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <p className="text-xs text-gray-600 mb-3 font-semibold">Delivery Timeline</p>
            <div className="space-y-2 text-sm">
              {['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((s) => {
                const isCompleted = status === s || ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)
                const isActive = status === s
                const stl = getStatusStyle(s)
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      } ${isActive ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {isCompleted ? '✓' : '○'}
                    </div>
                    <span className={isCompleted ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                      {s}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
