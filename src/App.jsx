import './App.css'
import { useLayoutEffect, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './components/navigation'
import { Footer, Newsletter } from './layout'
import { CartDrawer } from './features/cart'
import { CartProvider } from './context/CartContext'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
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
import RoleBasedRoute from './features/auth/RoleBasedRoute'
import AdminLayout from './layout/AdminLayout'
import { AdminDashboard, AdminProducts, AdminOrders, AdminUsers, AdminCustomers, AdminReports, AdminDeliveryZones } from './pages/admin'
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
 * Smart scroll restoration component
 * - Preserves scroll for back navigation
 * - Scrolls to top only for forward navigation
 * - Respects user's scroll intent
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  const lastPathnameRef = useRef(pathname)
  const scrollPositionsRef = useRef(new Map())

  useLayoutEffect(() => {
    // Enable browser's native scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto'
    }
  }, [])

  // Save scroll position before leaving page
  useEffect(() => {
    return () => {
      const scrollPos = window.scrollY
      scrollPositionsRef.current.set(lastPathnameRef.current, scrollPos)
    }
  }, [pathname])

  // Restore or reset scroll on route change
  useLayoutEffect(() => {
    // If we have a saved scroll position for this route, restore it (back navigation)
    const savedPosition = scrollPositionsRef.current.get(pathname)
    
    if (savedPosition !== undefined && savedPosition > 0) {
      // Back navigation - restore scroll position
      window.scrollTo({ top: savedPosition, left: 0, behavior: 'auto' })
    } else {
      // Forward navigation - scroll to top (but only once, not aggressively)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    lastPathnameRef.current = pathname
  }, [pathname])

  return null
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
              </div>
            } />
          </Routes>
        </WishlistProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
