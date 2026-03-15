import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { apiGet, apiPost } from '../services/apiClient'
import { authStorage } from '../utils/auth'

const AuthContext = createContext(null)

let _isRefreshing = false
let _refreshPromise = null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser())
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const proactiveRefreshTimerRef = useRef(null)

  const scheduleProactiveRefresh = (token) => {
    if (proactiveRefreshTimerRef.current) clearTimeout(proactiveRefreshTimerRef.current)
    try {
      const decoded = jwtDecode(token)
      if (!decoded?.exp) return
      const refreshBuffer = 5 * 60 * 1000 // Refresh 5 minutes before expiry
      const timeUntilRefresh = decoded.exp * 1000 - Date.now() - refreshBuffer
      if (timeUntilRefresh <= 0) {
        refreshToken()
      } else {
        proactiveRefreshTimerRef.current = setTimeout(refreshToken, timeUntilRefresh)
      }
    } catch (_) {
      // Token can't be decoded — ignore, reactive refresh will handle 401s
    }
  }

  const fetchMe = async (attemptRefresh = true) => {
    try {
      const data = await apiGet('/auth/me')
      const minimal = {
        _id: data._id,
        name: data.name,
        email: data.email,
        roles: data.role || data.roles || [],
        avatar: data.avatar,
        phone: data.phone || null,
        address: data.address || null,
        gender: data.gender || null,
        dob: data.dob || null,
        googleId: data.googleId || null,
        isPasswordSet: data.isPasswordSet || false,
      }
      setUser(minimal)
      authStorage.setUser(minimal)
      // Schedule proactive token refresh
      const token = authStorage.getToken()
      if (token) scheduleProactiveRefresh(token)
      return data
    } catch (err) {
      // Try refresh once if unauthorized
      const status = err?.status || err?.statusCode || err?.code
      const hasLocalToken = !!authStorage.getToken()
      if ((status === 401 || err?.message?.toLowerCase()?.includes('token')) && attemptRefresh && hasLocalToken) {
        const refreshed = await refreshToken()
        if (refreshed) return fetchMe(false)
      }
      setUser(null)
      authStorage.removeUser()
      return null
    } finally {
      setInitializing(false)
    }
  }

  const refreshToken = async () => {
    if (_isRefreshing && _refreshPromise) return _refreshPromise
    _isRefreshing = true
    _refreshPromise = (async () => {
      try {
        const data = await apiPost('/auth/refresh')
        if (data?.token) {
          authStorage.setToken(data.token)
          return true
        }
        return false
      } catch (e) {
        authStorage.clear()
        return false
      } finally {
        _isRefreshing = false
        _refreshPromise = null
      }
    })()
    return _refreshPromise
  }

  const logout = async () => {
    setLoading(true)
    if (proactiveRefreshTimerRef.current) clearTimeout(proactiveRefreshTimerRef.current)
    try {
      await apiPost('/auth/logout')
    } catch (e) {
      // ignore errors on logout
    } finally {
      setUser(null)
      authStorage.clear()
      setLoading(false)
    }
  }

  const forgotPassword = async (emailOrPhone) => {
    setLoading(true)
    try {
      const response = await apiPost('/auth/forgot-password', { emailOrPhone })
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token, password) => {
    setLoading(true)
    try {
      const response = await apiPost('/auth/reset-password', { token, password })
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Silently check auth on mount - 401 is expected for unauthenticated users
    fetchMe().catch(() => {
      // Auth check failed (401 is expected), user will be null
      // This is the correct behavior
    })
    return () => {
      if (proactiveRefreshTimerRef.current) clearTimeout(proactiveRefreshTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, loading, fetchMe, refreshToken, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
