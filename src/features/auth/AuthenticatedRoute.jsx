import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthenticatedRoute Component
 * Redirects authenticated users away from public auth pages (login, signup)
 * If user is logged in, redirects to home page
 * Otherwise, renders the component normally
 */
export default function AuthenticatedRoute({ children }) {
  const { user, initializing } = useAuth()

  // Wait for auth initialization
  if (initializing) {
    return null
  }

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />
  }

  // If not authenticated, render the component
  return children
}
