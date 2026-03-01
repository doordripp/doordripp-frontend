/**
 * RiderTracking Component
 * Handles geolocation and sends rider location updates via Socket.io
 * Used by delivery partners to track their location
 */

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getDistanceInMeters } from '../../utils/tracking'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://doordripp-backend.onrender.com'
const MIN_DISTANCE_THRESHOLD = 20 // meters
const UPDATE_INTERVAL = 5000 // 5 seconds

export default function RiderTracking() {
  const { orderId } = useParams()
  const [status, setStatus] = useState('idle') // idle, tracking, stopped, error
  const [errorMsg, setErrorMsg] = useState('')
  const [stats, setStats] = useState({
    distance: 0,
    points: 0,
    time: 0
  })

  const socketRef = useRef(null)
  const watchRef = useRef(null)
  const lastLocationRef = useRef(null)
  const lastUpdateTimeRef = useRef(null)
  const tokenRef = useRef(localStorage.getItem('token'))

  // Start tracking
  useEffect(() => {
    // Connect socket
    const socket = io(SOCKET_URL, {
      auth: { token: tokenRef.current },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Socket connected')
      // Join tracking room as rider
      socket.emit('riderJoinTracking', {
        orderId,
        token: tokenRef.current
      })
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      setErrorMsg(error.message || 'Connection error')
      setStatus('error')
    })

    socket.on('disconnect', () => {
      console.log('👋 Socket disconnected')
    })

    // Request geolocation permission and start tracking
    if ('geolocation' in navigator) {
      setStatus('tracking')

      watchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const timestamp = Date.now()

          // Check if enough time has passed (rate limit)
          if (
            lastUpdateTimeRef.current &&
            timestamp - lastUpdateTimeRef.current < UPDATE_INTERVAL
          ) {
            return // Too soon
          }

          // Check if rider moved significantly (> 20 meters)
          if (lastLocationRef.current) {
            const distance = getDistanceInMeters(
              lastLocationRef.current.lat,
              lastLocationRef.current.lng,
              latitude,
              longitude
            )

            if (distance < MIN_DISTANCE_THRESHOLD) {
              return // Not enough movement
            }

            setStats((prev) => ({
              ...prev,
              distance: prev.distance + distance / 1000, // convert to km
              points: prev.points + 1
            }))
          }

          // Send location update
          socket.emit('riderLocationUpdate', {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp
          })

          console.log(`📍 Location update: (${latitude}, ${longitude})`)

          lastLocationRef.current = { lat: latitude, lng: longitude }
          lastUpdateTimeRef.current = timestamp
        },

        (error) => {
          console.error('❌ Geolocation error:', error)
          let message = ''
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable it in settings.'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location unavailable. Check GPS signal.'
              break
            case error.TIMEOUT:
              message = 'Location request timeout.'
              break
            default:
              message = 'Failed to get location.'
          }
          setErrorMsg(message)
          setStatus('error')
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setErrorMsg('Geolocation not supported on this device')
      setStatus('error')
    }

    // Format time
    const startTime = Date.now()
    const timerInterval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        time: Math.floor((Date.now() - startTime) / 1000)
      }))
    }, 1000)

    // Cleanup
    return () => {
      clearInterval(timerInterval)
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [orderId])

  // Stop tracking (when order delivered)
  const handleStopTracking = () => {
    setStatus('stopped')
    socketRef.current?.emit('updateOrderStatus', {
      orderId,
      newStatus: 'DELIVERED'
    })
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">📍 Live Tracking</h3>
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            status === 'tracking'
              ? 'bg-green-500 animate-pulse'
              : status === 'error'
                ? 'bg-red-500'
                : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Status */}
      <div className="mb-3 text-sm font-medium">
        {status === 'tracking' && <span className="text-green-600">✓ Tracking active</span>}
        {status === 'stopped' && <span className="text-blue-600">✓ Delivery completed</span>}
        {status === 'error' && <span className="text-red-600">✕ {errorMsg}</span>}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className="text-xs text-gray-600">Distance</div>
          <div className="font-bold">{stats.distance.toFixed(2)} km</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Updates</div>
          <div className="font-bold">{stats.points}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Time</div>
          <div className="font-bold text-sm">{formatTime(stats.time)}</div>
        </div>
      </div>

      {/* Actions */}
      {status === 'tracking' && (
        <button
          onClick={handleStopTracking}
          className="w-full px-3 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition"
        >
          ✓ Delivered
        </button>
      )}

      {status === 'error' && (
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition"
        >
          Retry
        </button>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-3">
        ℹ️ Background tracking will continue. Ensure location permissions are enabled.
      </p>
    </div>
  )
}
