/**
 * useOrderTracking Hook
 * Reusable hook for managing real-time order tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getOSRMRoute } from '../utils/tracking'

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : ''
const SOCKET_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || runtimeOrigin
const isDev = import.meta.env.DEV

export function useOrderTracking(orderId, token, role = 'customer') {
  const [riderLocation, setRiderLocation] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)
  const [riderOnline, setRiderOnline] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [route, setRoute] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta] = useState(null)

  const socketRef = useRef(null)
  const lastLocRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      if (isDev) console.log('Connected to tracking server')
      setConnectionStatus('connected')

      // Join appropriate room
      if (role === 'rider') {
        socket.emit('riderJoinTracking', { orderId, token })
      } else {
        socket.emit('customerJoinTracking', { orderId, token })
      }
    })

    socket.on('disconnect', () => {
      if (isDev) console.log('Disconnected from tracking server')
      setConnectionStatus('disconnected')
    })

    socket.on('reconnecting', () => {
      setConnectionStatus('reconnecting')
    })

    // Tracking events
    socket.on('locationUpdated', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng })
        lastLocRef.current = { lat: data.lat, lng: data.lng }
      }
    })

    socket.on('currentRiderLocation', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng })
      }
    })

    socket.on('statusUpdated', (data) => {
      setOrderStatus(data.status)
    })

    socket.on('riderOnline', () => {
      setRiderOnline(true)
    })

    socket.on('riderOffline', () => {
      setRiderOnline(false)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [orderId, token, role])

  // Fetch and manage route
  const updateRoute = useCallback(async (start, end) => {
    if (!start || !end) return

    const routeData = await getOSRMRoute(start.lat, start.lng, end.lat, end.lng)
    if (routeData) {
      setRoute(routeData.coordinates)
      setDistance(routeData.distance)
      setEta(routeData.duration)
    }
  }, [])

  // Send location update (for riders)
  const sendLocationUpdate = useCallback((lat, lng, accuracy) => {
    if (socketRef.current && role === 'rider') {
      socketRef.current.emit('riderLocationUpdate', {
        lat,
        lng,
        accuracy,
        timestamp: Date.now()
      })
    }
  }, [role])

  // Update order status (for riders)
  const updateOrderStatus = useCallback((status) => {
    if (socketRef.current && role === 'rider') {
      socketRef.current.emit('updateOrderStatus', {
        orderId,
        newStatus: status
      })
    }
  }, [orderId, role])

  return {
    riderLocation,
    orderStatus,
    riderOnline,
    connectionStatus,
    route,
    distance,
    eta,
    sendLocationUpdate,
    updateOrderStatus,
    updateRoute,
    socket: socketRef.current
  }
}
