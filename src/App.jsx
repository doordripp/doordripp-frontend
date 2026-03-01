import './App.css'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './components/navigation'
import { Footer, Newsletter } from './layout'
import { CartDrawer } from './features/cart'
import { CartProvider } from './context/CartContext'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TrialProvider } from './context/TrialContext'
import { AdminProvider } from './context/AdminContext'
import { TrialModal } from './features/trial'
import { TrialFloatingButton } from './features/trial/TrialFloatingButton'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Products from './pages/Products'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import NewArrivalsPage from './pages/NewArrivals'
import BestSellersPage from './pages/BestSellers'
import About from './pages/About'
import Features from './pages/Features'
import Works from './pages/Works'
import Career from './pages/Career'
import Support from './pages/Support'
import TrialPage from './features/trial/TrialPage'
import RoleBasedRoute from './features/auth/RoleBasedRoute'
import AuthenticatedRoute from './features/auth/AuthenticatedRoute'
import AdminLayout from './layout/AdminLayout'
import { 
  AdminDashboard, 
  AdminProducts, 
  AdminOrders, 
  AdminUsers, 
  AdminCustomers, 
  AdminReports, 
  AdminDeliveryZones, 
  AdminBanners,
  AdminCategories 
} from './pages/admin'
import AddProduct from './features/admin/products/AddProduct'
import { ROLES } from './utils/roleUtils'

// Component to sync wishlist when user logs in/out
function WishlistSyncHandler() {
  const { user } = useAuth()
  const { syncWishlist, clearWishlist } = useWishlist()

  useEffect(() => {
    if (user) {
      // Sync wishlist when user logs in
      syncWishlist()
    } else {
      // Clear wishlist when user logs out
      clearWishlist()
    }
  }, [user, syncWishlist, clearWishlist])

  return null
}

/**
 * Production-Ready Scroll Restoration Component
 * 
 * Implements Amazon-like scroll behavior:
 * - Forward navigation: Scroll to top
 * - Back/Forward buttons: Restore previous scroll position
 * - Uses sessionStorage for persistence
 * - Handles edge cases and cleanup
 * 
 * @returns {null} This component doesn't render anything
 */
function ScrollToTop() {
  const { pathname, key } = useLocation()
  const isBackNavigationRef = useRef(false)
  const lastPathnameRef = useRef(pathname)
  const lastKeyRef = useRef(key)

  // Initialize scroll restoration on mount
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Listen for browser back/forward button navigation
    const handlePopState = () => {
      isBackNavigationRef.current = true
    }

    window.addEventListener('popstate', handlePopState)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState)
      // Restore browser's default behavior on unmount
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  // Handle scroll position save and restore on route change
  useEffect(() => {
    const scrollStorageKey = `doordripp_scroll_${lastPathnameRef.current}`
    
    // Save scroll position before leaving current page
    if (lastPathnameRef.current !== pathname) {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      
      try {
        sessionStorage.setItem(scrollStorageKey, currentScrollY.toString())
        // Optional: Store timestamp for cache invalidation
        sessionStorage.setItem(`${scrollStorageKey}_time`, Date.now().toString())
      } catch {
        // Handle sessionStorage quota exceeded or disabled
        console.warn('Failed to save scroll position')
      }
    }

    // Determine if this is back/forward navigation
    const isBackOrForward = isBackNavigationRef.current

    if (isBackOrForward) {
      // BACK/FORWARD NAVIGATION: Restore scroll position
      const savedScrollKey = `doordripp_scroll_${pathname}`
      const savedScroll = sessionStorage.getItem(savedScrollKey)
      
      if (savedScroll) {
        const scrollPosition = parseInt(savedScroll, 10)
        
        // Use multiple timing strategies to ensure scroll restoration works
        // Immediate attempt
        window.scrollTo(0, scrollPosition)
        
        // Delayed attempt after DOM render
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, left: 0, behavior: 'auto' })
        })
        
        // Final attempt for slow-loading content
        setTimeout(() => {
          const currentScroll = window.scrollY || window.pageYOffset
          // Only scroll if we haven't reached the target position
          if (Math.abs(currentScroll - scrollPosition) > 10) {
            window.scrollTo({ top: scrollPosition, left: 0, behavior: 'auto' })
          }
        }, 100)
      } else {
        // No saved position, scroll to top
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
      
      // Reset back navigation flag
      isBackNavigationRef.current = false
    } else {
      // FORWARD NAVIGATION: Scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      
      // Ensure scroll to top happens after render
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    }

    // Update refs for next navigation
    lastPathnameRef.current = pathname
    lastKeyRef.current = key
  }, [pathname, key])

  // Cleanup old scroll positions from sessionStorage
  useEffect(() => {
    try {
      const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
      const now = Date.now()
      
      // Check and clean up old entries on mount
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('doordripp_scroll_') && key.endsWith('_time')) {
          const timestamp = parseInt(sessionStorage.getItem(key) || '0', 10)
          if (now - timestamp > CACHE_DURATION) {
            const scrollKey = key.replace('_time', '')
            sessionStorage.removeItem(scrollKey)
            sessionStorage.removeItem(key)
          }
        }
      })
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }, [])

  return null
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <TrialProvider>
              <ScrollToTop />
              <WishlistSyncHandler />
            <Routes>
              {/* Admin Routes - Separate layout */}
              <Route path="/admin" element={
                <RoleBasedRoute requiredRole={ROLES.ADMIN}>
                  <AdminLayout />
                </RoleBasedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="delivery-zones" element={<AdminDeliveryZones />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="categories" element={<AdminCategories />} />
              </Route>

              {/* Main App Routes */}
              <Route path="/*" element={
                <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
                  <Navbar />
                  <main className="flex-1 w-full px-0 py-0 overflow-x-hidden">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                      <Route path="/best-sellers" element={<BestSellersPage />} />
                      <Route path="/category" element={<CategoryPage />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/trial-room" element={<TrialPage />} />
                      <Route path="/login" element={<AuthenticatedRoute><Login /></AuthenticatedRoute>} />
                      <Route path="/signup" element={<AuthenticatedRoute><Signup /></AuthenticatedRoute>} />
                      <Route path="/verify-email" element={<AuthenticatedRoute><VerifyEmail /></AuthenticatedRoute>} />
                      <Route path="/forgot-password" element={<AuthenticatedRoute><ForgotPassword /></AuthenticatedRoute>} />
                      <Route path="/reset-password" element={<AuthenticatedRoute><ResetPassword /></AuthenticatedRoute>} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderConfirmation />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/works" element={<Works />} />
                      <Route path="/career" element={<Career />} />
                      <Route path="/support" element={<Support />} />
                    </Routes>
                  </main>
                  {/* Global Newsletter Section - Appears on all pages */}
                  <Newsletter />
                  {/* Global Footer - Appears on all pages */}
                  <Footer />
                  
                  {/* Global Cart Drawer - Available on all pages */}
                  <CartDrawer />
                  
                  {/* Global Trial Modal - Available on all pages */}
                  <TrialModal />
                  <TrialFloatingButton />
                </div>
              } />
            </Routes>
            </TrialProvider>
          </WishlistProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    )
  }

export default App
