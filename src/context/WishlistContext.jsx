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
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        return state // Already in wishlist
      }

      return {
        ...state,
        items: [...state.items, product]
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
      dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: data.items })
      setSynced(true)
    } catch (err) {
      console.error('Failed to sync wishlist:', err)
      // Fall back to localStorage
      const savedWishlist = localStorage.getItem('doordripp-wishlist')
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist)
          dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: parsedWishlist.items })
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
    try {
      await apiPost('/wishlist/add', { productId: product.id })
      dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: product })
    } catch (err) {
      console.error('Failed to add to wishlist:', err)
      // Still add locally if backend fails
      dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: product })
    }
  }, [])

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await apiPost('/wishlist/remove', { productId })
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId })
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
      // Still remove locally if backend fails
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId })
    }
  }, [])

  const isInWishlist = useCallback((productId) => {
    return state.items.some(item => item.id === productId)
  }, [state.items])

  const clearWishlist = useCallback(async () => {
    try {
      await apiPost('/wishlist', null)
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
    } catch (err) {
      console.error('Failed to clear wishlist:', err)
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
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
