import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiPost, apiPut, apiGet } from '../services/apiClient'
import { useWishlist } from '../context/WishlistContext'

export default function Profile() {
  const { user, logout, fetchMe } = useAuth()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(user?.avatar || null)
  const [uploading, setUploading] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState(user?.phone || '')
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressInput, setAddressInput] = useState(user?.address || { street: '', city: '', state: '', zip: '' })
  
  const [editingPassword, setEditingPassword] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false })
  const [passwordModal, setPasswordModal] = useState({ open: false, type: 'success', message: '' })
  const addressText = '—'

  // Check if user is admin
  const isAdmin = user?.roles && Array.isArray(user.roles) 
    ? user.roles.some(r => r.toUpperCase() === 'ADMIN')
    : false

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin')
    }
  }, [isAdmin, navigate])

  // sync editable inputs when user changes
  useEffect(() => {
    setPhoneInput(user?.phone || '')
    setAddressInput(user?.address || { street: '', city: '', state: '', zip: '' })
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const { items: wishlistItems, totalItems: wishlistCount, syncWishlist } = useWishlist()
  const [ordersCount, setOrdersCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    // fetch orders count for badge
    let mounted = true
    const load = async () => {
      try {
        setOrdersLoading(true)
        const data = await apiGet('/orders')
        const list = Array.isArray(data) ? data : (data?.orders || data?.data || [])
        if (mounted) {
              setOrdersCount(list.length)
              // sort orders newest-first by createdAt / placedAt
              const sorted = list.slice().sort((a, b) => new Date(b.createdAt || b.placedAt || b.orderDate || 0) - new Date(a.createdAt || a.placedAt || a.orderDate || 0))
              // show most recent 3 orders
              setRecentOrders(sorted.slice(0, 3))
            }
      } catch (e) {
        // ignore
      } finally {
        setOrdersLoading(false)
      }
    }
    load()
    // also ensure wishlist is synced
    syncWishlist().catch(() => {})
    return () => { mounted = false }
  }, [syncWishlist])

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
    // upload immediately
    uploadAvatarFromFile(file)
  }

  const uploadAvatarFromFile = async (file) => {
    try {
      setUploading(true)
      const reader = new FileReader()
      const p = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      // send base64 data URL to backend
      const res = await apiPost('/auth/avatar', { avatar: p })
      // refresh user from server
      await fetchMe()
      setUploading(false)
    } catch (e) {
      console.error('Upload failed', e)
      setUploading(false)
    }
  }

  const savePhone = async () => {
    try {
      await apiPut('/auth/profile', { phone: phoneInput })
      await fetchMe()
      setEditingPhone(false)
    } catch (e) {
      console.error('Failed to save phone', e)
      alert(e?.error?.message || e?.message || 'Failed to save phone')
    }
  }

  const saveAddress = async () => {
    try {
      await apiPut('/auth/profile', { address: addressInput })
      await fetchMe()
      setEditingAddress(false)
    } catch (e) {
      console.error('Failed to save address', e)
      alert(e?.error?.message || e?.message || 'Failed to save address')
    }
  }

  const savePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordModal({ open: true, type: 'error', message: 'Please fill both fields.' })
      return
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordModal({ open: true, type: 'error', message: 'New passwords do not match.' })
      return
    }
    try {
      await apiPut('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setEditingPassword(false)
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
      setPasswordModal({ open: true, type: 'success', message: 'Password changed successfully.' })
    } catch (e) {
      console.error('Failed to change password', e)
      setPasswordModal({ open: true, type: 'error', message: e?.error || e?.message || 'Failed to change password.' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="max-w-md w-full text-center space-y-3">
          <h2 className="text-2xl font-bold">Not signed in</h2>
          <p className="text-sm text-gray-600">Please sign in to view your profile.</p>
          <Link
            to="/login"
            className="inline-block bg-black text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-900 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 auth-entry">
          <h1 className="brand-title text-4xl">My Account</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your profile and preferences</p>
        </div>
        <div className="profile-card p-6 hover-lift max-w-4xl mx-auto bg-white rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row gap-6">
            <aside className="profile-sidebar p-6 rounded-lg bg-gray-50 w-full sm:w-72 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="avatar-shell">
                  {preview ? (
                    <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-sm">A</div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <div className="font-semibold text-lg">{user.name || '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">{user.email || '—'}</div>
                </div>
                <label className="mt-4 btn-upload cursor-pointer inline-flex items-center gap-2">
                  {uploading ? (
                    <>
                      <span>Uploading</span>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </>
                  ) : (
                    <span className="text-sm text-gray-700">Change Photo</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <nav className="mt-6">
                <ul className="space-y-2">
                  <li>
                    <Link to="/profile" className="menu-item block flex justify-between items-center">
                      <span>📋 My Profile</span>
                      <span className="text-xs text-gray-500"> </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="menu-item block flex justify-between items-center">
                      <span>♡ My Wishlist</span>
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">{wishlistCount || 0}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="menu-item block flex justify-between items-center">
                      <span>🧾 My Orders</span>
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">{ordersCount || 0}</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="menu-item menu-logout block text-left w-full">⎋ Logout</button>
                  </li>
                </ul>
              </nav>
            </aside>

            <section className="flex-1 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="info-item-label">Name</div>
                  <div className="info-item-value">{user.name || '—'}</div>
                </div>
                <div>
                  <div className="info-item-label">Email</div>
                  <div className="info-item-value">{user.email || '—'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="info-item-label">Phone</div>
                      <div className="info-item-value">{user.phone || '—'}</div>
                    </div>
                    <div>
                      {editingPhone ? (
                        <div className="space-x-2">
                          <input className="border px-2 py-1 rounded-md" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} />
                          <button className="btn-danger" onClick={savePhone}>Save</button>
                          <button className="menu-item" onClick={() => { setEditingPhone(false); setPhoneInput(user?.phone || '') }}>Cancel</button>
                        </div>
                      ) : (
                        <button className="menu-item" onClick={() => setEditingPhone(true)}>Change</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="info-item-label">Address</div>
                  <div className="info-item-value mb-3">{user?.address ? [user.address.street, user.address.city, user.address.state, user.address.zip].filter(Boolean).join(', ') : '—'}</div>
                  {editingAddress ? (
                    <div className="space-y-2">
                      <input placeholder="Street" className="w-full border px-2 py-1 rounded-md" value={addressInput.street || ''} onChange={e => setAddressInput(prev => ({ ...prev, street: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="City" className="border px-2 py-1 rounded-md" value={addressInput.city || ''} onChange={e => setAddressInput(prev => ({ ...prev, city: e.target.value }))} />
                        <input placeholder="State" className="border px-2 py-1 rounded-md" value={addressInput.state || ''} onChange={e => setAddressInput(prev => ({ ...prev, state: e.target.value }))} />
                      </div>
                      <input placeholder="ZIP" className="w-32 border px-2 py-1 rounded-md" value={addressInput.zip || ''} onChange={e => setAddressInput(prev => ({ ...prev, zip: e.target.value }))} />
                      <div className="flex gap-2 mt-2">
                        <button className="btn-danger" onClick={saveAddress}>Save Address</button>
                        <button className="btn-ghost" onClick={() => { setEditingAddress(false); setAddressInput(user?.address || { street: '', city: '', state: '', zip: '' }) }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button className="menu-item menu-item-highlight" onClick={() => setEditingAddress(true)}>Change Address</button>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <div className="info-item-label">Account Security</div>
                  <div>
                    {editingPassword ? (
                      <div className="space-y-3">
                        <div className="relative max-w-xs">
                          <input
                            type={passwordVisibility.current ? 'text' : 'password'}
                            placeholder="Current password"
                            className="w-full h-9 border px-3 pr-10 rounded-md text-sm"
                            value={passwords.currentPassword}
                            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setPasswordVisibility(v => ({ ...v, current: !v.current }))}
                          >
                            {passwordVisibility.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="relative max-w-xs">
                          <input
                            type={passwordVisibility.new ? 'text' : 'password'}
                            placeholder="New password"
                            className="w-full h-9 border px-3 pr-10 rounded-md text-sm"
                            value={passwords.newPassword}
                            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setPasswordVisibility(v => ({ ...v, new: !v.new }))}
                          >
                            {passwordVisibility.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="relative max-w-xs">
                          <input
                            type={passwordVisibility.confirm ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            className="w-full h-9 border px-3 pr-10 rounded-md text-sm"
                            value={passwords.confirm}
                            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setPasswordVisibility(v => ({ ...v, confirm: !v.confirm }))}
                          >
                            {passwordVisibility.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="btn-danger" onClick={savePassword}>Save Password</button>
                          <button className="menu-item" onClick={() => { setEditingPassword(false); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }) }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button className="menu-item menu-item-highlight" onClick={() => setEditingPassword(true)}>Change Password</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Wishlist preview & recent orders */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">My Wishlist</h3>
                    <Link to="/wishlist" className="text-sm text-blue-600">View all</Link>
                  </div>
                  {wishlistItems && wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {wishlistItems.slice(0,6).map((w, idx) => {
                        const pid = w._id || w.id || w.productId || (w.product && (w.product._id || w.product.id))
                        const img = w.image || w.imageUrl || w.imageURL || (w.product && (w.product.image || (w.product.images && w.product.images[0])))
                        return (
                          <Link key={pid || idx} to={`/product/${pid}`} className="group block">
                            <div className="w-full h-20 bg-gray-50 rounded-md overflow-hidden border flex items-center justify-center">
                              {img ? <img src={img} alt={w.name || 'wish'} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">No image</div>}
                            </div>
                            <div className="text-xs mt-2 line-clamp-2 text-gray-700">{w.name || (w.product && w.product.name) || 'Product'}</div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-600">No items in your wishlist yet.</div>
                  )}
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Recent Orders</h3>
                    <Link to="/orders" className="text-sm text-blue-600">View all</Link>
                  </div>
                  {ordersLoading ? (
                    <div className="p-6 text-sm text-gray-600">Loading recent orders...</div>
                  ) : recentOrders && recentOrders.length ? (
                    <ul className="space-y-3">
                      {recentOrders.map(o => (
                        <li key={o._id || o.id} className="flex items-center gap-3 p-3 border rounded-md">
                          <div className="flex -space-x-2">
                            {(o.items || []).slice(0,3).map((it, i) => {
                              const prod = it.product || {}
                              const thumb = it.image || it.imageUrl || prod.image || (prod.images && prod.images[0])
                              return (
                                <div key={i} className="w-10 h-10 bg-gray-50 rounded overflow-hidden border">
                                  {thumb ? <img src={thumb} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No</div>}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">Order <span className="font-mono text-xs">{o._id || o.id}</span></div>
                            <div className="text-xs text-gray-500 truncate">{new Date(o.createdAt || o.orderDate || o.placedAt || Date.now()).toLocaleDateString()} • {o.items?.length || 0} items</div>
                          </div>
                          <div className="w-28 flex-shrink-0 text-right">
                            <div className="text-sm font-semibold">{typeof (o.total || o.totalAmount || o.orderTotal) === 'number' ? `₹${(o.total || o.totalAmount || o.orderTotal).toFixed(2)}` : `₹${o.total || o.totalAmount || o.orderTotal || 0}`}</div>
                            <Link to={`/orders/${o._id || o.id}`} className="text-xs text-blue-600">View</Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-sm text-gray-600">No recent orders found.</div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>

      {passwordModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${passwordModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {passwordModal.type === 'success' ? '✓' : '!'}
            </div>
            <div className="text-lg font-semibold text-gray-900">{passwordModal.type === 'success' ? 'Password Updated' : 'Action Needed'}</div>
            <p className="text-sm text-gray-600">{passwordModal.message}</p>
            <button
              className="w-full btn-danger"
              onClick={() => setPasswordModal({ open: false, type: 'success', message: '' })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
