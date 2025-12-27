import './App.css'
import { useLayoutEffect, useEffect } from 'react'
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

// ULTRA-AGGRESSIVE Scroll to top - FORCES page to absolute top
function ScrollToTop() {
  const { pathname, search } = useLocation()

  // Completely disable browser scroll restoration
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    // Disable smooth scrolling globally
    document.documentElement.style.scrollBehavior = 'auto'
  }, [])

  useLayoutEffect(() => {
    // FORCE IMMEDIATE SCROLL TO ABSOLUTE TOP - MAXIMUM AGGRESSION
    const forceScrollToTop = () => {
      // Method 1: window.scrollTo with multiple signatures
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.scrollTo(0, 0)
      window.scroll(0, 0)
      
      // Method 2: Direct manipulation of scroll properties
      window.pageXOffset = 0
      window.pageYOffset = 0
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
      document.body.scrollTop = 0
      document.body.scrollLeft = 0
      
      // Method 3: Force via style
      document.documentElement.style.scrollBehavior = 'auto'
      
      // Method 4: Scroll on main container
      const root = document.getElementById('root')
      if (root) {
        root.scrollTop = 0
      }
    }
    
    // Execute immediately - 10 times to override everything
    for (let i = 0; i < 10; i++) {
      forceScrollToTop()
    }
    
    // Execute via requestAnimationFrame - multiple times
    requestAnimationFrame(forceScrollToTop)
    requestAnimationFrame(() => requestAnimationFrame(forceScrollToTop))
    
    // Execute with multiple delays to catch any layout changes
    const timers = [
      setTimeout(forceScrollToTop, 1),
      setTimeout(forceScrollToTop, 5),
      setTimeout(forceScrollToTop, 10),
      setTimeout(forceScrollToTop, 20),
      setTimeout(forceScrollToTop, 50),
      setTimeout(forceScrollToTop, 100),
      setTimeout(forceScrollToTop, 150),
      setTimeout(forceScrollToTop, 200),
      setTimeout(forceScrollToTop, 300),
      setTimeout(forceScrollToTop, 500)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [pathname, search])

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
