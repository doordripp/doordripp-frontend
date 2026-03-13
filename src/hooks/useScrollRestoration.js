/**
 * useScrollRestoration Hook
 * 
 * A reusable hook for components that need manual scroll position control.
 * Useful for components that want to save/restore scroll independently.
 * 
 * @param {string} key - Unique identifier for this scroll position
 * @returns {Object} - Methods to save, restore, and clear scroll position
 * 
 * @example
 * const { saveScroll, restoreScroll, clearScroll } = useScrollRestoration('products-list')
 * 
 * // Save before navigating
 * const handleProductClick = (id) => {
 *   saveScroll()
 *   navigate(`/product/${id}`)
 * }
 * 
 * // Restore on mount
 * useEffect(() => {
 *   restoreScroll()
 * }, [])
 */
export function useScrollRestoration(key) {
  const STORAGE_PREFIX = 'doordripp_scroll_'
  const storageKey = `${STORAGE_PREFIX}${key}`

  /**
   * Save current scroll position
   */
  const saveScroll = () => {
    try {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      sessionStorage.setItem(storageKey, scrollY.toString())
      sessionStorage.setItem(`${storageKey}_time`, Date.now().toString())
      return scrollY
    } catch {
      console.warn('Failed to save scroll position')
      return null
    }
  }

  /**
   * Restore saved scroll position
   * @param {Object} options - Restoration options
   * @param {boolean} options.smooth - Use smooth scrolling
   * @param {number} options.delay - Delay in ms before scrolling
   */
  const restoreScroll = (options = {}) => {
    const { smooth = false, delay = 0 } = options

    const restore = () => {
      try {
        const savedScroll = sessionStorage.getItem(storageKey)
        if (savedScroll) {
          const position = parseInt(savedScroll, 10)
          window.scrollTo({
            top: position,
            left: 0,
            behavior: smooth ? 'smooth' : 'auto'
          })
          return position
        }
      } catch {
        console.warn('Failed to restore scroll position')
      }
      return null
    }

    if (delay > 0) {
      setTimeout(restore, delay)
    } else {
      requestAnimationFrame(restore)
    }
  }

  /**
   * Clear saved scroll position
   */
  const clearScroll = () => {
    try {
      sessionStorage.removeItem(storageKey)
      sessionStorage.removeItem(`${storageKey}_time`)
    } catch {
      console.warn('Failed to clear scroll position')
    }
  }

  /**
   * Get saved scroll position without restoring
   */
  const getScroll = () => {
    try {
      const savedScroll = sessionStorage.getItem(storageKey)
      return savedScroll ? parseInt(savedScroll, 10) : null
    } catch {
      return null
    }
  }

  return {
    saveScroll,
    restoreScroll,
    clearScroll,
    getScroll
  }
}

/**
 * Utility function to clear all scroll positions
 * Useful for logout or cache clearing
 */
export function clearAllScrollPositions() {
  try {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('doordripp_scroll_')) {
        sessionStorage.removeItem(key)
      }
    })
  } catch {
    console.warn('Failed to clear scroll positions')
  }
}

/**
 * Utility function to scroll to top with options
 */
export function scrollToTop(options = {}) {
  const { smooth = false, delay = 0 } = options

  const scroll = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  if (delay > 0) {
    setTimeout(scroll, delay)
  } else {
    requestAnimationFrame(scroll)
  }
}
