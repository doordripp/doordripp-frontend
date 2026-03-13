import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { apiPost } from '../services/apiClient'

const CartContext = createContext()

const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  TOGGLE_DRAWER: 'TOGGLE_DRAWER',
  APPLY_PROMO: 'APPLY_PROMO',
  REMOVE_PROMO: 'REMOVE_PROMO',
  SET_TRIAL_MODE: 'SET_TRIAL_MODE'
}

const calculateSubtotalFromItems = (items = []) =>
  items.reduce((total, item) => total + (item.price * item.quantity), 0)

const normalizeVoucherResponse = (response, fallbackCode, fallbackSubtotal) => {
  const code = String(response?.code || fallbackCode || '').toUpperCase().trim()
  const discountAmount = Number(response?.discount ?? 0)
  const originalSubtotal = Number(response?.originalPrice ?? fallbackSubtotal)
  const finalSubtotal = Number(response?.finalPrice ?? Math.max(0, originalSubtotal - discountAmount))

  return {
    code,
    discountAmount: Number.isFinite(discountAmount) ? Math.max(discountAmount, 0) : 0,
    originalSubtotal: Number.isFinite(originalSubtotal) ? Math.max(originalSubtotal, 0) : fallbackSubtotal,
    finalSubtotal: Number.isFinite(finalSubtotal) ? Math.max(finalSubtotal, 0) : Math.max(0, fallbackSubtotal - (Number.isFinite(discountAmount) ? discountAmount : 0)),
    discountType: response?.discountType || null,
    discountValue: Number(response?.discountValue ?? 0) || 0
  }
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, size, color, quantity = 1 } = action.payload

      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id &&
                item.selectedSize === size &&
                item.selectedColor === color
      )

      let newItems
      if (existingItemIndex !== -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
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

      return {
        ...state,
        items: newItems,
        isDrawerOpen: true
      }
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
        voucher: null
      }

    case CART_ACTIONS.LOAD_CART: {
      if (Array.isArray(action.payload)) {
        return { ...state, items: action.payload }
      }
      const payload = action.payload || {}
      return {
        ...state,
        items: payload.items || [],
        promoCode: payload.promoCode || null,
        voucher: payload.voucher || null
      }
    }

    case CART_ACTIONS.TOGGLE_DRAWER:
      return {
        ...state,
        isDrawerOpen: action.payload !== undefined ? action.payload : !state.isDrawerOpen
      }

    case CART_ACTIONS.APPLY_PROMO: {
      const voucher = action.payload || null
      return {
        ...state,
        promoCode: voucher?.code || null,
        voucher
      }
    }

    case CART_ACTIONS.REMOVE_PROMO:
      return {
        ...state,
        promoCode: null,
        voucher: null
      }

    case CART_ACTIONS.SET_TRIAL_MODE: {
      const { isTrial, trialFee, trialItems, purchasedItemId } = action.payload
      return {
        ...state,
        isTrialCheckout: !!isTrial,
        trialFee: trialFee || 0,
        trialItems: trialItems || [],
        purchasedItemId: purchasedItemId || null
      }
    }

    default:
      return state
  }
}

const initialState = {
  items: [],
  isDrawerOpen: false,
  promoCode: null,
  voucher: null,
  isTrialCheckout: false,
  trialFee: 0,
  trialItems: [],
  purchasedItemId: null
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    const savedCart = localStorage.getItem('doordripp-cart')
    if (!savedCart) return
    try {
      const parsedCart = JSON.parse(savedCart)
      dispatch({
        type: CART_ACTIONS.LOAD_CART,
        payload: {
          items: parsedCart.items || [],
          promoCode: parsedCart.promoCode || null,
          voucher: parsedCart.voucher || null
        }
      })
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('doordripp-cart', JSON.stringify({
      items: state.items,
      promoCode: state.promoCode,
      voucher: state.voucher
    }))
  }, [state.items, state.promoCode, state.voucher])

  const currentSubtotal = calculateSubtotalFromItems(state.items)

  // Keep voucher value synced with cart subtotal changes (security + correctness)
  useEffect(() => {
    const shouldValidate = !!state.promoCode && currentSubtotal > 0
    if (!shouldValidate) return

    const storedSubtotal = Number(state.voucher?.originalSubtotal || 0)
    if (Math.abs(storedSubtotal - currentSubtotal) <= 0.009) return

    let cancelled = false
    ;(async () => {
      setPromoLoading(true)
      try {
        const response = await apiPost('/voucher/apply', {
          code: state.promoCode,
          cartTotal: currentSubtotal
        })
        if (cancelled) return
        dispatch({
          type: CART_ACTIONS.APPLY_PROMO,
          payload: normalizeVoucherResponse(response, state.promoCode, currentSubtotal)
        })
        setPromoError('')
      } catch (e) {
        if (cancelled) return
        dispatch({ type: CART_ACTIONS.REMOVE_PROMO })
        setPromoError(e?.error || e?.message || 'Coupon removed because cart changed or became invalid')
      } finally {
        if (!cancelled) setPromoLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentSubtotal, state.promoCode, state.voucher?.originalSubtotal])

  const cartTotals = {
    get totalItems() {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    get subtotal() {
      return currentSubtotal
    },
    get discountAmount() {
      const discount = Number(state.voucher?.discountAmount || 0)
      if (!Number.isFinite(discount) || discount <= 0) return 0
      return Math.min(discount, this.subtotal)
    },
    get subtotalAfterDiscount() {
      return Math.max(this.subtotal - this.discountAmount, 0)
    },
    get deliveryFee() {
      return this.subtotal > 0 ? 80 : 0
    },
    get cgstAmount() {
      return 0
    },
    get sgstAmount() {
      return 0
    },
    get totalGST() {
      return 0
    },
    get trialFee() {
      return state.trialFee || 0
    },
    get total() {
      return this.subtotalAfterDiscount + this.deliveryFee + this.trialFee
    }
  }

  const addToCart = (product, options = {}) => {
    const legacyOptions = typeof options === 'object' && options !== null && !Array.isArray(options)
      ? options
      : { size: options, color: arguments[2], quantity: arguments[3] }

    const { size = 'M', color = 'default', quantity = 1 } = legacyOptions
    const stock = Number.isFinite(product?.stock) ? product.stock : null

    const existingItem = state.items.find(
      item => item.id === product.id &&
               item.selectedSize === size &&
               item.selectedColor === color
    )
    const existingQty = existingItem ? existingItem.quantity : 0
    if (stock !== null && (stock <= 0 || existingQty + quantity > stock)) {
      return { success: false, error: 'OUT_OF_STOCK' }
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, size, color, quantity }
    })

    return { success: true }
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
    dispatch({ type: CART_ACTIONS.SET_TRIAL_MODE, payload: { isTrial: false, trialFee: 0 } })
    localStorage.removeItem('doordripp_delivery_type')
  }

  const setTrialMode = (data) => {
    dispatch({ type: CART_ACTIONS.SET_TRIAL_MODE, payload: data })
  }

  const toggleDrawer = (isOpen) => {
    dispatch({ type: CART_ACTIONS.TOGGLE_DRAWER, payload: isOpen })
  }

  const applyPromoCode = async (code) => {
    const normalizedCode = String(code || '').trim().toUpperCase()
    if (!normalizedCode) {
      return { success: false, error: 'Enter a valid coupon code' }
    }

    if (currentSubtotal <= 0) {
      return { success: false, error: 'Add items to cart before applying coupon' }
    }

    setPromoLoading(true)
    setPromoError('')
    try {
      const response = await apiPost('/voucher/apply', {
        code: normalizedCode,
        cartTotal: currentSubtotal
      })

      const voucher = normalizeVoucherResponse(response, normalizedCode, currentSubtotal)
      dispatch({ type: CART_ACTIONS.APPLY_PROMO, payload: voucher })
      return {
        success: true,
        code: voucher.code,
        discount: voucher.discountAmount,
        message: 'Coupon applied successfully'
      }
    } catch (e) {
      const message = e?.error || e?.message || 'Failed to apply coupon'
      setPromoError(message)
      return { success: false, error: message }
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromoCode = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_PROMO })
    setPromoError('')
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
    items: state.items,
    isDrawerOpen: state.isDrawerOpen,
    promoCode: state.promoCode,
    voucherDetails: state.voucher,
    promoLoading,
    promoError,
    isTrialCheckout: state.isTrialCheckout,
    trialFee: state.trialFee,
    trialItems: state.trialItems,
    purchasedItemId: state.purchasedItemId,
    cartTotals,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setTrialMode,
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

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
