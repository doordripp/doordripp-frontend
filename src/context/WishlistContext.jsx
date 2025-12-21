import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { apiGet, apiPost } from '../services/apiClient'

// Wishlist context
const WishlistContext = createContext()

// Wishlist reducer actions
const WISHLIST_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  LOAD_WISHLIST: 'LOAD_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST'
}

// Wishlist reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.ADD_ITEM: {
      const product = action.payload
      // Check if item already exists (by normalized id)
      const pid = product._id || product.id
      const exists = state.items.some(item => (item._id || item.id) == pid)
      if (exists) return state
      // Prepend so newest items appear first
      return {
        ...state,
        items: [product, ...state.items]
      }
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    }

    case WISHLIST_ACTIONS.LOAD_WISHLIST:
      return {
        ...state,
        items: action.payload || []
      }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        items: []
      }

    default:
      return state
  }
}

// Initial wishlist state
const initialState = {
  items: [],
  loading: false,
  synced: false
}

// Wishlist provider component
export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)
  const [loading, setLoading] = useState(false)
  const [synced, setSynced] = useState(false)

  // Sync wishlist from backend
  const syncWishlist = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet('/wishlist')
      // normalize ids to prefer _id then id
      let items = (data?.items || []).map(it => ({ ...it, _id: it._id || it.id || it.productId || it.product?._id }))
      // ensure newest-first ordering: if backend provided timestamps, sort by createdAt desc, otherwise reverse array
      if (items.length && (items[0].createdAt || items[0].addedAt)) {
        items.sort((a, b) => new Date(b.createdAt || b.addedAt) - new Date(a.createdAt || a.addedAt))
      } else {
        items = items.slice().reverse()
      }
      dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: items })
      setSynced(true)
    } catch (err) {
      console.error('Failed to sync wishlist:', err)
      // Fall back to localStorage
      const savedWishlist = localStorage.getItem('doordripp-wishlist')
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist)
          // ensure normalized ids
          const items = (parsedWishlist.items || []).map(it => ({ ...it, _id: it._id || it.id }))
          dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: items })
        } catch (e) {
          console.error('Failed to load wishlist from localStorage:', e)
        }
      }
      setSynced(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearWishlistLocal = useCallback(() => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
    localStorage.removeItem('doordripp-wishlist')
  }, [])

  const addToWishlist = useCallback(async (product) => {
    // normalize product object
    const p = { ...product, _id: product._id || product.id }
    try {
      await apiPost('/wishlist/add', { productId: p._id })
      // add newest-first
      dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: p })
    } catch (err) {
      console.error('Failed to add to wishlist:', err)
      // Still add locally if backend fails
      dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: p })
    }
  }, [])

  const removeFromWishlist = useCallback(async (productId) => {
    const id = typeof productId === 'string' || typeof productId === 'number' ? productId : (productId._id || productId.id)
    try {
      await apiPost('/wishlist/remove', { productId: id })
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: id })
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
      // Still remove locally if backend fails
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: id })
    }
  }, [])

  const isInWishlist = useCallback((productId) => {
    const id = productId?._id || productId?.id || productId
    return state.items.some(item => (item._id || item.id) == id)
  }, [state.items])

  // persist local copy on change
  useEffect(() => {
    try {
      localStorage.setItem('doordripp-wishlist', JSON.stringify({ items: state.items }))
    } catch (e) {
      // ignore
    }
  }, [state.items])

  const clearWishlist = useCallback(async () => {
    try {
      await apiPost('/wishlist/clear', null)
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
      localStorage.removeItem('doordripp-wishlist')
    } catch (err) {
      console.error('Failed to clear wishlist:', err)
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
      localStorage.removeItem('doordripp-wishlist')
    }
  }, [])

  return (
    <WishlistContext.Provider value={{
      items: state.items,
      loading,
      synced,
      syncWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist: clearWishlistLocal,
      totalItems: state.items.length
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

// Hook to use wishlist context
export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
