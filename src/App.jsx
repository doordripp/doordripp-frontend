import './App.css'
import { Navbar } from './components/navigation'
import { Footer, Newsletter } from './layout'
import { CartDrawer } from './features/cart'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
import RequireAdmin from './components/RequireAdmin'
import AdminLayout from './layout/AdminLayout'
import { AdminDashboard, AdminProducts, AdminOrders, AdminUsers } from './pages/admin'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Products from './pages/Products'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import NewArrivalsPage from './pages/NewArrivals'
import BestSellersPage from './pages/BestSellers'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full px-0 py-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="/products/best-sellers" element={<BestSellersPage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            {/* Admin routes */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminProvider>
                  <AdminLayout />
                </AdminProvider>
              </RequireAdmin>
            }>
              <Route index element={<AdminDashboard/>} />
              <Route path="products" element={<AdminProducts/>} />
              <Route path="orders" element={<AdminOrders/>} />
              <Route path="users" element={<AdminUsers/>} />
            </Route>
          </Routes>
        </main>
        {/* Global Newsletter Section - Appears on all pages */}
        <Newsletter />
        {/* Global Footer - Appears on all pages */}
        <Footer />
        
        {/* Global Cart Drawer - Available on all pages */}
        <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
