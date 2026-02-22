import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiGet } from '../services/apiClient'

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const ordersRef = useRef(null) // Cache orders
  
  // Get filters from URL
  const status = searchParams.get('status') || 'all'
  const sortBy = searchParams.get('sort') || 'recent'
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const itemsPerPage = 10

  // Fetch orders - with caching
  useEffect(() => {
    let mounted = true
    
    // Use cached data if available
    if (ordersRef.current) {
      processOrders(ordersRef.current)
      setLoading(false)
      return
    }
    
    const load = async () => {
      setLoading(true)
      try {
        const data = await apiGet('/orders')
        // handle common response shapes
        const list = Array.isArray(data) ? data : (data.orders || data.data || data)
        const normalized = Array.isArray(list) ? list : (list?.orders || list?.data || [])
        const ordersList = Array.isArray(normalized) ? normalized : (Array.isArray(list) ? list : [])
        
        if (!mounted) return
        
        // Cache the orders
        ordersRef.current = ordersList
        processOrders(ordersList)
      } catch (e) {
        console.error('Failed to load orders', e)
        if (e && (e.status === 401 || e.code === 'UNAUTHORIZED')) {
          navigate('/login')
          return
        }
        const msg = e?.error || e?.message || JSON.stringify(e)
        setError(msg || 'Failed to load orders')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [navigate])

  // Process and filter orders based on URL params
  const processOrders = (allOrders) => {
    let filtered = allOrders
    
    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(o => (o.status || 'pending').toLowerCase() === status.toLowerCase())
    }
    
    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || a.orderDate) - new Date(b.createdAt || b.orderDate))
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.subtotal || b.total || 0) - (a.subtotal || a.total || 0))
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.subtotal || a.total || 0) - (b.subtotal || b.total || 0))
    }
    
    setOrders(filtered)
  }

  // Update URL when filters change
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    navigate(`?${params.toString()}`, { replace: true })
  }

  if (loading) return <div className="p-8">Loading your orders...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!orders || orders.length === 0) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-2">No orders found</h2>
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="inline-block px-6 py-2 bg-black text-white rounded-lg">Shop now</Link>
        </div>
      </div>
    </div>
  )

  const formatCurrency = (v) => (v == null ? '₹0.00' : `₹${Number(v).toFixed(2)}`)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li className="before:content-['>'] before:mx-2">My Orders</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} order(s)</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={status}
              onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>

          {(status !== 'all' || sortBy !== 'recent') && (
            <button
              onClick={() => updateFilters({ status: 'all', sort: 'recent' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="space-y-6">
          {orders.map(order => {
            const created = new Date(order.createdAt || order.orderDate || order.placedAt || Date.now())
            const subtotal = order.subtotal || order.total || order.totalAmount || order.amount || 0
            const items = order.items || []
            // pick first product image as cover
            const cover = items[0] && (items[0].image || items[0].imageUrl || (items[0].product && (items[0].product.image || (items[0].product.images && items[0].product.images[0]))))
            return (
              <article key={order._id || order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/orders/${order._id || order.id}`)} role="button">
                <div className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <div className="w-28 h-20 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                      {cover ? (
                        <img src={cover} alt={items[0]?.name || 'product'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-400">No image</div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Order ID</div>
                        <div className="font-mono font-medium mb-1">{order._id || order.id}</div>
                        <div className="text-sm text-gray-600">Placed on {created.toLocaleString()}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold">{formatCurrency(subtotal)}</div>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {order.isTrial && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest leading-none">TRIAL & BUY</span>
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{(order.status || 'pending').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex -space-x-2">
                        {(order.isTrial && order.trialItems && order.trialItems.length > 0 ? order.trialItems : items).slice(0,3).map((it, i) => {
                          const prod = it.product || {}
                          const thumb = it.image || it.imageUrl || prod.image || (prod.images && prod.images[0])
                          return (
                            <div key={i} className={`w-10 h-10 bg-white rounded overflow-hidden border ${order.isTrial ? 'border-black' : ''}`}>
                              {thumb ? <img src={thumb} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No</div>}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {order.isTrial 
                            ? `Trial Package: ${(order.trialItems || []).map(i => i.name).join(', ')}`
                            : items[0]?.name || (items[0] && items[0].product && items[0].product.name) || `${items.length} items`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.isTrial ? (order.trialItems?.length || 0) : items.length} item(s) 
                          {!order.isTrial && ` • ${items.slice(0,2).map(it => it.name || (it.product && it.product.name)).filter(Boolean).join(' • ')}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
