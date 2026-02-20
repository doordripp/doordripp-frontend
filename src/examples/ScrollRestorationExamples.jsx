/**
 * EXAMPLE: Real-World Usage of Scroll Restoration
 * 
 * This file demonstrates how to use the scroll restoration system
 * in various real-world scenarios for the Doordripp e-commerce platform.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollRestoration, scrollToTop, clearAllScrollPositions } from '../hooks/useScrollRestoration'

// ============================================================================
// EXAMPLE 1: Product List Page (Most Common Use Case)
// ============================================================================

/**
 * Basic product list that automatically preserves scroll position
 * when users navigate to product details and back.
 */
export function ProductListExample() {
  const navigate = useNavigate()
  const { saveScroll, restoreScroll } = useScrollRestoration('product-list')

  // Restore scroll position when component mounts
  useEffect(() => {
    restoreScroll()
  }, [])

  const handleProductClick = (productId) => {
    saveScroll() // Save current scroll before navigating
    navigate(`/product/${productId}`)
  }

  return (
    <div className="product-list">
      {/* Products automatically maintain scroll position */}
      <div className="grid">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Search Results with Filters (Advanced)
// ============================================================================

/**
 * Search results that preserve scroll even when filters change.
 * Uses delay to wait for filtered results to render.
 */
export function SearchResultsExample({ filters }) {
  const { saveScroll, restoreScroll } = useScrollRestoration('search-results')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch results when filters change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      const data = await searchProducts(filters)
      setResults(data)
      setLoading(false)
    }
    fetchResults()
  }, [filters])

  // Restore scroll after results are loaded
  useEffect(() => {
    if (!loading && results.length > 0) {
      // Add delay to ensure DOM has rendered
      restoreScroll({ delay: 100 })
    }
  }, [loading, results])

  const handleProductClick = (id) => {
    saveScroll()
    navigate(`/product/${id}`)
  }

  return (
    <div>
      <Filters onFilterChange={saveScroll} />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="results-grid">
          {results.map(product => (
            <ProductCard 
              key={product.id}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Category Page with Dynamic Content
// ============================================================================

/**
 * Category page that handles different categories with separate scroll memory.
 * Each category maintains its own scroll position.
 */
export function CategoryPageExample() {
  const { category } = useParams()
  const navigate = useNavigate()
  
  // Use category-specific key for separate scroll positions
  const scrollKey = `category-${category}`
  const { saveScroll, restoreScroll } = useScrollRestoration(scrollKey)
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch products for category
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      const data = await fetchCategoryProducts(category)
      setProducts(data)
      setLoading(false)
    }
    loadProducts()
  }, [category])

  // Restore scroll after products load
  useEffect(() => {
    if (!loading && products.length > 0) {
      restoreScroll({ delay: 100 })
    }
  }, [loading, products, category])

  const handleProductClick = (id) => {
    saveScroll()
    navigate(`/product/${id}`)
  }

  return (
    <div>
      <h1>Category: {category}</h1>
      {products.map(product => (
        <ProductCard 
          key={product.id}
          onClick={() => handleProductClick(product.id)}
        />
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Infinite Scroll List
// ============================================================================

/**
 * Infinite scroll product list that preserves scroll position
 * even as more products are loaded.
 */
export function InfiniteScrollExample() {
  const { saveScroll, restoreScroll } = useScrollRestoration('infinite-scroll')
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Initial load
  useEffect(() => {
    loadInitialProducts()
  }, [])

  const loadInitialProducts = async () => {
    const data = await fetchProducts(1)
    setProducts(data)
    // Restore scroll after initial load
    restoreScroll({ delay: 200 })
  }

  const loadMore = async () => {
    if (!hasMore) return
    const nextPage = page + 1
    const data = await fetchProducts(nextPage)
    
    if (data.length === 0) {
      setHasMore(false)
    } else {
      setProducts(prev => [...prev, ...data])
      setPage(nextPage)
    }
  }

  const handleProductClick = (id) => {
    saveScroll() // Save scroll including dynamically loaded content
    navigate(`/product/${id}`)
  }

  return (
    <div>
      <InfiniteScroll
        dataLength={products.length}
        next={loadMore}
        hasMore={hasMore}
      >
        {products.map(product => (
          <ProductCard 
            key={product.id}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </InfiniteScroll>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Back to Top Button
// ============================================================================

/**
 * Custom "Back to Top" button using the scroll utility.
 */
export function BackToTopButton() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    scrollToTop({ smooth: true }) // Smooth scroll to top
  }

  if (!showButton) return null

  return (
    <button 
      className="back-to-top"
      onClick={handleClick}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  )
}

// ============================================================================
// EXAMPLE 6: Logout with Cleanup
// ============================================================================

/**
 * Logout handler that clears all scroll positions.
 * Good practice to clear user data on logout.
 */
export function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    // Clear all saved scroll positions
    clearAllScrollPositions()
    
    // Perform logout
    await logout()
    
    // Navigate to home
    navigate('/')
    
    // Scroll to top
    scrollToTop()
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}

// ============================================================================
// EXAMPLE 7: Modal/Dialog Navigation
// ============================================================================

/**
 * Opening a modal should not scroll, but returning should restore position.
 */
export function ProductListWithModal() {
  const { saveScroll } = useScrollRestoration('products-modal')
  const [modalProduct, setModalProduct] = useState(null)

  const handleQuickView = (product) => {
    saveScroll() // Save before opening modal
    setModalProduct(product)
  }

  const handleCloseModal = () => {
    setModalProduct(null)
    // Scroll position automatically restored by ScrollToTop component
  }

  const handleViewFullProduct = (id) => {
    saveScroll()
    navigate(`/product/${id}`)
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product.id}
          onQuickView={() => handleQuickView(product)}
          onClick={() => handleViewFullProduct(product.id)}
        />
      ))}
      
      {modalProduct && (
        <Modal onClose={handleCloseModal}>
          <ProductQuickView product={modalProduct} />
        </Modal>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 8: Pagination with Scroll Restoration
// ============================================================================

/**
 * Paginated list that scrolls to top when changing pages,
 * but restores position when using back button.
 */
export function PaginatedProductList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  const { saveScroll, restoreScroll } = useScrollRestoration('paginated-list')
  const [products, setProducts] = useState([])

  // Load products for current page
  useEffect(() => {
    const loadPage = async () => {
      const data = await fetchProducts(page)
      setProducts(data)
      // Restore scroll after products load
      restoreScroll({ delay: 100 })
    }
    loadPage()
  }, [page])

  const handlePageChange = (newPage) => {
    saveScroll()
    navigate(`/products?page=${newPage}`)
  }

  const handleProductClick = (id) => {
    saveScroll()
    navigate(`/product/${id}`)
  }

  return (
    <div>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </div>
      
      <Pagination 
        currentPage={page}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 9: Checking Scroll Position
// ============================================================================

/**
 * Component that displays saved scroll information (for debugging).
 */
export function ScrollDebugger() {
  const location = useLocation()
  const { getScroll } = useScrollRestoration(location.pathname)
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const updateInfo = () => {
      const savedScroll = getScroll()
      const currentScroll = window.scrollY
      
      setDebugInfo({
        pathname: location.pathname,
        currentScroll,
        savedScroll,
        hasSavedPosition: savedScroll !== null,
        difference: savedScroll ? Math.abs(currentScroll - savedScroll) : null
      })
    }

    updateInfo()
    window.addEventListener('scroll', updateInfo)
    return () => window.removeEventListener('scroll', updateInfo)
  }, [location.pathname])

  return (
    <div className="scroll-debugger">
      <h4>Scroll Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

// Mock API functions (replace with actual API calls)
const fetchProducts = async (page) => { /* ... */ }
const searchProducts = async (filters) => { /* ... */ }
const fetchCategoryProducts = async (category) => { /* ... */ }

// Example data
const products = [
  { id: 1, name: 'Product 1', price: 29.99 },
  { id: 2, name: 'Product 2', price: 39.99 },
  // ... more products
]
