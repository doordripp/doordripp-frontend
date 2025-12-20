import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../services/apiClient'
import { authStorage } from '../utils/auth'

const AuthContext = createContext(null)

let _isRefreshing = false
let _refreshPromise = null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser())
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)

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
      }
      setUser(minimal)
      authStorage.setUser(minimal)
      return data
    } catch (err) {
      // Try refresh once if unauthorized
      const status = err?.status || err?.statusCode || err?.code
      if ((status === 401 || err?.message?.toLowerCase()?.includes('token')) && attemptRefresh) {
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
    fetchMe()
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
