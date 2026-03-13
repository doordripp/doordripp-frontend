import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Hook to preserve page state and scroll position across navigation
 * Automatically restores state when user navigates back
 * 
 * Usage:
 * const [state, setState, scrollToSaved] = usePageState('pageName', initialState)
 */
export function usePageState(pageName, initialState = {}) {
  const location = useLocation()
  const stateRef = useRef(initialState)
  const scrollPositionRef = useRef(0)
  const pageStateKey = `pageState_${pageName}`
  const scrollPositionKey = `scrollPos_${pageName}`

  // Load state from sessionStorage when navigating back
  useEffect(() => {
    const savedState = sessionStorage.getItem(pageStateKey)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        stateRef.current = parsed
        // Return the parsed state so component can use it
        return parsed
      } catch (e) {
        console.error('Failed to parse saved state:', e)
      }
    }
    return stateRef.current
  }, [pageStateKey])

  // Save state to sessionStorage when it changes
  const setState = (newState) => {
    const updated = typeof newState === 'function' ? newState(stateRef.current) : newState
    stateRef.current = updated
    sessionStorage.setItem(pageStateKey, JSON.stringify(updated))
    return updated
  }

  // Save scroll position before leaving page
  useEffect(() => {
    return () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop
      scrollPositionRef.current = scrollPos
      sessionStorage.setItem(scrollPositionKey, scrollPos.toString())
    }
  }, [location.pathname, scrollPositionKey])

  // Restore scroll position when navigating back
  const scrollToSaved = () => {
    const savedScroll = sessionStorage.getItem(scrollPositionKey)
    if (savedScroll) {
      const position = parseInt(savedScroll, 10)
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: position, left: 0, behavior: 'auto' })
      })
    }
  }

  return [stateRef.current, setState, scrollToSaved]
}

/**
 * Hook to sync state with URL query parameters
 * Persists filters in URL so they survive page refresh
 * 
 * Usage:
 * const [filters, setFilters] = useUrlParams(defaultFilters)
 */
export function useUrlParams(defaultParams = {}) {
  const location = useLocation()
  const navigate = useNavigate()

  // Parse URL params into state
  const getParamsFromUrl = () => {
    const params = new URLSearchParams(location.search)
    const result = { ...defaultParams }

    for (const [key, value] of params.entries()) {
      if (key === 'page' || key === 'limit') {
        result[key] = parseInt(value, 10)
      } else if (value === 'true' || value === 'false') {
        result[key] = value === 'true'
      } else if (!isNaN(value)) {
        result[key] = parseInt(value, 10)
      } else {
        result[key] = value
      }
    }

    return result
  }

  const params = getParamsFromUrl()

  // Update URL when params change
  const updateParams = (newParams) => {
    const updated = { ...params, ...newParams }
    const searchParams = new URLSearchParams()

    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value))
      }
    })

    const newSearch = searchParams.toString()
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true })
    return updated
  }

  return [params, updateParams]
}

/**
 * Hook for data caching to prevent unnecessary API calls
 * Caches API response per page/query combination
 * 
 * Usage:
 * const [data, loading, fetch] = useCachedData('products', 5 * 60 * 1000) // 5 min cache
 */
export function useCachedData(cacheKey, ttl = 5 * 60 * 1000) {
  const cacheRef = useRef(new Map())
  const timestampRef = useRef(new Map())

  const isCacheValid = (key) => {
    const timestamp = timestampRef.current.get(key)
    if (!timestamp) return false
    return Date.now() - timestamp < ttl
  }

  const getFromCache = (key) => {
    if (isCacheValid(key)) {
      return cacheRef.current.get(key)
    }
    cacheRef.current.delete(key)
    timestampRef.current.delete(key)
    return null
  }

  const setInCache = (key, data) => {
    cacheRef.current.set(key, data)
    timestampRef.current.set(key, Date.now())
  }

  return { getFromCache, setInCache, clearCache: () => {
    cacheRef.current.clear()
    timestampRef.current.clear()
  }}
}
