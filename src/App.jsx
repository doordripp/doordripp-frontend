import './App.css'
import { useEffect, useRef, useLayoutEffect } from 'react'
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
import LiveOrderTracking from './components/tracking/LiveOrderTracking'
import NewArrivalsPage from './pages/NewArrivals'
import BestSellersPage from './pages/BestSellers'
import About from './pages/About'
import Features from './pages/Features'
import Works from './pages/Works'
import Career from './pages/Career'
import Support from './pages/Support'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import DeliveryDetails from './pages/DeliveryDetails'
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
  AdminVouchers,
  AdminDeliveryZones, 
  AdminCategories 
} from './pages/admin'
import AddProduct from './features/admin/products/AddProduct'
import { ROLES } from './utils/roleUtils'

// Component to sync wishlist when user logs in/out
function WishlistSyncHandler() {
  const { user, initializing } = useAuth()
  const { syncWishlist, clearWishlist } = useWishlist()

  useEffect(() => {
    // Wait for auth initialization to complete
    if (initializing) return
    
    if (user) {
      // Sync wishlist when user logs in
      syncWishlist()
    } else {
      // Clear wishlist when user logs out
      clearWishlist()
    }
  }, [user, initializing, syncWishlist, clearWishlist])

  return null
}

/**
 * Professional Scroll Restoration System
 * 
 * Implements Amazon/Flipkart-style scroll behavior:
 * - Forward navigation (clicking links) → Scroll to top IMMEDIATELY
 * - Back button (browser back) → Restore previous scroll position
 * 
 * Uses useLayoutEffect for synchronous execution before browser paint
 * 
 * @returns {null} This component doesn't render anything
 */
function ScrollRestoration() {
  const { pathname, search, key } = useLocation()
  const scrollPositions = useRef({})
  const lastLocationKey = useRef(key)
  const isRestoringScroll = useRef(false)

  // Setup - disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Scroll handler - runs BEFORE paint for immediate effect
  useLayoutEffect(() => {
    const routeKey = `${pathname}${search}`
    const locationChanged = lastLocationKey.current !== key

    if (!locationChanged) return

    const scrollToPosition = (y) => {
      window.scrollTo(0, y)
      document.documentElement.scrollTop = y
      document.body.scrollTop = y
    }

    // Check if this is a back/forward navigation
    const isBackOrForward = 
      window.performance?.navigation?.type === 2 || // TYPE_BACK_FORWARD
      window.performance?.getEntriesByType?.('navigation')[0]?.type === 'back_forward'

    if (isBackOrForward && scrollPositions.current[routeKey] !== undefined) {
      // BACK/FORWARD: Restore saved position
      const savedPosition = scrollPositions.current[routeKey]
      isRestoringScroll.current = true
      
      scrollToPosition(savedPosition)
      requestAnimationFrame(() => scrollToPosition(savedPosition))
      setTimeout(() => scrollToPosition(savedPosition), 10)
      setTimeout(() => scrollToPosition(savedPosition), 50)
      setTimeout(() => {
        scrollToPosition(savedPosition)
        isRestoringScroll.current = false
      }, 100)
    } else {
      // FORWARD NAVIGATION: Save current position and scroll to top
      if (lastLocationKey.current) {
        const lastRouteKey = `${window.location.pathname}${window.location.search}`
        scrollPositions.current[lastRouteKey] = window.scrollY
      }

      // Scroll to top IMMEDIATELY (before paint)
      scrollToPosition(0)
    }

    lastLocationKey.current = key
  }, [pathname, search, key])

  // Additional scroll-to-top enforcement after DOM updates
  useEffect(() => {
    if (isRestoringScroll.current) return

    const scrollToTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Multiple checkpoints to handle async content
    scrollToTop()
    requestAnimationFrame(scrollToTop)
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 10)
    setTimeout(scrollToTop, 50)
    setTimeout(scrollToTop, 100)
    setTimeout(scrollToTop, 200)
    
    // Wait for images to load and scroll to top again
    const images = document.querySelectorAll('img[src]')
    if (images.length > 0) {
      let loadedCount = 0
      const totalImages = Math.min(images.length, 10) // Only check first 10 images
      
      const onImageLoad = () => {
        loadedCount++
        scrollToTop()
        if (loadedCount >= totalImages) {
          scrollToTop()
        }
      }
      
      images.forEach((img, index) => {
        if (index >= 10) return // Skip after 10 images
        if (img.complete) {
          onImageLoad()
        } else {
          img.addEventListener('load', onImageLoad, { once: true })
          img.addEventListener('error', onImageLoad, { once: true })
        }
      })
    }
    
    // Final safety scroll after all content loads
    setTimeout(scrollToTop, 500)
    setTimeout(scrollToTop, 1000)
  }, [pathname, search])

  return null
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <TrialProvider>
              <ScrollRestoration />
              <WishlistSyncHandler />
            <Routes>
              {/* Admin Routes - Separate layout */}
              <Route path="/admin" element={
                <RoleBasedRoute requiredRole={[ROLES.ADMIN, 'delivery_partner']}>
                  <AdminLayout />
                </RoleBasedRoute>
              }>
                <Route index element={<AdminOrders />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="vouchers" element={<AdminVouchers />} />
                <Route path="delivery-zones" element={<AdminDeliveryZones />} />
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
                      <Route path="/order/:orderId/track" element={<LiveOrderTracking />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/works" element={<Works />} />
                      <Route path="/career" element={<Career />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsAndConditions />} />
                      <Route path="/delivery" element={<DeliveryDetails />} />
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
