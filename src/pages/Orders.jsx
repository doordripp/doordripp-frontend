import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet } from '../services/apiClient'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await apiGet('/orders')
        // handle common response shapes
        const list = Array.isArray(data) ? data : (data.orders || data.data || data)
        // some endpoints wrap items under { orders: { data: [...] } }
        const normalized = Array.isArray(list) ? list : (list?.orders || list?.data || [])
        if (!mounted) return
        setOrders(Array.isArray(normalized) ? normalized : (Array.isArray(list) ? list : []))
      } catch (e) {
        console.error('Failed to load orders', e)
        // If unauthorized, redirect to login
        if (e && (e.status === 401 || e.code === 'UNAUTHORIZED')) {
          navigate('/login')
          return
        }
        // show backend error message when available
        const msg = e?.error || e?.message || JSON.stringify(e)
        setError(msg || 'Failed to load orders')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [navigate])

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

        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

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
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{(order.status || 'pending').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex -space-x-2">
                        {items.slice(0,3).map((it, i) => {
                          const prod = it.product || {}
                          const thumb = it.image || it.imageUrl || prod.image || (prod.images && prod.images[0])
                          return (
                            <div key={i} className="w-10 h-10 bg-white rounded overflow-hidden border">
                              {thumb ? <img src={thumb} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No</div>}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{items[0]?.name || (items[0] && items[0].product && items[0].product.name) || `${items.length} items`}</div>
                        <div className="text-xs text-gray-500">{items.length} item(s) • {items.slice(0,2).map(it => it.name || (it.product && it.product.name)).filter(Boolean).join(' • ')}</div>
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
