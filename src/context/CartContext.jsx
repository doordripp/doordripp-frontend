import { createContext, useContext, useReducer, useEffect } from 'react'

// Cart context
const CartContext = createContext()

// Cart reducer actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  TOGGLE_DRAWER: 'TOGGLE_DRAWER',
  APPLY_PROMO: 'APPLY_PROMO',
  REMOVE_PROMO: 'REMOVE_PROMO'
}

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, size, color, quantity = 1 } = action.payload
      
      // Check if item already exists with same product, size, and color
      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id && 
                item.selectedSize === size && 
                item.selectedColor === color
      )

      let newItems
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        const cartItem = {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          selectedSize: size,
          selectedColor: color,
          quantity,
          category: product.category || product.categoryName || product.type || product.cat || null,
          subcategory: product.subcategory || product.subCategory || product.subcategoryName || null
        }
        newItems = [...state.items, cartItem]
      }

      const newState = {
        ...state,
        items: newItems,
        isDrawerOpen: true // Auto-open drawer when item is added
      }

      return newState
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(
        item => !(item.id === action.payload.id && 
                 item.selectedSize === action.payload.selectedSize && 
                 item.selectedColor === action.payload.selectedColor)
      )
      
      return {
        ...state,
        items: newItems
      }
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, selectedSize, selectedColor, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { id, selectedSize, selectedColor }
        })
      }

      const newItems = state.items.map(item =>
        item.id === id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )

      return {
        ...state,
        items: newItems
      }
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        promoCode: null,
        discount: 0
      }

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || []
      }

    case CART_ACTIONS.TOGGLE_DRAWER:
      return {
        ...state,
        isDrawerOpen: action.payload !== undefined ? action.payload : !state.isDrawerOpen
      }

    case CART_ACTIONS.APPLY_PROMO: {
      const { code, discountPercent } = action.payload
      return {
        ...state,
        promoCode: code,
        discount: discountPercent
      }
    }

    case CART_ACTIONS.REMOVE_PROMO:
      return {
        ...state,
        promoCode: null,
        discount: 0
      }

    default:
      return state
  }
}

// Initial cart state
const initialState = {
  items: [],
  isDrawerOpen: false,
  promoCode: null,
  discount: 0 // percentage discount
}

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('doordripp-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart.items })
        if (parsedCart.promoCode) {
          dispatch({ 
            type: CART_ACTIONS.APPLY_PROMO, 
            payload: { code: parsedCart.promoCode, discountPercent: parsedCart.discount } 
          })
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('doordripp-cart', JSON.stringify({
      items: state.items,
      promoCode: state.promoCode,
      discount: state.discount
    }))
  }, [state.items, state.promoCode, state.discount])

  // Calculate cart totals with GST
  const cartTotals = {
    get totalItems() {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    get subtotal() {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    get discountAmount() {
      return (this.subtotal * state.discount) / 100
    },
    get deliveryFee() {
      // Default to regular delivery charge if cart not empty
      return this.subtotal > 0 ? 80 : 0
    },
    // Removed GST charges
    get cgstAmount() {
      return 0;
    },
    get sgstAmount() {
      return 0;
    },
    get totalGST() {
      return 0;
    },
    get total() {
      return this.subtotal - this.discountAmount + this.deliveryFee
    }
  }

  // Cart actions
  const addToCart = (product, options = {}) => {
    const { size = 'M', color = 'default', quantity = 1 } = options
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, size, color, quantity }
    })
  }

  const removeFromCart = (id, selectedSize, selectedColor) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id, selectedSize, selectedColor }
    })
  }

  const updateQuantity = (id, selectedSize, selectedColor, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id, selectedSize, selectedColor, quantity }
    })
  }

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
    localStorage.removeItem('doordripp_delivery_type')
  }

  const toggleDrawer = (isOpen) => {
    dispatch({ type: CART_ACTIONS.TOGGLE_DRAWER, payload: isOpen })
  }

  const applyPromoCode = (code) => {
    // Simple promo code logic (you can enhance this)
    const promoCodes = {
      'WELCOME20': 20,
      'SAVE10': 10,
      'FIRST15': 15
    }
    
    const discountPercent = promoCodes[code.toUpperCase()]
    if (discountPercent) {
      dispatch({
        type: CART_ACTIONS.APPLY_PROMO,
        payload: { code: code.toUpperCase(), discountPercent }
      })
      return { success: true, discount: discountPercent }
    }
    
    return { success: false, error: 'Invalid promo code' }
  }

  const removePromoCode = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_PROMO })
  }

  const isInCart = (productId, size = 'M', color = 'default') => {
    return state.items.some(
      item => item.id === productId && 
               item.selectedSize === size && 
               item.selectedColor === color
    )
  }

  const getCartItemQuantity = (productId, size = 'M', color = 'default') => {
    const item = state.items.find(
      item => item.id === productId && 
               item.selectedSize === size && 
               item.selectedColor === color
    )
    return item ? item.quantity : 0
  }

  const value = {
    // State
    items: state.items,
    isDrawerOpen: state.isDrawerOpen,
    promoCode: state.promoCode,
    discount: state.discount,
    
    // Computed values
    cartTotals,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleDrawer,
    applyPromoCode,
    removePromoCode,
    isInCart,
    getCartItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext