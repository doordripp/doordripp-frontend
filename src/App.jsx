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
  AdminDeliveryZones, 
  AdminBanners,
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
 * Global Scroll to Top Component
 * 
 * Scrolls to top on every page navigation
 * Simple and reliable - no conflicts with individual page implementations
 * 
 * @returns {null} This component doesn't render anything
 */
function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Scroll to top immediately on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // Double-check after DOM updates
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
    
    // Final fallback for slow-loading content
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 100)

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
              <ScrollToTop />
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
