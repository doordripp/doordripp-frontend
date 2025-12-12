import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAdminAccess } from '../utils/roleUtils'

export default function RequireAdmin({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return null // or a spinner

  if (!user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasAdminAccess(user)) {
    // Logged in but not admin
    return <Navigate to="/" replace />
  }

  return children
}
