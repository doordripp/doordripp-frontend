/**
 * CompactOrderTracking Component
 * Small embedded tracking widget for OrderConfirmation page
 * Shows real-time rider location with minimal UI
 */

import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import { haversineDistance, formatDistance, formatETA, calculateETA } from '../../utils/tracking'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://doordripp-backend.onrender.com'

// Bike icon for rider
const bikeIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSI1IiBjeT0iMjAiIHI9IjIuNSIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iMjAiIHI9IjIuNSIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0gMTIgOCBMIDE2IDE0IEwgMTIgMTggTCA4IDE0IFoiIGZpbGw9IiMyMTk2RjMiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
})

// Customer icon
const customerIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkU0QjUiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSIjRkY2QzAwIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

function MapController({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 16)
    }
  }, [center, map])

  return null
}

export default function CompactOrderTracking({ orderId, token }) {
  const [riderLocation, setRiderLocation] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta] = useState(null)
  const [status, setStatus] = useState('PLACED')
  const [riderInfo, setRiderInfo] = useState(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)
  const tokenRef = useRef(token || localStorage.getItem('token'))

  // Fetch initial order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` }
        })
        const data = await response.json()
        const order = data.order || data

        setStatus(order.orderStatus || 'PLACED')
        setRiderInfo(order.deliveryPartner)

        if (order.shippingAddress?.latitude) {
          setCustomerLocation({
            lat: order.shippingAddress.latitude,
            lng: order.shippingAddress.longitude
          })
        }

        if (order.deliveryPartner?.location?.lat) {
          setRiderLocation(order.deliveryPartner.location)
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Calculate distance and ETA
  useEffect(() => {
    if (riderLocation && customerLocation) {
      const dist = haversineDistance(
        riderLocation.lat,
        riderLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      )
      setDistance(dist)
      setEta(calculateETA(dist, 30))
    }
  }, [riderLocation, customerLocation])

  // Setup socket
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: tokenRef.current },
      reconnection: true
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('customerJoinTracking', {
        orderId,
        token: tokenRef.current
      })
    })

    socket.on('locationUpdated', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng })
      }
    })

    socket.on('statusUpdated', (data) => {
      setStatus(data.status)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 h-80">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin inline-block w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full mb-2" />
            <p className="text-sm text-gray-600">Loading tracking...</p>
          </div>
        </div>
      </div>
    )
  }

  const mapCenter = riderLocation || customerLocation

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-300 shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <h3 className="font-semibold text-sm text-gray-800">Live Order Tracking</h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-700">
            {status}
          </span>
        </div>
      </div>

      {/* Map Container */}
      {mapCenter && (
        <div className="h-56 bg-gray-100">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapController center={mapCenter} />

            {customerLocation && (
              <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon} />
            )}

            {riderLocation && (
              <Marker position={[riderLocation.lat, riderLocation.lng]} icon={bikeIcon} />
            )}
          </MapContainer>
        </div>
      )}

      {/* Info Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Distance */}
          <div className="text-xs">
            <p className="text-gray-600 font-medium">Distance</p>
            <p className="text-lg font-bold text-blue-600">
              {distance ? formatDistance(distance) : '—'}
            </p>
          </div>

          {/* ETA */}
          <div className="text-xs">
            <p className="text-gray-600 font-medium">ETA</p>
            <p className="text-lg font-bold text-green-600">
              {eta ? formatETA(eta) : '—'}
            </p>
          </div>

          {/* Rider */}
          <div className="text-xs">
            <p className="text-gray-600 font-medium">Rider</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {riderInfo?.name ? riderInfo.name.split(' ')[0] : 'Assigning'}
            </p>
          </div>
        </div>

        {/* Rider Details (if available) */}
        {riderInfo && riderInfo.riderId && (
          <div className="mt-2 pt-2 border-t border-gray-300 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800">{riderInfo.name}</p>
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                ⭐ {riderInfo.rating || 4.8}
              </p>
            </div>
            {riderInfo.phone && (
              <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 whitespace-nowrap">
                📞 Call
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
