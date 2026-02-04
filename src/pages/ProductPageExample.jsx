/**
 * EXAMPLE: ProductPage with Preserved State
 * 
 * This component demonstrates SPA best practices:
 * 1. State is synced with URL params
 * 2. Data is cached to prevent refetches on back navigation
 * 3. Scroll position is restored
 * 4. Component state is preserved across navigation
 * 
 * Usage:
 * - All filters, sort, and page are encoded in URL
 * - Back button restores exact previous state
 * - Refresh page maintains state
 * - No unnecessary API calls
 */

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

// Example component showing state preservation pattern
export default function ProductPageExample() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // ===== 1. EXTRACT ALL STATE FROM URL PARAMS =====
  const filters = {
    category: searchParams.get('category') || 'all',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    sortBy: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || ''
  }
  
  // ===== 2. COMPONENT STATE - mirrors URL for UI updates =====
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  
  // ===== 3. CACHING - prevent refetches =====
  const cacheRef = useRef(new Map())
  const getCacheKey = (f) => JSON.stringify(f)
  
  // ===== 4. SYNC STATE WITH URL =====
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams()
    
    const merged = { ...filters, ...newFilters }
    Object.entries(merged).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && value !== 'newest' && value !== 0 && value !== 1) {
        params.set(key, value)
      }
    })
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }
  
  // ===== 5. FETCH WITH CACHING =====
  useEffect(() => {
    const cacheKey = getCacheKey(filters)
    const cached = cacheRef.current.get(cacheKey)
    
    if (cached) {
      setProducts(cached)
      return
    }
    
    setLoading(true)
    // Fetch logic here
    // Then cache:
    // cacheRef.current.set(cacheKey, data)
  }, [filters])
  
  // ===== 6. RESTORE SCROLL POSITION =====
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`scroll_${location.pathname}`)
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScroll))
      })
    }
  }, [location.pathname])
  
  // Save scroll position before navigation
  useEffect(() => {
    return () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY)
    }
  }, [location.pathname])
  
  return (
    <div>
      {/* Example usage: */}
      <button onClick={() => updateFilters({ page: 1, sortBy: 'price-low' })}>
        Sort by Price
      </button>
    </div>
  )
}
